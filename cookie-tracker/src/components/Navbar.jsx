import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Vetrina', emoji: '🍪' },
    { path: '/forno', label: 'Forno', emoji: '📝' },
    { path: '/shop', label: 'Negozio', emoji: '🛍️' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md border-t-2 border-orange-100 flex justify-around py-3 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40">
      {navItems.map(({ path, label, emoji }) => (
        <Link
          key={path}
          to={path}
          className={`flex flex-col items-center gap-0.5 transition-all ${
            isActive(path)
              ? 'text-orange-600 scale-105'
              : 'text-orange-900/40 hover:text-orange-900/70'
          }`}
        >
          <span className="text-xl">{emoji}</span>
          <span className="text-xs font-bold">{label}</span>
        </Link>
      ))}
    </nav>
  );
}