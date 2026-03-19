import { NavLink, useNavigate } from 'react-router-dom';
import { PlusCircle, Truck, Map, History, LayoutDashboard, Eye, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/nova-viagem', icon: PlusCircle,       label: 'Nova Viagem' },
    { to: '/entregas',    icon: Truck,            label: 'Entregas' },
    { to: '/roteiro',     icon: Map,              label: 'Roteiro' },
    { to: '/historico',   icon: History,          label: 'Histórico' },
    { to: '/status',      icon: Eye,              label: 'Status Entregas' },
    ...(user?.role === 'admin' ? [{ to: '/usuarios', icon: Users, label: 'Usuários' }] : []),
  ];

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

      {/* Usuário logado + logout */}
      <div className="p-3 border-t border-gray-800 space-y-2">
        <div className="px-3 py-2 rounded-lg bg-gray-800/50">
          <p className="text-xs text-gray-300 font-medium truncate">{user?.nome}</p>
          <p className="text-[10px] text-gray-600 truncate">{user?.username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  );
}
