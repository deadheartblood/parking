function ParkingLocale(key)
    local lang = Config.Locale or 'en'
    local pack = Config.Locales[lang] or Config.Locales.en
    if not pack then
        return key
    end
    local s = pack[key]
    if type(s) == 'string' then
        return s
    end
    return key
end
