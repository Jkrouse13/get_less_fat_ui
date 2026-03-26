import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { generateDailyTasks, completeTask } from '../api/tasks'
import { getWeeklyHabits, logHabitToday } from '../api/habits'
import { getMonthlyGoals } from '../api/goals'
import { format, startOfWeek, startOfMonth } from 'date-fns'

export default function Today() {
  const queryClient = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['dailyTasks', today],
    queryFn: () => generateDailyTasks(today),
  })

  const { data: habits } = useQuery({
    queryKey: ['weeklyHabits', weekStart],
    queryFn: () => getWeeklyHabits(weekStart),
  })

  const { data: goals } = useQuery({
    queryKey: ['monthlyGoals', monthStart],
    queryFn: () => getMonthlyGoals(monthStart),
  })

  const completeMutation = useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyTasks'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyGoals'] })
    },
  })

  const logHabitMutation = useMutation({
    mutationFn: logHabitToday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyHabits'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyGoals'] })
    },
  })

  if (tasksLoading) return <p className="text-zinc-500">Loading...</p>

  const completedCount = tasks?.filter(t => t.completed).length || 0
  const totalCount = tasks?.length || 0
  const dailyProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const habitsMetCount = habits?.filter(h => h.met).length || 0
  const totalHabits = habits?.length || 0

  const goalsAvgProgress = goals?.length
    ? Math.round(goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length)
    : 0

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold mb-1 tracking-tight">Today</h1>
      <p className="text-zinc-500 text-sm mb-6">{format(new Date(), 'EEEE, MMMM d')}</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8 stagger">
        <SummaryCard label="Exercises" value={`${completedCount}/${totalCount}`} progress={dailyProgress} />
        <SummaryCard label="Habits" value={`${habitsMetCount}/${totalHabits}`} progress={totalHabits > 0 ? Math.round((habitsMetCount / totalHabits) * 100) : 0} />
        <SummaryCard label="Goals" value={`${goalsAvgProgress}%`} progress={goalsAvgProgress} />
      </div>

      {/* Daily Tasks */}
      <SectionHeader icon="💪" title="Exercises" />
      {tasks?.length === 0 && (
        <p className="text-zinc-500 mb-6">Rest day!</p>
      )}
      <div className="space-y-3 mb-8 stagger">
        {tasks?.map(task => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
              task.completed
                ? 'bg-lime-500/5 border-lime-500/20 glow-border'
                : 'bg-zinc-900/80 border-zinc-800/50 hover:border-zinc-700'
            }`}
          >
            <div>
              <p className={`font-semibold ${task.completed ? 'line-through text-zinc-600' : ''}`}>
                {task.exercise.name}
              </p>
              <p className="text-sm text-zinc-500">
                {task.assigned_value} {task.exercise.unit}
              </p>
            </div>
            {!task.completed && (
              <button
                onClick={() => completeMutation.mutate(task.id)}
                className="bg-lime-500 text-zinc-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-lime-400 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Done
              </button>
            )}
            {task.completed && (
              <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center">
                <span className="text-lime-400 text-sm">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Weekly Habits */}
      {habits?.length > 0 && (
        <>
          <SectionHeader icon="🔄" title="Weekly Habits" />
          <div className="space-y-3 mb-8 stagger">
            {habits.map(habit => (
              <div
                key={habit.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  habit.met ? 'bg-lime-500/5 border-lime-500/20 glow-border' : 'bg-zinc-900/80 border-zinc-800/50'
                }`}
              >
                <div className="flex-1 mr-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-sm">{habit.habit_template.name}</p>
                    <span className="text-xs text-zinc-500 font-mono">{habit.progress}</span>
                  </div>
                  <div className="bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-lime-500 h-1.5 rounded-full transition-all duration-500 progress-glow"
                      style={{ width: `${Math.min((habit.days_completed / habit.target_days) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                {!habit.met && (
                  <button
                    onClick={() => logHabitMutation.mutate(habit.id)}
                    className="w-9 h-9 rounded-xl bg-lime-500 text-zinc-900 font-bold flex items-center justify-center hover:bg-lime-400 hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    ✓
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Monthly Goals */}
      {goals?.length > 0 && (
        <>
          <SectionHeader icon="🎯" title="Monthly Goals" />
          <div className="space-y-3 stagger">
            {goals.map(goal => (
              <div
                key={goal.id}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  goal.met ? 'bg-lime-500/5 border-lime-500/20 glow-border' : 'bg-zinc-900/80 border-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-semibold text-sm">{goal.monthly_goal_template.name}</p>
                  <span className="text-xs text-zinc-500 font-mono">
                    {Number(goal.current_value)}/{Number(goal.target_value)} {goal.monthly_goal_template.unit}
                  </span>
                </div>
                <div className="bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-lime-500 h-1.5 rounded-full transition-all duration-500 progress-glow"
                    style={{ width: `${goal.progress_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, progress }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-white mb-2">{value}</p>
      <div className="bg-zinc-800 rounded-full h-1 overflow-hidden">
        <div
          className="bg-lime-500 h-1 rounded-full transition-all duration-700 progress-glow"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span>{icon}</span>
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</h2>
    </div>
  )
}