import { Car, DollarSign, MapPin, User, X } from 'lucide-react'
import type { ParkingNuiUiConfig, ParkingPlayerData } from '../types'

interface ParkingHeaderProps {
  playerData: ParkingPlayerData
  uiConfig: ParkingNuiUiConfig
  parkedCount: number
  lotLabelShort: string
  onClose: () => void
}

function ParkingHeader({
  playerData,
  uiConfig,
  parkedCount,
  lotLabelShort,
  onClose,
}: ParkingHeaderProps) {
  const accent = '#a1a1aa'
  const fee = uiConfig.retrieveFee && uiConfig.retrieveFee > 0 ? `$${uiConfig.retrieveFee}` : 'Free'

  return (
    <header className="relative border-b border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-transparent px-5 py-3.5 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3.5 sm:flex-none">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-zinc-700/40 to-zinc-900/60 shadow-glow-subtle">
            <Car className="h-5 w-5 text-zinc-100" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="font-display text-lg font-semibold tracking-tight text-zinc-50 md:text-xl">
                {uiConfig.serverName}
              </h1>
              <span className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {uiConfig.modeLabel}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium tracking-wide text-zinc-500">{uiConfig.tagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 md:gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 py-2 pl-2 pr-4 shadow-ui-depth">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-white/15 bg-gradient-to-br from-zinc-700/50 to-zinc-900/80 shadow-md"
              style={{ boxShadow: `0 0 0 1px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.06)` }}
              title="Counter session"
            >
              <User className="h-5 w-5 text-zinc-100" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-100">
                {playerData.globalName || playerData.username}
              </p>
              <p className="text-xs font-medium" style={{ color: accent }}>
                Customer
              </p>
            </div>
          </div>

          <div className="hidden h-10 w-px bg-white/10 sm:block" aria-hidden />

          <div className="flex items-stretch gap-2 sm:gap-3">
            <div className="flex min-w-[4.5rem] flex-col justify-center rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-center shadow-ui-depth">
              <div className="mb-0.5 flex items-center justify-center gap-1 text-zinc-500">
                <Car className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="text-[9px] font-semibold uppercase tracking-widest">Stored</span>
              </div>
              <p className="font-display text-lg font-bold tabular-nums leading-none text-zinc-50">{parkedCount}</p>
            </div>
            <div className="flex min-w-[4.5rem] max-w-[7rem] flex-col justify-center rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-center shadow-ui-depth">
              <div className="mb-0.5 flex items-center justify-center gap-1 text-zinc-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span className="text-[9px] font-semibold uppercase tracking-widest">Site</span>
              </div>
              <p
                className="truncate font-display text-xs font-bold tabular-nums leading-tight text-zinc-200"
                title={lotLabelShort}
              >
                {lotLabelShort}
              </p>
            </div>
            <div className="flex min-w-[4.5rem] flex-col justify-center rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-center shadow-ui-depth">
              <div className="mb-0.5 flex items-center justify-center gap-1 text-zinc-500">
                <DollarSign className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="text-[9px] font-semibold uppercase tracking-widest">Rate</span>
              </div>
              <p className="font-display text-lg font-bold tabular-nums leading-none text-zinc-300">{fee}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-400 hover:border-white/20 hover:bg-white/10 hover:text-zinc-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default ParkingHeader
