import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
export default function PortalLayout() {
  const { user } = useAuth(); const [mobileOpen, setMobileOpen] = useState(false); const [collapsed, setCollapsed] = useState(false);
  return <div className={`portal-shell ${collapsed ? 'nav-collapsed' : ''}`}><Sidebar role={user.role} open={mobileOpen} onClose={() => setMobileOpen(false)} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)}/><div className="main-shell"><Navbar onMenu={() => setMobileOpen(true)}/><main className="page-content"><Outlet/></main><footer className="portal-footer"><span>© 2026 Department of Information Technology</span><span>MENTORSHIP & ADVISING SYSTEM <i>•</i> INTERNAL USE</span></footer></div></div>;
}
