local ESX = exports['es_extended']:getSharedObject()

local nuiOpen = false
local textUiMode = nil

local function getLotById(id)
    for _, lot in ipairs(Config.ParkingLots) do
        if lot.id == id then
            return lot
        end
    end
    return nil
end

local function lotLabel(id)
    local lot = getLotById(id)
    return lot and lot.label or id
end

local function notifyClient(localeKey, ntype)
    ntype = ntype or 'error'
    if Config.Notify == 'ox' then
        lib.notify({
            title = Config.ServerName,
            description = ParkingLocale(localeKey),
            type = ntype,
            duration = 4500,
        })
    else
        local prefix = (ntype == 'success') and '~g~' or '~r~'
        ESX.ShowNotification(prefix .. ParkingLocale(localeKey))
    end
end

local function hideTextUi()
    if textUiMode then
        lib.hideTextUI()
        textUiMode = nil
    end
end

local function showTextUi(mode, text, icon)
    if textUiMode == mode then
        return
    end
    if textUiMode then
        lib.hideTextUI()
    end
    textUiMode = mode
    lib.showTextUI(text, {
        icon = icon,
        position = 'right-center',
    })
end

local function closeUi()
    if not nuiOpen then
        return
    end
    nuiOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
    hideTextUi()
end

local function enrichVehicles(payload)
    for _, v in ipairs(payload) do
        local dn = GetLabelText(GetDisplayNameFromVehicleModel(v.model))
        if dn == 'NULL' or dn == '' then
            dn = 'Vehicle'
        end
        v.displayName = dn
        v.lotLabel = lotLabel(v.lotId)
    end
    return payload
end

local function openUi(lot)
    if nuiOpen then
        return
    end

    local res = lib.callback.await('parking:getVehicles', false, lot.id)
    if not res or not res.ok or type(res.vehicles) ~= 'table' then
        notifyClient('err_list_failed', 'error')
        return
    end

    hideTextUi()
    nuiOpen = true
    SetNuiFocus(true, true)

    local pd = ESX.GetPlayerData()
    local name = (pd and pd.name) or 'Player'

    SendNUIMessage({
        action = 'open',
        uiConfig = {
            serverName = Config.ServerName,
            modeLabel = Config.ModeLabel,
            tagline = Config.Tagline,
            retrieveFee = Config.RetrieveFee,
        },
        playerData = {
            globalName = name,
            username = name,
        },
        lotLabel = lot.label,
        lotId = lot.id,
    })

    SendNUIMessage({
        action = 'setVehicles',
        vehicles = enrichVehicles(res.vehicles),
        currentLotId = res.lotId or lot.id,
    })
end

local function dist2d(x1, y1, x2, y2)
    local dx = x1 - x2
    local dy = y1 - y2
    return math.sqrt(dx * dx + dy * dy)
end

local function isNearAnyLot(px, py, pz)
    local far = Config.FarDistance or 120.0
    for _, lot in ipairs(Config.ParkingLots) do
        if #(vector3(px, py, pz) - lot.park.coords) < far then
            return true
        end
        if #(vector3(px, py, pz) - lot.kiosk) < (far * 0.5) then
            return true
        end
    end
    return false
end

local function tryParkVehicle()
    local ped = PlayerPedId()
    local veh = GetVehiclePedIsIn(ped, false)
    if veh == 0 then
        return
    end
    if Config.BlockCycleClass and GetVehicleClass(veh) == 13 then
        if Config.Notify == 'ox' then
            lib.notify({
                title = Config.ServerName,
                description = ParkingLocale('err_no_bicycles'),
                type = 'error',
                duration = 4500,
            })
        else
            ESX.ShowNotification('~r~' .. ParkingLocale('err_no_bicycles'))
        end
        return
    end
    local duration = Config.ParkProgressMs or 0

    local function sendPark()
        local v = GetVehiclePedIsIn(PlayerPedId(), false)
        if v == 0 then
            return
        end
        local p = ESX.Game.GetVehicleProperties(v)
        TriggerServerEvent('parking:server:park', json.encode(p))
    end

    if duration > 0 then
        if not lib.progressCircle({
            duration = duration,
            position = 'bottom',
            label = ParkingLocale('progress_parking'),
            useWhileDead = false,
            canCancel = true,
            disable = { move = true, car = true, combat = true },
        }) then
            return
        end
    end
    sendPark()
end

local function spawnVehicleSafe(props, x, y, z, w)
    if type(props) ~= 'table' or not props.model then
        return
    end

    local base = vector3(x, y, z)
    local radius = Config.SpawnClearRadius or 4.0
    local attempts = {
        base,
        base + vector3(2.2, 0.0, 0.0),
        base + vector3(-2.2, 0.0, 0.0),
        base + vector3(0.0, 2.2, 0.0),
        base + vector3(0.0, -2.2, 0.0),
        base + vector3(1.5, 1.5, 0.0),
        base + vector3(-1.5, -1.5, 0.0),
    }

    for i = 1, #attempts do
        local pos = attempts[i]
        if ESX.Game.IsSpawnPointClear(pos, radius) then
            ESX.Game.SpawnVehicle(props.model, pos, w, function(vehicle)
                ESX.Game.SetVehicleProperties(vehicle, props)
                TaskWarpPedIntoVehicle(PlayerPedId(), vehicle, -1)
            end)
            return
        end
    end

    notifyClient('err_spawn_blocked', 'error')
end

RegisterNetEvent('parking:client:deleteVehicle', function(netId)
    local ent = NetworkGetEntityFromNetworkId(netId)
    if ent == 0 or not DoesEntityExist(ent) then
        return
    end
    ESX.Game.DeleteVehicle(ent)
end)

RegisterNetEvent('parking:client:spawnVehicle', function(props, x, y, z, w)
    spawnVehicleSafe(props, x, y, z, w)
end)

RegisterNUICallback('close', function(_, cb)
    closeUi()
    cb('ok')
end)

RegisterNUICallback('retrieve', function(data, cb)
    local id = data and data.id
    local lotId = data and data.lotId
    local lot = lotId and getLotById(lotId)

    if not id or not lot then
        cb('ok')
        return
    end

    local s = lot.spawn
    local checkPos = vector3(s.x, s.y, s.z)
    if not ESX.Game.IsSpawnPointClear(checkPos, Config.SpawnClearRadius or 4.0) then
        notifyClient('err_spawn_blocked', 'error')
        cb('ok')
        return
    end

    local dur = Config.RetrieveProgressMs or 0
    if dur > 0 then
        if not lib.progressCircle({
            duration = dur,
            position = 'bottom',
            label = ParkingLocale('progress_retrieve'),
            useWhileDead = false,
            canCancel = true,
            disable = { move = true, car = true, combat = true },
        }) then
            cb('ok')
            return
        end
    end

    TriggerServerEvent('parking:server:retrieve', id, lotId)
    closeUi()
    cb('ok')
end)

CreateThread(function()
    while true do
        local ped = PlayerPedId()
        local px, py, pz = table.unpack(GetEntityCoords(ped))

        local idleSleep = Config.IdleLoopSleepFar or 650
        local sleep = isNearAnyLot(px, py, pz) and 0 or idleSleep

        local wantPark = false
        local wantKiosk = false

        for _, lot in ipairs(Config.ParkingLots) do
            local pkc = lot.park.coords
            local kiosk = lot.kiosk
            local dPark = dist2d(px, py, pkc.x, pkc.y)
            local dKiosk = dist2d(px, py, kiosk.x, kiosk.y)
            local nearZ = math.abs(pz - pkc.z) < 8.0

            if Config.DrawMarkers ~= false then
                if dPark < Config.MarkerDrawDistance and nearZ then
                    sleep = 0
                    local m = Config.MarkerPark or { r = 80, g = 120, b = 200, a = 35 }
                    DrawMarker(
                        1,
                        pkc.x, pkc.y, pkc.z - 1.0,
                        0.0, 0.0, 0.0,
                        0.0, 0.0, 0.0,
                        lot.park.radius * 2.0, lot.park.radius * 2.0, 1.0,
                        m.r, m.g, m.b, m.a,
                        false, false, 2, false, nil, nil, false
                    )
                end

                if dKiosk < Config.MarkerDrawDistance and math.abs(pz - kiosk.z) < 6.0 then
                    sleep = 0
                    local k = Config.MarkerKiosk or { r = 220, g = 220, b = 240, a = 160 }
                    DrawMarker(
                        27,
                        kiosk.x, kiosk.y, kiosk.z - 0.95,
                        0.0, 0.0, 0.0,
                        0.0, 0.0, 0.0,
                        0.9, 0.9, 0.9,
                        k.r, k.g, k.b, k.a,
                        false, false, 2, false, nil, nil, false
                    )
                end
            end

            local inVehicle = IsPedInAnyVehicle(ped, false)
            if inVehicle and dPark < lot.park.radius and math.abs(pz - pkc.z) < 10.0 then
                sleep = 0
                if GetPedInVehicleSeat(GetVehiclePedIsIn(ped, false), -1) == ped then
                    wantPark = true
                    if IsControlJustReleased(0, Config.ParkKey) then
                        tryParkVehicle()
                    end
                end
            elseif not inVehicle and dKiosk < Config.InteractDistance and math.abs(pz - kiosk.z) < 4.0 then
                sleep = 0
                wantKiosk = true
                if IsControlJustReleased(0, Config.OpenUiKey) then
                    openUi(lot)
                end
            end
        end

        if nuiOpen then
            hideTextUi()
        elseif wantPark then
            showTextUi('park', '[E] Check in vehicle', 'car')
        elseif wantKiosk then
            showTextUi('kiosk', '[E] Use parking desk', 'warehouse')
        else
            hideTextUi()
        end

        Wait(sleep)
    end
end)

CreateThread(function()
    while true do
        if nuiOpen and IsControlJustReleased(0, 322) then
            closeUi()
        end
        Wait(0)
    end
end)

AddEventHandler('onResourceStop', function(res)
    if res == GetCurrentResourceName() then
        lib.hideTextUI()
        if nuiOpen then
            SetNuiFocus(false, false)
        end
    end
end)
