import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, Bot, Database, LayoutDashboard, LogOut, ShieldCheck, Sparkles, UserCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppShell() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('admin_logged_in') === 'true');
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('admin_email') || '');

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(localStorage.getItem('admin_logged_in') === 'true');
      setAdminEmail(localStorage.getItem('admin_email') || '');
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_email');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const links = [
    { label: 'Home', href: '/', icon: BookOpen },
    { label: 'AI Assistant', href: '/assistant', icon: BrainIcon },
    { label: 'Power BI', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Data Viewer', href: '/viewer', icon: Database },
    ...(isLoggedIn
      ? [{ label: 'Admin Console', href: '/admin', icon: Users }]
      : [{ label: 'Admin Login', href: '/login', icon: ShieldCheck }]),
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Bot size={22} />
          </div>
          <div className="brand-text">
            <strong>AI Workforce</strong>
            <small>Talent Intelligence Suite</small>
          </div>
        </Link>

        <nav className="nav-list">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                end={link.href === '/'}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {isLoggedIn ? (
          <div className="sidebar-footer" style={{ border: '1px solid var(--success-border)', background: 'var(--success-light)' }}>
            <strong style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={14} /> Admin Authenticated
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text)', margin: '4px 0 8px' }}>
              {adminEmail || 'admin@ai.com'}
            </p>
            <button className="button button-sm button-danger" type="button" onClick={handleSignOut} style={{ width: '100%' }}>
              <LogOut size={14} /> Sign Out Admin
            </button>
          </div>
        ) : (
          <div className="sidebar-footer">
            <strong><Sparkles size={14} style={{ color: 'var(--accent)' }} /> RAG & Analytics Hub</strong>
            <p>Sharp light interface connected to FastAPI, ChromaDB, Gemini LLM & Neon PostgreSQL.</p>
          </div>
        )}
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function BrainIcon(props: { size?: number }) {
  return <Bot {...props} />;
}
