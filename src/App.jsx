import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Today from './pages/Today'
import Weekly from './pages/Weekly'
import Monthly from './pages/Monthly'
import Stats from './pages/Stats'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="weekly" element={<Weekly />} />
        <Route path="monthly" element={<Monthly />} />
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}