local ESX = exports['es_extended']:getSharedObject()

local cooldownPark = {}
local cooldownRetrieve = {}

local function trimPlate(p)
    if not p or type(p) ~= 'string' then
        return ''
    end
    return string.upper((p:gsub('^%s+', ''):gsub('%s+$', '')))
end

local function notifyPlayer(src, ntype, localeKey)
    local desc = ParkingLocale(localeKey)
    if Config.Notify == 'ox' then
        lib.notify(src, {
            title = Config.ServerName,
            description = desc,
            type = ntype,
            duration = 4500,
        })
    else
        local prefix = (ntype == 'success') and '~g~' or '~r~'
        TriggerClientEvent('esx:showNotification', src, prefix .. desc)
    end
end

local function isCoolingDown(tbl, src)
    local untilT = tbl[src]
    return untilT and GetGameTimer() < untilT
end

local function setCooldown(tbl, src, ms)
    tbl[src] = GetGameTimer() + (ms or 2000)
end

local function getLotByParkCoords(coords)
    local v = vector3(coords.x, coords.y, coords.z)
    for _, lot in ipairs(Config.ParkingLots) do
        if #(v - lot.park.coords) <= lot.park.radius then
            return lot
        end
    end
    return nil
end

local function getLotById(id)
    for _, lot in ipairs(Config.ParkingLots) do
        if lot.id == id then
            return lot
        end
    end
    return nil
end

local function countParked(identifier)
    local n = MySQL.scalar.await('SELECT COUNT(*) FROM parking_vehicles WHERE owner = ?', { identifier })
    return tonumber(n) or 0
end

local function ownsVehicle(identifier, plateNorm)
    local row = MySQL.single.await(
        'SELECT 1 AS ok FROM owned_vehicles WHERE owner = ? AND UPPER(TRIM(plate)) = ? LIMIT 1',
        { identifier, plateNorm }
    )
    return row ~= nil
end

local function kioskReachable(src, lot)
    local ped = GetPlayerPed(src)
    if ped == 0 then
        return false
    end
    local pcoords = GetEntityCoords(ped)
    local maxDist = Config.InteractDistance + Config.ServerKioskSlack
    return #(pcoords - lot.kiosk) <= maxDist
end

local function takeRetrieveFee(xPlayer)
    local fee = Config.RetrieveFee or 0
    if fee <= 0 then
        return true
    end
    local accName = Config.RetrieveAccount or 'bank'
    if accName == 'money' then
        local cash = xPlayer.getMoney()
        if cash < fee then
            return false
        end
        xPlayer.removeMoney(fee)
        return true
    end
    local acc = xPlayer.getAccount(accName)
    if not acc or acc.money < fee then
        return false
    end
    xPlayer.removeAccountMoney(accName, fee)
    return true
end

local function refundRetrieveFee(xPlayer)
    local fee = Config.RetrieveFee or 0
    if fee <= 0 then
        return
    end
    local accName = Config.RetrieveAccount or 'bank'
    if accName == 'money' then
        xPlayer.addMoney(fee)
    else
        xPlayer.addAccountMoney(accName, fee)
    end
end

MySQL.ready(function()
    MySQL.query([[CREATE TABLE IF NOT EXISTS `parking_vehicles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner` VARCHAR(60) NOT NULL,
  `plate` VARCHAR(12) NOT NULL,
  `vehicle` LONGTEXT NOT NULL,
  `lot_id` VARCHAR(64) NOT NULL,
  `park_x` DOUBLE NOT NULL,
  `park_y` DOUBLE NOT NULL,
  `park_z` DOUBLE NOT NULL,
  `park_heading` FLOAT NOT NULL,
  `parked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner` (`owner`),
  KEY `lot_id` (`lot_id`),
  KEY `plate` (`plate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;]])
end)

lib.callback.register('parking:getVehicles', function(source, lotId)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then
        return { ok = false }
    end

    if type(lotId) ~= 'string' then
        return { ok = false }
    end

    local lot = getLotById(lotId)
    if not lot then
        return { ok = false }
    end

    if not kioskReachable(src, lot) then
        return { ok = false }
    end

    local rows = MySQL.query.await(
        'SELECT id, plate, lot_id, parked_at, vehicle FROM parking_vehicles WHERE owner = ? ORDER BY parked_at DESC',
        { xPlayer.identifier }
    ) or {}

    local payload = {}
    for _, r in ipairs(rows) do
        local v = json.decode(r.vehicle)
        local model = 0
        if type(v) == 'table' and v.model then
            model = v.model
        end
        payload[#payload + 1] = {
            id = r.id,
            plate = r.plate,
            lotId = r.lot_id,
            parkedAt = r.parked_at,
            model = model,
        }
    end

    return { ok = true, vehicles = payload, lotId = lotId }
end)

RegisterNetEvent('parking:server:park', function(propsJson)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then
        return
    end

    if isCoolingDown(cooldownPark, src) then
        notifyPlayer(src, 'error', 'err_cooldown')
        return
    end

    if type(propsJson) ~= 'string' then
        return
    end

    if #propsJson > (Config.MaxVehiclePropsBytes or 16384) then
        notifyPlayer(src, 'error', 'err_invalid_data')
        return
    end

    local ped = GetPlayerPed(src)
    if ped == 0 then
        return
    end

    local veh = GetVehiclePedIsIn(ped, false)
    if veh == 0 then
        notifyPlayer(src, 'error', 'err_not_in_vehicle')
        return
    end

    if GetPedInVehicleSeat(veh, -1) ~= ped then
        notifyPlayer(src, 'error', 'err_not_driver')
        return
    end

    local coords = GetEntityCoords(ped)
    local lot = getLotByParkCoords({ x = coords.x, y = coords.y, z = coords.z })
    if not lot then
        notifyPlayer(src, 'error', 'err_not_in_zone')
        return
    end

    local plateSrv = trimPlate(GetVehicleNumberPlateText(veh))
    local props = json.decode(propsJson)
    if type(props) ~= 'table' or type(props.plate) ~= 'string' then
        notifyPlayer(src, 'error', 'err_invalid_data')
        return
    end

    if plateSrv ~= trimPlate(props.plate) then
        notifyPlayer(src, 'error', 'err_invalid_data')
        return
    end

    local entModel = GetEntityModel(veh)
    if props.model and tonumber(props.model) ~= tonumber(entModel) then
        notifyPlayer(src, 'error', 'err_invalid_data')
        return
    end

    local identifier = xPlayer.identifier
    if not ownsVehicle(identifier, plateSrv) then
        notifyPlayer(src, 'error', 'err_not_owner')
        return
    end

    if countParked(identifier) >= (Config.MaxParkedPerPlayer or 8) then
        notifyPlayer(src, 'error', 'err_limit')
        return
    end

    local dup = MySQL.single.await('SELECT id FROM parking_vehicles WHERE UPPER(TRIM(plate)) = ? LIMIT 1', { plateSrv })
    if dup then
        notifyPlayer(src, 'error', 'err_already_parked')
        return
    end

    local heading = GetEntityHeading(veh)
    local vx, vy, vz = table.unpack(GetEntityCoords(veh))

    MySQL.insert.await(
        'INSERT INTO parking_vehicles (owner, plate, vehicle, lot_id, park_x, park_y, park_z, park_heading) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        { identifier, plateSrv, propsJson, lot.id, vx, vy, vz, heading }
    )

    local netId = NetworkGetNetworkIdFromEntity(veh)
    TriggerClientEvent('parking:client:deleteVehicle', src, netId)
    setCooldown(cooldownPark, src, Config.CooldownParkMs or 2500)
    notifyPlayer(src, 'success', 'success_parked')
end)

RegisterNetEvent('parking:server:retrieve', function(parkingId, lotId)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then
        return
    end

    if isCoolingDown(cooldownRetrieve, src) then
        notifyPlayer(src, 'error', 'err_cooldown')
        return
    end

    if type(parkingId) ~= 'number' and type(parkingId) ~= 'string' then
        return
    end

    parkingId = tonumber(parkingId)
    if not parkingId then
        return
    end

    if type(lotId) ~= 'string' then
        return
    end

    local lot = getLotById(lotId)
    if not lot then
        return
    end

    if not kioskReachable(src, lot) then
        notifyPlayer(src, 'error', 'err_too_far_kiosk')
        return
    end

    local row = MySQL.single.await(
        'SELECT * FROM parking_vehicles WHERE id = ? AND owner = ? LIMIT 1',
        { parkingId, xPlayer.identifier }
    )
    if not row then
        notifyPlayer(src, 'error', 'err_vehicle_not_found')
        return
    end

    local props = json.decode(row.vehicle)
    if type(props) ~= 'table' then
        notifyPlayer(src, 'error', 'err_invalid_data')
        return
    end

    if not takeRetrieveFee(xPlayer) then
        notifyPlayer(src, 'error', 'err_no_money')
        return
    end

    local deleted = MySQL.update.await('DELETE FROM parking_vehicles WHERE id = ? AND owner = ?', { parkingId, xPlayer.identifier })
    if not deleted or deleted < 1 then
        refundRetrieveFee(xPlayer)
        notifyPlayer(src, 'error', 'err_vehicle_not_found')
        return
    end

    local s = lot.spawn
    TriggerClientEvent('parking:client:spawnVehicle', src, props, s.x, s.y, s.z, s.w)
    setCooldown(cooldownRetrieve, src, Config.CooldownRetrieveMs or 2000)
    notifyPlayer(src, 'success', 'success_retrieved')
end)

exports('IsPlateParked', function(plate)
    if not plate or type(plate) ~= 'string' then
        return false
    end
    local p = trimPlate(plate)
    local row = MySQL.single.await('SELECT id FROM parking_vehicles WHERE UPPER(TRIM(plate)) = ? LIMIT 1', { p })
    return row ~= nil
end)

exports('CountParkedForOwner', function(identifier)
    if not identifier then
        return 0
    end
    return countParked(identifier)
end)
