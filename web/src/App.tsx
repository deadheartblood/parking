import { useCallback, useEffect, useRef, useState } from 'react'
import ParkingFleet from './components/ParkingFleet'
import ParkingHeader from './components/ParkingHeader'
import ParkingPageChrome from './components/ParkingPageChrome'
import ParkingSidebar from './components/ParkingSidebar'
import {
  DEFAULT_PARKING_UI,
  mergeParkingUiConfig,
  type ParkedVehicleRow,
  type ParkingNuiUiConfig,
  type ParkingPlayerData,
} from './types'

function App() {
  const [visible, setVisible] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [vehicles, setVehicles] = useState<ParkedVehicleRow[]>([])
  const [currentLotId, setCurrentLotId] = useState<string | null>(null)
  const [lotLabel, setLotLabel] = useState('')
  const [uiConfig, setUiConfig] = useState<ParkingNuiUiConfig>(DEFAULT_PARKING_UI)
  const docTitleBeforeOpen = useRef<string | null>(null)
  const [retrievingId, setRetrievingId] = useState<number | null>(null)
  const retrieveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [playerData, setPlayerData] = useState<ParkingPlayerData>({
    username: 'Player',
    globalName: 'Player',
  })

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data

      if (data.action === 'open') {
        setVisible(true)
        setListLoading(true)
        setVehicles([])
        if (data.playerData) {
          setPlayerData(data.playerData as ParkingPlayerData)
        }
        if (data.uiConfig) {
          setUiConfig(mergeParkingUiConfig(data.uiConfig))
        }
        if (data.lotLabel != null) {
          setLotLabel(String(data.lotLabel))
        }
        if (data.lotId != null) {
          setCurrentLotId(String(data.lotId))
        }
      }

      if (data.action === 'close') {
        setVisible(false)
        setListLoading(false)
        setRetrievingId(null)
        if (retrieveTimer.current) {
          clearTimeout(retrieveTimer.current)
          retrieveTimer.current = null
        }
      }

      if (data.action === 'setVehicles') {
        setListLoading(false)
        setVehicles(Array.isArray(data.vehicles) ? data.vehicles : [])
        if (data.currentLotId != null) {
          setCurrentLotId(String(data.currentLotId))
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (visible) {
      if (docTitleBeforeOpen.current === null) {
        docTitleBeforeOpen.current = document.title
      }
      document.title = uiConfig.serverName
    } else if (docTitleBeforeOpen.current !== null) {
      document.title = docTitleBeforeOpen.current
      docTitleBeforeOpen.current = null
    }
  }, [visible, uiConfig.serverName])

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    root.classList.toggle('parking-nui-open', visible)
    return () => root.classList.remove('parking-nui-open')
  }, [visible])

  const clearRetrieveTimer = () => {
    if (retrieveTimer.current) {
      clearTimeout(retrieveTimer.current)
      retrieveTimer.current = null
    }
  }

  const handleClose = useCallback(() => {
    setVisible(false)
    setListLoading(false)
    setRetrievingId(null)
    clearRetrieveTimer()
    fetch(`https://${GetParentResourceName()}/close`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }, [])

  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
        return
      }
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const t = event.target as HTMLElement
        if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
        event.preventDefault()
        document.getElementById('parking-fleet-search')?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible, handleClose])

  const handleRetrieve = (id: number) => {
    if (!currentLotId) return
    setRetrievingId(id)
    clearRetrieveTimer()
    retrieveTimer.current = setTimeout(() => {
      setRetrievingId(null)
      retrieveTimer.current = null
    }, 3200)

    fetch(`https://${GetParentResourceName()}/retrieve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ id, lotId: currentLotId }),
    })
  }

  const lotShort =
    lotLabel.length > 14 ? `${lotLabel.slice(0, 12)}…` : lotLabel || '—'

  return (
    <>
      {visible ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-3 sm:p-6 pointer-events-auto"
          role="presentation"
        >
          <div
            className="flex h-[80vh] max-h-[92vh] w-full max-w-[min(92vw,1280px)] flex-col overflow-hidden rounded-3xl border border-white/15 shadow-2xl glass-shell animate-parking-open pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label={uiConfig.serverName}
          >
            <div className="ui-shell-chrome shrink-0" aria-hidden />
            <ParkingHeader
              playerData={playerData}
              uiConfig={uiConfig}
              parkedCount={vehicles.length}
              lotLabelShort={lotShort}
              onClose={handleClose}
            />
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
              <ParkingSidebar brandName={uiConfig.serverName} />
              <main className="ui-main-canvas relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
                <div className="page-enter relative z-10 mx-auto max-w-[1200px]">
                  <ParkingPageChrome lotLabel={lotLabel} vehicleCount={vehicles.length} loading={listLoading} />
                  <ParkingFleet
                    vehicles={vehicles}
                    loading={listLoading}
                    onRetrieve={handleRetrieve}
                    retrievingId={retrievingId}
                  />
                </div>
              </main>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default App
