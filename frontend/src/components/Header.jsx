import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header style={{ 
      background: '#333',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <h1>Referendum App</h1>
      
      <nav style={{ display: 'flex', gap: '1rem' }}>
        {user ? (
          <>
            <span>Welcome, {user.username}!</span>
            <button onClick={logout} style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem'
            }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white' }}>
            Login
          </Link>
        )}
        <Link to="/referendums" style={{ color: 'white', marginRight: '1rem' }}>
            Referendums
        </Link>
        {user && (
            <Link 
                to="/referendums/create" 
                style={{
                background: '#28a745',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none'
                }}
            >
                Create Referendum
            </Link>
            )}
      </nav>
    </header>
  );
}