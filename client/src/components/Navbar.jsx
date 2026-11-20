import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNavigate } from 'react-router-dom';
export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth(); const notify = useToast(); const navigate = useNavigate();
  const signOut = async () => { try { await logout(); navigate('/login'); } catch { notify('Could not sign out cleanly. Please try again.', 'error'); } };
  return <header className="topbar"><button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21}/></button><div className="topbar-context"><span>STUDENT SERVICES</span><b>/</b><strong>{user?.department || 'Information Technology'}</strong></div><div className="topbar-actions"><span className="term-chip">ACADEMIC PORTAL</span><button className="icon-button notification-button" title="Notifications"><Bell size={18}/><i/></button><div className="user-menu"><span className="avatar">{user?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div className="user-menu-copy"><strong>{user?.name}</strong><small>{user?.role}</small></div><button onClick={signOut} className="signout-button" title="Sign out"><LogOut size={16}/></button></div></div></header>;
}
