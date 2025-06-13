import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
    const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        const success = await login(username, password);
        if (success) {
        navigate('/');
        }
    } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Login failed');
    } finally {
        setIsLoading(false);
    }
    };
    
  return (
    <div style={{ paddingTop: '5rem', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ 
      maxWidth: '400px', 
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don't have an account? <Link to="/register" style={{ color: '#007bff' }}>Register here</Link>
      </p>
    </div>
    </div>
  );
}