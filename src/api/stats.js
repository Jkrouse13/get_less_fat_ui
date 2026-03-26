import client from './client'

export const getLifetimeStats = () =>
  client.get('/lifetime_stats').then(r => r.data)