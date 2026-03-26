import client from './client'

export const getHabitTemplates = () =>
  client.get('/habit_templates').then(r => r.data)

export const getWeeklyHabits = (weekStart) =>
  client.get('/weekly_habits', { params: { week_start: weekStart } }).then(r => r.data)

export const createWeeklyHabit = (data) =>
  client.post('/weekly_habits', { weekly_habit: data }).then(r => r.data)

export const updateWeeklyHabit = (id, data) =>
  client.patch(`/weekly_habits/${id}`, { weekly_habit: data }).then(r => r.data)

export const deleteWeeklyHabit = (id) =>
  client.delete(`/weekly_habits/${id}`)

export const logHabitToday = (id) =>
  client.patch(`/weekly_habits/${id}/log_today`).then(r => r.data)