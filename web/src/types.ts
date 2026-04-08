export interface ParkingNuiUiConfig {
  serverName: string
  tagline: string
  modeLabel: string
  retrieveFee?: number
}

export const DEFAULT_PARKING_UI: ParkingNuiUiConfig = {
  serverName: 'City Parking',
  tagline: 'Municipal overnight storage · Pay posted rates on exit',
  modeLabel: 'Public',
  retrieveFee: 0,
}

export function mergeParkingUiConfig(raw: Partial<ParkingNuiUiConfig> | undefined): ParkingNuiUiConfig {
  const d = DEFAULT_PARKING_UI
  return {
    serverName: (raw?.serverName && String(raw.serverName).trim()) || d.serverName,
    tagline: (raw?.tagline && String(raw.tagline).trim()) || d.tagline,
    modeLabel: (raw?.modeLabel && String(raw.modeLabel).trim()) || d.modeLabel,
    retrieveFee:
      raw?.retrieveFee !== undefined && raw.retrieveFee !== null && !Number.isNaN(Number(raw.retrieveFee))
        ? Number(raw.retrieveFee)
        : (d.retrieveFee ?? 0),
  }
}

export interface ParkingPlayerData {
  username: string
  globalName: string
  avatar?: string
}

export interface ParkedVehicleRow {
  id: number
  plate: string
  lotId: string
  lotLabel?: string
  parkedAt?: string
  model: number
  displayName?: string
}
