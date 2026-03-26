import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMonthlyGoals, getMonthlyGoalTemplates, createMonthlyGoal, deleteMonthlyGoal, logGoalEntry } from '../api/goals'
import { format, startOfMonth } from 'date-fns'

export default function Monthly() {
  const queryClient = useQueryClient()
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const [logValues, setLogValues] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [targetValue, setTargetValue] = useState('')

  const { data: goals, isLoading } = useQuery({
    queryKey: ['monthlyGoals', monthStart],
    queryFn: () => getMonthlyGoals(monthStart),
  })

  const { data: templates } = useQuery({
    queryKey: ['monthlyGoalTemplates'],
    queryFn: getMonthlyGoalTemplates,
    enabled: showAdd,
  })

  const logMutation = useMutation({
    mutationFn: ({ id, value }) => logGoalEntry(id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyGoals'] })
      setLogValues({})
    },
  })

  const addMutation = useMutation({
    mutationFn: createMonthlyGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyGoals'] })
      setShowAdd(false)
      setSelectedTemplate(null)
      setTargetValue('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMonthlyGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monthlyGoals'] }),
  })

  const selectedTemplateFull = templates?.find(t => t.id === selectedTemplate)

  const handleAdd = () => {
    if (!selectedTemplate || !targetValue) return
    addMutation.mutate({
      monthly_goal_template_id: selectedTemplate,
      target_value: Number(targetValue),
      month_start: monthStart,
    })
  }

  const grouped = templates?.reduce((acc, t) => {
    acc[t.category] = acc[t.category] || []
    acc[t.category].push(t)
    return acc
  }, {})

  const metCount = goals?.filter(g => g.met).length || 0
  const totalCount = goals?.length || 0
  const avgProgress = totalCount > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress_percentage, 0) / totalCount)
    : 0

  if (isLoading) return <p className="text-zinc-500">Loading...</p>

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Monthly</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-lime-500 text-zinc-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-lime-400 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>
      <p className="text-zinc-500 text-sm mb-6">{format(new Date(), 'MMMM yyyy')}</p>

      {/* Summary */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6 stagger">
          <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Completed</p>
            <p className="text-3xl font-bold">{metCount}<span className="text-zinc-600 text-lg">/{totalCount}</span></p>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Avg Progress</p>
            <p className="text-3xl font-bold text-lime-400">{avgProgress}<span className="text-lg">%</span></p>
          </div>
        </div>
      )}

      {/* Add Panel */}
      {showAdd && (
        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-4 mb-6 animate-slide-in">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Pick a goal</p>
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
                      {t.name} <span className="text-zinc-500">({t.unit})</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedTemplateFull && (
            <div className="animate-fade-up">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Target ({selectedTemplateFull.unit})
              </p>
              <input
                type="number"
                placeholder={`e.g. 20`}
                value={targetValue}
                onChange={e => setTargetValue(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-white mb-4 focus:border-lime-500/50 focus:outline-none transition-colors"
              />
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!selectedTemplate || !targetValue}
            className="w-full bg-lime-500 text-zinc-900 font-bold py-2.5 rounded-xl hover:bg-lime-400 transition-all duration-200 disabled:opacity-30"
          >
            Add Goal
          </button>
        </div>
      )}

      {goals?.length === 0 && !showAdd && (
        <p className="text-zinc-500 text-center py-8">No goals set. Tap + Add to get started!</p>
      )}

      {/* Goals List */}
      <div className="space-y-3 stagger">
        {goals?.map(goal => (
          <div
            key={goal.id}
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              goal.met ? 'bg-lime-500/5 border-lime-500/20 glow-border' : 'bg-zinc-900/80 border-zinc-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="font-semibold">{goal.monthly_goal_template.name}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{goal.monthly_goal_template.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-zinc-400">{goal.progress_percentage}%</span>
                <button
                  onClick={() => deleteMutation.mutate(goal.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-500 font-mono mb-2">
              {Number(goal.current_value)} / {Number(goal.target_value)} {goal.monthly_goal_template.unit}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-lime-500 h-2 rounded-full transition-all duration-500 progress-glow"
                  style={{ width: `${goal.progress_percentage}%` }}
                />
              </div>
              {!goal.met && (
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder="0"
                    value={logValues[goal.id] || ''}
                    onChange={e => setLogValues({ ...logValues, [goal.id]: e.target.value })}
                    className="w-16 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-2 py-1.5 text-sm text-white focus:border-lime-500/50 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => logMutation.mutate({ id: goal.id, value: logValues[goal.id] })}
                    disabled={!logValues[goal.id]}
                    className="bg-lime-500 text-zinc-900 font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-lime-400 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30"
                  >
                    Log
                  </button>
                </div>
              )}
              {goal.met && (
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