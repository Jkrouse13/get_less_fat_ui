import client from './client'

export const generateDailyTasks = (date) =>
  client.get('/daily_tasks/generate', { params: { date } }).then(r => r.data)

export const getDailyTasks = (date) =>
  client.get('/daily_tasks', { params: { date } }).then(r => r.data)

export const completeTask = (id) =>
  client.patch(`/daily_tasks/${id}/complete`).then(r => r.data)

export const getDailyStats = (date) =>
  client.get('/daily_tasks/stats', { params: { date } }).then(r => r.data)