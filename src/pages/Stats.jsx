import { useQuery } from '@tanstack/react-query'
import { getLifetimeStats } from '../api/stats'

export default function Stats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['lifetimeStats'],
    queryFn: getLifetimeStats,
  })

  if (isLoading) return <p className="text-zinc-500">Loading...</p>

  const hasData = stats?.exercises?.length || stats?.habits?.length || stats?.monthly_goals?.length

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Stats</h1>

      {!hasData && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🏋️</p>
          <p className="text-zinc-500">No stats yet. Get to work!</p>
        </div>
      )}

      {stats?.exercises?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span>💪</span>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Exercises</h2>
          </div>
          <div className="space-y-2 stagger">
            {stats.exercises
              .sort((a, b) => b.total - a.total)
              .map(ex => (
                <div key={ex.name} className="flex items-center justify-between p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800/50">
                  <span className="font-medium">{ex.name}</span>
                  <span className="text-lime-400 font-bold font-mono">{ex.total.toLocaleString()} <span className="text-zinc-500 text-xs font-normal">{ex.unit}</span></span>
                </div>
              ))}
          </div>
        </div>
      )}

      {stats?.habits?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span>🔄</span>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Habits</h2>
          </div>
          <div className="space-y-2 stagger">
            {stats.habits
              .sort((a, b) => b.total_days - a.total_days)
              .map(h => (
                <div key={h.name} className="flex items-center justify-between p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800/50">
                  <span className="font-medium">{h.name}</span>
                  <span className="text-lime-400 font-bold font-mono">{h.total_days} <span className="text-zinc-500 text-xs font-normal">days</span></span>
                </div>
              ))}
          </div>
        </div>
      )}

      {stats?.monthly_goals?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span>🎯</span>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Monthly Goals</h2>
          </div>
          <div className="space-y-2 stagger">
            {stats.monthly_goals
              .sort((a, b) => b.total - a.total)
              .map(g => (
                <div key={g.name} className="flex items-center justify-between p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800/50">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-lime-400 font-bold font-mono">{Number(g.total).toLocaleString()} <span className="text-zinc-500 text-xs font-normal">{g.unit}</span></span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}