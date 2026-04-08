function FleetSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-6 pb-8 pt-2" aria-busy="true" aria-label="Loading register">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="skeleton h-14 w-14 shrink-0 rounded-2xl" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
              <div className="skeleton h-4 w-[45%] max-w-[200px] rounded-md" />
              <div className="skeleton h-3 w-[70%] max-w-[280px] rounded-md" />
              <div className="flex gap-2 pt-1">
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <div className="skeleton h-11 w-full rounded-xl sm:max-w-[160px]" />
        </div>
      ))}
    </div>
  )
}

export default FleetSkeleton
