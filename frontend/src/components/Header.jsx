import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { notificationsAPI } from '../api';

function Header({ user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (error) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 7000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link to="/" className="logo">
          <span className="logo-mark">CK</span>
          <span>CropKart</span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          <NavLink to="/marketplace">Marketplace</NavLink>
          <NavLink to="/nearby">Nearby</NavLink>
          {user?.role === 'farmer' && <NavLink to="/farmer/dashboard">My Farm</NavLink>}
          {user?.role === 'buyer' && <NavLink to="/buyer/dashboard">Orders</NavLink>}
          {user?.role === 'buyer' && <NavLink to="/favorites">Favorites</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin/dashboard">Admin</NavLink>}
        </nav>

        <div className="nav-buttons">
          {user ? (
            <>
              <div className="notification-wrap">
                <button className="btn btn-secondary notification-button" onClick={() => setOpen((current) => !current)}>
                  Bell {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                </button>
                {open && (
                  <div className="notification-menu">
                    {notifications.length === 0 ? (
                      <p>No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 8).map((notification) => (
                        <button
                          key={notification.id}
                          className={notification.read ? 'read' : ''}
                          onClick={async () => {
                            await notificationsAPI.markRead(notification.id);
                            await loadNotifications();
                          }}
                        >
                          <strong>{notification.type.replace(/_/g, ' ')}</strong>
                          <span>{notification.message}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <span className="user-chip">{user.name}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
