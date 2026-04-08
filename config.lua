Config = {}

--[[---------------------------------------------------------------------------
  Desk branding (shown on the parking terminal)
---------------------------------------------------------------------------]]
Config.ServerName = 'City Parking'
Config.ModeLabel = 'Public'
Config.Tagline = 'Municipal overnight storage · Pay posted rates on exit'

--[[---------------------------------------------------------------------------
  Locale — add languages by copying `en` and set Config.Locale
---------------------------------------------------------------------------]]
Config.Locale = 'en'

Config.Locales = {
    en = {
        -- ox_lib / feedback
        err_not_in_vehicle = 'You need to be inside a road vehicle.',
        err_not_driver = 'Only the driver can check a vehicle in.',
        err_not_in_zone = 'You are not in a marked parking bay.',
        err_not_owner = 'This vehicle is not registered to you.',
        err_limit = 'You have reached the maximum vehicles on file.',
        err_already_parked = 'That plate is already checked in.',
        err_too_far_kiosk = 'Step up to the parking desk.',
        err_vehicle_not_found = 'No record found for that vehicle.',
        err_no_money = 'Insufficient funds on file.',
        err_cooldown = 'Please wait a moment before trying again.',
        err_invalid_data = 'That request could not be processed.',
        err_spawn_blocked = 'The exit lane is blocked — clear the way first.',
        err_no_bicycles = 'Cycles must use bicycle racks, not vehicle parking.',
        success_parked = 'Vehicle checked in. Keep your receipt.',
        success_retrieved = 'Vehicle released. Drive safely.',
        err_list_failed = 'The terminal could not open the register. Try again.',
        progress_parking = 'Checking in vehicle…',
        progress_retrieve = 'Preparing your vehicle…',
    },
}

--[[---------------------------------------------------------------------------
  Economy
---------------------------------------------------------------------------]]
--- Flat fee on retrieve. 0 = free.
Config.RetrieveFee = 0
--- `bank` | `money`
Config.RetrieveAccount = 'bank'

--[[---------------------------------------------------------------------------
  Limits & anti-spam
---------------------------------------------------------------------------]]
Config.MaxParkedPerPlayer = 8
--- Milliseconds between park / retrieve actions per player (server).
Config.CooldownParkMs = 2500
Config.CooldownRetrieveMs = 2000
--- Max JSON size for vehicle props (bytes) — blocks oversized payloads.
Config.MaxVehiclePropsBytes = 16384

--[[---------------------------------------------------------------------------
  Rules
---------------------------------------------------------------------------]]
--- Reject pushbikes / BMX (vehicle class 13).
Config.BlockCycleClass = true

--[[---------------------------------------------------------------------------
  Notifications: `ox` (ox_lib) | `esx` (legacy ESX only)
---------------------------------------------------------------------------]]
Config.Notify = 'ox'

--[[---------------------------------------------------------------------------
  Interaction
---------------------------------------------------------------------------]]
Config.ParkKey = 38 -- E
Config.OpenUiKey = 38
Config.MarkerDrawDistance = 35.0
Config.InteractDistance = 2.5
--- Extra slack for server-side kiosk validation (meters).
Config.ServerKioskSlack = 2.0

--[[---------------------------------------------------------------------------
  Markers (client)
---------------------------------------------------------------------------]]
Config.DrawMarkers = true
Config.MarkerPark = { r = 80, g = 120, b = 200, a = 35 }
Config.MarkerKiosk = { r = 220, g = 220, b = 240, a = 160 }

--[[---------------------------------------------------------------------------
  Progress (ox_lib) — 0 = instant
---------------------------------------------------------------------------]]
Config.ParkProgressMs = 0
Config.RetrieveProgressMs = 0

--[[---------------------------------------------------------------------------
  Spawn safety (client) — clearance check before spawning retrieved vehicle
---------------------------------------------------------------------------]]
Config.SpawnClearRadius = 4.0

--[[---------------------------------------------------------------------------
  Idle loop — when player is far from every lot, sleep longer (ms).
---------------------------------------------------------------------------]]
Config.IdleLoopSleepFar = 650
Config.FarDistance = 120.0

--[[---------------------------------------------------------------------------
  Lots: park = sphere, kiosk = vec3, spawn = vec4 (x,y,z,heading)
---------------------------------------------------------------------------]]
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
