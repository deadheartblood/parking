import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDownAZ, Check, ChevronDown, Clock, Search, X } from 'lucide-react'

export type FleetSort = 'parked_desc' | 'name_asc' | 'plate_asc'

const SORT_OPTIONS: { value: FleetSort; label: string }[] = [
  { value: 'parked_desc', label: 'Newest check-in first' },
  { value: 'name_asc', label: 'Vehicle name A–Z' },
  { value: 'plate_asc', label: 'Plate A–Z' },
]

interface ParkingToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  sort: FleetSort
  onSortChange: (v: FleetSort) => void
  resultCount: number
  totalCount: number
}

function ParkingToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  resultCount,
  totalCount,
}: ParkingToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const labelId = useId()
  const listboxId = useId()
  const [menuRect, setMenuRect] = useState({ top: 0, left: 0, width: 220 })

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? SORT_OPTIONS[0].label

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setMenuRect({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 220) })
  }, [])

  useLayoutEffect(() => {
    if (!menuOpen) return
    updateMenuPosition()
  }, [menuOpen, updateMenuPosition])

  useEffect(() => {
    if (!menuOpen) return
    const onScroll = () => updateMenuPosition()
    const onResize = () => updateMenuPosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen, updateMenuPosition])

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (wrapRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('click', onDoc)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [menuOpen])

  const selectSort = (v: FleetSort) => {
    onSortChange(v)
    setMenuOpen(false)
  }

  const menuPortal =
    menuOpen &&
    createPortal(
      <ul
        ref={menuRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={labelId}
        className="fixed overflow-hidden rounded-xl border border-white/12 bg-[linear-gradient(165deg,rgba(32,32,38,0.98)_0%,rgba(18,18,22,0.99)_100%)] py-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={{
          top: menuRect.top,
          left: menuRect.left,
          minWidth: menuRect.width,
          zIndex: 99999,
        }}
      >
        {SORT_OPTIONS.map((opt) => {
          const active = sort === opt.value
          return (
            <li key={opt.value} role="option" aria-selected={active}>
              <button
                type="button"
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                  active
                    ? 'bg-white/[0.09] text-zinc-50'
                    : 'text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200'
                }`}
                onClick={() => selectSort(opt.value)}
              >
                <span className="min-w-0 flex-1">{opt.label}</span>
                {active ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400/90" strokeWidth={2} /> : null}
              </button>
            </li>
          )
        })}
      </ul>,
      document.body,
    )

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          strokeWidth={2}
          aria-hidden
        />
        <input
          id="parking-fleet-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="search plate or vehicle..."
          className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-10 font-sans text-sm text-zinc-100 shadow-inner outline-none ring-0 placeholder:text-zinc-600 focus:border-white/20 focus:bg-black/30"
          autoComplete="off"
          spellCheck={false}
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/10 hover:text-zinc-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div ref={wrapRef} className="relative">
          <span id={labelId} className="sr-only">
            Sort list
          </span>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-controls={listboxId}
            aria-labelledby={labelId}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex w-full min-w-[200px] items-center justify-between gap-3 rounded-xl border border-white/12 bg-gradient-to-b from-white/[0.08] to-black/30 py-2.5 pl-3 pr-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none ring-0 transition-[border-color,background-color,box-shadow] hover:border-white/18 hover:bg-white/[0.06] focus-visible:border-white/25 focus-visible:ring-2 focus-visible:ring-white/15 sm:min-w-[220px]"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={2} aria-hidden />
              <span className="truncate text-xs font-semibold text-zinc-200">{currentLabel}</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${
                menuOpen ? 'rotate-180' : ''
              }`}
              strokeWidth={2}
              aria-hidden
            />
          </button>

        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          <ArrowDownAZ className="h-3.5 w-3.5 text-zinc-600" strokeWidth={2} />
          <span>
            <span className="text-zinc-300">{resultCount}</span>
            <span className="text-zinc-600"> / </span>
            <span>{totalCount}</span>
          </span>
        </div>
      </div>
      {menuPortal}
    </div>
  )
}

export default ParkingToolbar
