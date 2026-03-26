import client from './client'

export const getMonthlyGoalTemplates = () =>
  client.get('/monthly_goal_templates').then(r => r.data)

export const getMonthlyGoals = (monthStart) =>
  client.get('/monthly_goals', { params: { month_start: monthStart } }).then(r => r.data)

export const createMonthlyGoal = (data) =>
  client.post('/monthly_goals', { monthly_goal: data }).then(r => r.data)

export const updateMonthlyGoal = (id, data) =>
  client.patch(`/monthly_goals/${id}`, { monthly_goal: data }).then(r => r.data)

export const deleteMonthlyGoal = (id) =>
  client.delete(`/monthly_goals/${id}`)

export const logGoalEntry = (id, value) =>
  client.post(`/monthly_goals/${id}/log_entry`, { value }).then(r => r.data)