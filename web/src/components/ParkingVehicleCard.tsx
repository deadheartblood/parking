import { Car, ChevronRight, Loader2, MapPin } from 'lucide-react'
import type { ParkedVehicleRow } from '../types'
import { formatDateTime, formatRelativeTime } from '../utils/format'

interface ParkingVehicleCardProps {
  vehicle: ParkedVehicleRow
  index: number
  isRetrieving: boolean
  onRetrieve: (id: number) => void
}

function ParkingVehicleCard({ vehicle, index, isRetrieving, onRetrieve }: ParkingVehicleCardProps) {
  const title = vehicle.displayName || 'Vehicle'
  const plate = vehicle.plate || '—'
  const lot = vehicle.lotLabel || vehicle.lotId || '—'
  const rel = formatRelativeTime(vehicle.parkedAt)
  const full = formatDateTime(vehicle.parkedAt)

  return (
    <li
      className="group card-enter glass-card-interactive flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      style={{ animationDelay: `${Math.min(index, 10) * 0.04}s` }}
    >
      <div className="flex min-w-0 min-h-0 flex-1 gap-4">
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-60 blur-[2px]" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-zinc-700/50 to-zinc-900/80 shadow-ui-depth">
            <Car className="h-6 w-6 text-zinc-200" strokeWidth={1.75} />
          </div>
          <span
            className="absolute -bottom-1 -right-1 rounded-md border border-white/10 bg-zinc-950 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase text-zinc-500"
            title="Inventory reference"
          >
            {vehicle.model ? `0x${(vehicle.model >>> 0).toString(16).toUpperCase().slice(0, 6)}` : '—'}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="font-display text-base font-semibold tracking-tight text-zinc-50">{title}</h3>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-emerald-200/90"
              title="License plate"
            >
              {plate}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-400">
              <MapPin className="h-3 w-3 shrink-0 text-zinc-500" strokeWidth={2} aria-hidden />
              <span className="max-w-[140px] truncate" title={lot}>
                {lot}
              </span>
            </span>
            <span
              className="inline-flex items-center rounded-lg border border-white/8 bg-black/30 px-2 py-0.5 text-[11px] text-zinc-500"
              title={full || undefined}
            >
              <span className="text-zinc-400">{rel}</span>
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={isRetrieving}
        onClick={() => onRetrieve(vehicle.id)}
        className="ui-action-btn group/btn relative flex w-full shrink-0 items-center justify-center gap-2 overflow-hidden sm:w-auto sm:min-w-[168px] sm:self-center"
      >
        {isRetrieving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-zinc-300" strokeWidth={2} />
            <span>One moment…</span>
          </>
        ) : (
          <>
            <span>Release vehicle</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" strokeWidth={2} />
          </>
        )}
      </button>
    </li>
  )
}

export default ParkingVehicleCard
