import { Activity, Car } from 'lucide-react'

interface ParkingPageChromeProps {
  lotLabel: string
  vehicleCount: number
  loading: boolean
}

function ParkingPageChrome({ lotLabel, vehicleCount, loading }: ParkingPageChromeProps) {
  return (
    <header className="mb-6 border-b border-white/[0.08] pb-5">
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-gradient-to-br from-white/[0.08] to-transparent shadow-ui-depth">
          <Car className="h-5 w-5 text-zinc-300" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Counter</p>
          <h2 className="font-display text-xl font-semibold tracking-tight text-zinc-50 md:text-2xl">Vehicle storage</h2>
          <p className="mt-0.5 max-w-md text-sm text-zinc-500">{lotLabel}</p>
          <div className="mt-3 inline-flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <Activity
                className={`h-3 w-3 ${loading ? 'animate-pulse text-amber-400/80' : 'text-emerald-400/90'}`}
                strokeWidth={2}
                aria-hidden
              />
              {loading ? 'Updating' : 'Ready'}
            </span>
            {!loading ? (
              <span className="rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                <span className="text-zinc-400">{vehicleCount}</span> on file
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default ParkingPageChrome
