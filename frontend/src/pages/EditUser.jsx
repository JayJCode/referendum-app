import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get(`/users/`, {
          params: { user_id: id }
        });
        const data = res.data[0];
        setForm({
          username: data.username,
          email: data.email,
          password: ''
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/users/`, form, {
        params: { user_id: id }
      });
      navigate('/users');
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2>Edit User</h2>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="New Password (optional)"
        value={form.password}
        onChange={handleChange}
      />
      <button
        type="submit"
        style={{
          padding: '0.5rem 1rem',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Save
      </button>
    </form>
  );
}
