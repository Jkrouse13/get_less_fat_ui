import client from './client'

export const getPreferences = () =>
  client.get('/user_preference').then(r => r.data)

export const updatePreferences = (data) =>
  client.patch('/user_preference', { user_preference: data }).then(r => r.data)