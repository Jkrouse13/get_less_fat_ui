import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Today', icon: '⚡' },
  { to: '/weekly', label: 'Weekly', icon: '🔄' },
  { to: '/monthly', label: 'Monthly', icon: '🎯' },
  { to: '/stats', label: 'Stats', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Nav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/50 px-2 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-lime-500/15 text-lime-400 scale-105'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}