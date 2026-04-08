fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'parking'
description 'vehicle parking system for esx'
author 'deadheartblood'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
    'shared/locale.lua',
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*',
}

dependencies {
    'es_extended',
    'oxmysql',
    'ox_lib',
}
