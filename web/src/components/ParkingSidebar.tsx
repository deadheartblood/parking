import { Car, Keyboard } from 'lucide-react'

function ParkingSidebar() {
  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-white/[0.08] bg-gradient-to-b from-black/30 to-black/10 py-5">
      <p className="mb-2 px-5 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
        Menu
      </p>
      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        <div
          className="sidebar-item-enter relative flex w-full items-center gap-3 rounded-xl bg-zinc-100 py-3 pl-3 pr-3 text-left text-zinc-950 shadow-ui-depth"
          style={{ animationDelay: '0s' }}
        >
          <span
            className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-zinc-950"
            aria-hidden
          />
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900/10 bg-zinc-900/[0.06] text-zinc-900">
            <Car className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="font-display text-sm font-semibold">My vehicles</span>
        </div>
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/[0.06] px-4 pt-4">
        <div className="rounded-xl border border-white/8 bg-black/25 p-3">
          <div className="mb-2 flex items-center gap-2 text-zinc-500">
            <Keyboard className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            <span className="font-display text-[10px] font-semibold uppercase tracking-wider">Quick keys</span>
          </div>
          <ul className="space-y-1.5 font-mono text-[10px] leading-relaxed text-zinc-600">
            <li className="flex justify-between gap-2">
              <span>Close window</span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-zinc-400">Esc</kbd>
            </li>
            <li className="flex justify-between gap-2">
              <span>Search</span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-zinc-400">/</kbd>
            </li>
          </ul>
        </div>
        <p className="text-center font-mono text-[10px] leading-relaxed text-zinc-600">City parking services</p>
      </div>
    </aside>
  )
}

export default ParkingSidebar
