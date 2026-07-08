import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '15px', background: '#1a1a1a', color: 'white' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
      <Link to="/tournaments" style={{ color: 'white', textDecoration: 'none' }}>Tournaments</Link>
      
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <>
            <span style={{ marginRight: '10px' }}>Hi, {user.username}</span>
            <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', marginRight: '10px' }}>Login</Link>
            <Link to="/register" style={{ color: 'white' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}