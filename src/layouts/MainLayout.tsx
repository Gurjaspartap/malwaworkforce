import { Outlet, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Clock, Settings, LogOut } from 'lucide-react';
import './MainLayout.css';

export default function MainLayout() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="layout-container">
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <h2 className="text-gradient">ShiftTracker</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/log-shift" className="nav-item">
            <Clock size={20} /> Log Shift
          </Link>
          <Link to="/settings" className="nav-item">
            <Settings size={20} /> Settings
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-secondary w-full">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
