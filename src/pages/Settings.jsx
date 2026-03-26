import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPreferences, updatePreferences } from '../api/preferences'

const DAYS = [
  { key: 0, label: 'S', full: 'Sun' },
  { key: 1, label: 'M', full: 'Mon' },
  { key: 2, label: 'T', full: 'Tue' },
  { key: 3, label: 'W', full: 'Wed' },
  { key: 4, label: 'T', full: 'Thu' },
  { key: 5, label: 'F', full: 'Fri' },
  { key: 6, label: 'S', full: 'Sat' },
]

export default function Settings() {
  const queryClient = useQueryClient()
  const { data: prefs, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: getPreferences,
  })

  const [tasksPerDay, setTasksPerDay] = useState(3)
  const [activeDays, setActiveDays] = useState([1, 2, 3, 4, 5])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (prefs) {
      setTasksPerDay(prefs.tasks_per_day)
      setActiveDays(prefs.active_days || [])
    }
  }, [prefs])

  const mutation = useMutation({
    mutationFn: (data) => updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const toggleDay = (day) => {
    setActiveDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    )
  }

  const save = () => {
    mutation.mutate({ tasks_per_day: tasksPerDay, active_days: activeDays })
  }

  if (isLoading) return <p className="text-zinc-500">Loading...</p>

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Settings</h1>

      {/* Tasks Per Day */}
      <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Exercises per day</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTasksPerDay(Math.max(1, tasksPerDay - 1))}
            className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-400 font-bold text-lg hover:bg-zinc-700 active:scale-95 transition-all duration-200"
          >
            −
          </button>
          <span className="text-4xl font-bold text-lime-400 w-12 text-center">{tasksPerDay}</span>
          <button
            onClick={() => setTasksPerDay(Math.min(10, tasksPerDay + 1))}
            className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-400 font-bold text-lg hover:bg-zinc-700 active:scale-95 transition-all duration-200"
          >
            +
          </button>
        </div>
      </div>

      {/* Active Days */}
      <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-5 mb-6">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Active days</p>
        <div className="flex gap-2 justify-between">
          {DAYS.map(({ key, label, full }) => (
            <button
              key={key}
              onClick={() => toggleDay(key)}
              className={`flex-1 aspect-square max-w-[48px] rounded-xl font-bold text-sm flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                activeDays.includes(key)
                  ? 'bg-lime-500 text-zinc-900 scale-105'
                  : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
              }`}
            >
              <span>{label}</span>
              <span className="text-[8px] opacity-60">{full}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-3 text-center">
          {activeDays.length} day{activeDays.length !== 1 ? 's' : ''} per week
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={save}
        disabled={mutation.isPending}
        className={`w-full font-bold py-3.5 rounded-2xl transition-all duration-300 ${
          saved
            ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
            : 'bg-lime-500 text-zinc-900 hover:bg-lime-400 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {mutation.isPending ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  )
}