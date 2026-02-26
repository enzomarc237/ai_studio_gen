import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Lightbulb, FileText, LayoutTemplate, Settings, MessageSquare, LogOut } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Brainstorm', path: '/app/brainstorm', icon: Lightbulb },
    { name: 'Document Gen', path: '/app/generator', icon: FileText },
    { name: 'UI Gen', path: '/app/ui-generator', icon: LayoutTemplate },
    { name: 'Chatbot', path: '/app/chatbot', icon: MessageSquare },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900">
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">AI Studio</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                  isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600 truncate">{user?.email}</span>
            <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
