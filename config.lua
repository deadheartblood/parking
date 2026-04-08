Config = {}

Config.ServerName = 'City Parking'
Config.ModeLabel = 'Public'
Config.Tagline = 'Park your car here'

Config.Locale = 'en'

Config.Locales = {
    en = {
        err_not_in_vehicle = 'you need to be in a vehicle',
        err_not_driver = 'only the driver can park',
        err_not_in_zone = 'you are not in a parking spot',
        err_not_owner = 'this aint your vehicle',
        err_limit = 'you got too many vehicles parked',
        err_already_parked = 'that plate is already parked',
        err_too_far_kiosk = 'get closer to the kiosk',
        err_vehicle_not_found = 'vehicle not found',
        err_no_money = 'you dont have enough money',
        err_cooldown = 'slow down',
        err_invalid_data = 'something went wrong',
        err_spawn_blocked = 'exit is blocked move the car',
        err_no_bicycles = 'no bikes allowed here',
        success_parked = 'vehicle parked',
        success_retrieved = 'vehicle retrieved',
        err_list_failed = 'could not load vehicles try again',
        progress_parking = 'parking...',
        progress_retrieve = 'retrieving...',
    },
}

-- economy
Config.RetrieveFee = 0
Config.RetrieveAccount = 'bank'

-- limits
Config.MaxParkedPerPlayer = 8
Config.CooldownParkMs = 2500
Config.CooldownRetrieveMs = 2000
Config.MaxVehiclePropsBytes = 16384

Config.BlockCycleClass = true

Config.Notify = 'ox'

Config.ParkKey = 38
Config.OpenUiKey = 38
Config.MarkerDrawDistance = 35.0
Config.InteractDistance = 2.5
Config.ServerKioskSlack = 2.0

Config.DrawMarkers = true
Config.MarkerPark = { r = 80, g = 120, b = 200, a = 35 }
Config.MarkerKiosk = { r = 220, g = 220, b = 240, a = 160 }

Config.ParkProgressMs = 0
Config.RetrieveProgressMs = 0

Config.SpawnClearRadius = 4.0

Config.IdleLoopSleepFar = 650
Config.FarDistance = 120.0

Config.ParkingLots = {
    {
        id = 'legion_garage',
        label = 'Legion Square Garage',
        park = {
            coords = vec3(215.76, -809.20, 30.73),
            radius = 18.0,
        },
        kiosk = vec3(207.89, -799.12, 30.95),
        spawn = vec4(229.42, -800.51, 30.54, 157.4),
    },
    {
        id = 'pillbox_road',
        label = 'Pillbox Hill Lot',
        park = {
            coords = vec3(275.18, -345.12, 45.17),
            radius = 14.0,
        },
        kiosk = vec3(283.5, -342.0, 45.0),
        spawn = vec4(270.0, -340.0, 44.8, 70.0),
    },
}