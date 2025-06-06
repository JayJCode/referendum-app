import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' // Default role
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await API.post('/users/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      navigate('/login', { 
        state: { 
          registrationSuccess: true,
          username: response.data.username 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Register New Account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username">Username*</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email*</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password*</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="confirmPassword">Confirm Password*</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <a href="/login" style={{ color: '#007bff' }}>Login here</a>
      </p>
    </div>
  );
}