import { useMemo, useState } from 'react'
import { Car, Filter } from 'lucide-react'
import type { ParkedVehicleRow } from '../types'
import { normalizeSearch } from '../utils/format'
import FleetSkeleton from './FleetSkeleton'
import ParkingToolbar, { type FleetSort } from './ParkingToolbar'
import ParkingVehicleCard from './ParkingVehicleCard'

interface ParkingFleetProps {
  vehicles: ParkedVehicleRow[]
  loading: boolean
  onRetrieve: (id: number) => void
  retrievingId: number | null
}

function sortFleet(list: ParkedVehicleRow[], sort: FleetSort): ParkedVehicleRow[] {
  const out = [...list]
  if (sort === 'name_asc') {
    out.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || '', undefined, { sensitivity: 'base' }))
  } else if (sort === 'plate_asc') {
    out.sort((a, b) => (a.plate || '').localeCompare(b.plate || '', undefined, { sensitivity: 'base' }))
  } else {
    out.sort((a, b) => {
      const ta = a.parkedAt ? Date.parse(a.parkedAt) : 0
      const tb = b.parkedAt ? Date.parse(b.parkedAt) : 0
      return tb - ta
    })
  }
  return out
}

function filterFleet(list: ParkedVehicleRow[], q: string): ParkedVehicleRow[] {
  const n = normalizeSearch(q)
  if (!n) return list
  return list.filter((v) => {
    const plate = normalizeSearch(v.plate || '')
    const name = normalizeSearch(v.displayName || '')
    const lot = normalizeSearch(v.lotLabel || v.lotId || '')
    return plate.includes(n) || name.includes(n) || lot.includes(n)
  })
}

function ParkingFleet({ vehicles, loading, onRetrieve, retrievingId }: ParkingFleetProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<FleetSort>('parked_desc')

  const filteredSorted = useMemo(() => {
    return sortFleet(filterFleet(vehicles, search), sort)
  }, [vehicles, search, sort])

  const showEmpty = !loading && vehicles.length === 0
  const showNoMatches = !loading && vehicles.length > 0 && filteredSorted.length === 0

  if (loading) {
    return (
      <div className="ui-panel overflow-hidden">
        <div className="ui-panel-header px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <Car className="h-4 w-4 animate-pulse text-zinc-400" strokeWidth={2} />
            </span>
            <div>
              <p className="font-display text-xs font-semibold text-zinc-200">Your vehicles</p>
              <p className="text-[11px] text-zinc-600">Opening the register…</p>
            </div>
          </div>
        </div>
        <FleetSkeleton />
      </div>
    )
  }

  if (showEmpty) {
    return (
      <div className="ui-panel overflow-hidden">
        <div className="ui-panel-header px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <Car className="h-4 w-4 text-zinc-400" strokeWidth={2} />
            </span>
            <div>
              <p className="font-display text-xs font-semibold text-zinc-200">Your vehicles</p>
              <p className="text-[11px] text-zinc-600">Nothing on file at this desk yet</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="relative mb-8">
            <div
              className="absolute -inset-8 rounded-full opacity-50 blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 70%)',
              }}
            />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.12] via-white/[0.04] to-transparent shadow-ui-depth-lg">
              <Car className="h-14 w-14 text-zinc-400" strokeWidth={1.15} />
            </div>
          </div>
          <p className="font-display text-2xl font-semibold tracking-tight text-zinc-50">No vehicles on file</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
            Enter a <span className="text-zinc-400">marked parking spot</span> in a vehicle registered to you, then press{' '}
            <kbd className="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-300">E</kbd>{' '}
            to check it in with the city.
          </p>
          <ol className="mt-10 grid max-w-lg gap-3 text-left text-xs text-zinc-600 sm:grid-cols-3">
            <li className="rounded-xl border border-white/8 bg-black/20 p-3">
              <span className="mb-1 block font-mono text-[10px] text-zinc-500">01</span>
              Pull into the marked parking area
            </li>
            <li className="rounded-xl border border-white/8 bg-black/20 p-3">
              <span className="mb-1 block font-mono text-[10px] text-zinc-500">02</span>
              Stay in the driver seat and confirm
            </li>
            <li className="rounded-xl border border-white/8 bg-black/20 p-3">
              <span className="mb-1 block font-mono text-[10px] text-zinc-500">03</span>
              Use this desk to collect your vehicle
            </li>
          </ol>
          <p className="mt-10 max-w-md text-xs text-zinc-500">
            Drive into a marked spot and press <kbd className="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-zinc-300">E</kbd> to park.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-panel overflow-hidden">
      <div className="ui-panel-header flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
            <Car className="h-4 w-4 text-zinc-400" strokeWidth={2} />
          </span>
          <div>
            <p className="font-display text-xs font-semibold text-zinc-200">Your vehicles</p>
            <p className="text-[11px] text-zinc-600">Pull up to the exit when you&apos;re ready.</p>
          </div>
        </div>
        {showNoMatches ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200/90">
            <Filter className="h-3.5 w-3.5" strokeWidth={2} />
            No results
          </span>
        ) : null}
      </div>

      <ParkingToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        resultCount={filteredSorted.length}
        totalCount={vehicles.length}
      />

      {showNoMatches ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="font-display text-lg font-medium text-zinc-400">No matches in the register</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-600">Try another plate or name, or clear the search.</p>
          <button
            type="button"
            onClick={() => setSearch('')}
            className="mt-6 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 px-6 pb-8 pt-0">
          {filteredSorted.map((v, i) => (
            <ParkingVehicleCard
              key={v.id}
              vehicle={v}
              index={i}
              isRetrieving={retrievingId === v.id}
              onRetrieve={onRetrieve}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default ParkingFleet
