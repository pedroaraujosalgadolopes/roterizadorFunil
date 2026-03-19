import { NavLink } from 'react-router-dom';
import { PlusCircle, Truck, Map, History, LayoutDashboard, Eye } from 'lucide-react';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nova-viagem', icon: PlusCircle,       label: 'Nova Viagem' },
  { to: '/entregas',    icon: Truck,            label: 'Entregas' },
  { to: '/roteiro',     icon: Map,              label: 'Roteiro' },
  { to: '/historico',   icon: History,          label: 'Histórico' },
  { to: '/status',      icon: Eye,              label: 'Status Entregas' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo CPFL */}
      <div className="p-4 border-b border-gray-800 flex flex-col items-center gap-2">
        <img
          src="/logo-cpfl.jpeg"
          alt="CPFL Funil"
          className="w-28 object-contain rounded"
        />
        <div className="w-full h-0.5 bg-cpfl-yellow rounded-full opacity-60" />
        <span className="text-xs text-gray-400 tracking-widest uppercase font-semibold">Roteirizador</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-cpfl-navy text-white border border-cpfl-blue/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-[10px] text-gray-600 text-center">CPFL Funil · Logística</p>
      </div>
    </aside>
  );
}
