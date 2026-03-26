import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWeeklyHabits, getHabitTemplates, createWeeklyHabit, deleteWeeklyHabit, logHabitToday } from '../api/habits'
import { format, startOfWeek } from 'date-fns'

export default function Weekly() {
  const queryClient = useQueryClient()
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const [showAdd, setShowAdd] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [targetDays, setTargetDays] = useState(3)

  const { data: habits, isLoading } = useQuery({
    queryKey: ['weeklyHabits', weekStart],
    queryFn: () => getWeeklyHabits(weekStart),
  })

  const { data: templates } = useQuery({
    queryKey: ['habitTemplates'],
    queryFn: getHabitTemplates,
    enabled: showAdd,
  })

  const logMutation = useMutation({
    mutationFn: logHabitToday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyHabits'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyGoals'] })
    },
  })

  const addMutation = useMutation({
    mutationFn: createWeeklyHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyHabits'] })
      setShowAdd(false)
      setSelectedTemplate(null)
      setTargetDays(3)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteWeeklyHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weeklyHabits'] }),
  })

  const handleAdd = () => {
    if (!selectedTemplate) return
    addMutation.mutate({
      habit_template_id: selectedTemplate,
      target_days: targetDays,
      week_start: weekStart,
    })
  }

  const grouped = templates?.reduce((acc, t) => {
    acc[t.category] = acc[t.category] || []
    acc[t.category].push(t)
    return acc
  }, {})

  const metCount = habits?.filter(h => h.met).length || 0
  const totalCount = habits?.length || 0
  const overallProgress = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0

  if (isLoading) return <p className="text-zinc-500">Loading...</p>

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Weekly</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-lime-500 text-zinc-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-lime-400 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>
      <p className="text-zinc-500 text-sm mb-6">Week of {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMMM d')}</p>

      {/* Summary */}
      {totalCount > 0 && (
        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-4 mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-zinc-400">Overall Progress</p>
            <p className="text-2xl font-bold">{metCount}<span className="text-zinc-500 text-lg">/{totalCount}</span></p>
          </div>
          <div className="bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-lime-500 h-2 rounded-full transition-all duration-700 progress-glow"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Panel */}
      {showAdd && (
        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-4 mb-6 animate-slide-in">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Pick a habit</p>
          <div className="max-h-48 overflow-y-auto mb-4 space-y-3">
            {grouped && Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-[10px] font-bold text-lime-500/60 uppercase tracking-widest mb-1.5">{category}</p>
                <div className="space-y-1">
                  {items.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                        selectedTemplate === t.id
                          ? 'bg-lime-500 text-zinc-900 font-semibold scale-[1.02]'
                          : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Target days</p>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <button
                key={n}
                onClick={() => setTargetDays(n)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                  targetDays === n
                    ? 'bg-lime-500 text-zinc-900 scale-110'
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={handleAdd}
            disabled={!selectedTemplate}
            className="w-full bg-lime-500 text-zinc-900 font-bold py-2.5 rounded-xl hover:bg-lime-400 transition-all duration-200 disabled:opacity-30"
          >
            Add Habit
          </button>
        </div>
      )}

      {habits?.length === 0 && !showAdd && (
        <p className="text-zinc-500 text-center py-8">No habits set. Tap + Add to get started!</p>
      )}

      {/* Habits List */}
      <div className="space-y-3 stagger">
        {habits?.map(habit => (
          <div
            key={habit.id}
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              habit.met ? 'bg-lime-500/5 border-lime-500/20 glow-border' : 'bg-zinc-900/80 border-zinc-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">{habit.habit_template.name}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{habit.habit_template.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-zinc-400">{habit.progress}</span>
                <button
                  onClick={() => deleteMutation.mutate(habit.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-lime-500 h-2 rounded-full transition-all duration-500 progress-glow"
                  style={{ width: `${Math.min((habit.days_completed / habit.target_days) * 100, 100)}%` }}
                />
              </div>
              {!habit.met && (
                <button
                  onClick={() => logMutation.mutate(habit.id)}
                  className="w-9 h-9 rounded-xl bg-lime-500 text-zinc-900 font-bold flex items-center justify-center hover:bg-lime-400 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  ✓
                </button>
              )}
              {habit.met && (
                <div className="w-9 h-9 rounded-xl bg-lime-500/20 flex items-center justify-center">
                  <span className="text-lime-400">✓</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}