import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReferendums, deleteReferendum } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Moderate() {
  const { user } = useAuth();
  const [referendums, setReferendums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchReferendums = async () => {
      try {
        setLoading(true);
        const response = await getReferendums({ expand: 'creator' });
        setReferendums(response.data);
      } catch (error) {
        console.error('Failed to fetch referendums:', error);
        setError('Failed to load referendums.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferendums();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this referendum?')) return;

    try {
      await deleteReferendum(id);
      setReferendums(prev => prev.filter(ref => ref.id !== id));
    } catch (error) {
      console.error('Failed to delete referendum:', error);
      alert('An error occurred while deleting.');
    }
  };

  const filteredReferendums = referendums.filter(ref => {
    const matchesSearch = ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ref.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || ref.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Referendum Moderation</h2>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', flexGrow: 1, minWidth: '250px' }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem'}}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && filteredReferendums.length === 0 && (
        <p>No matching referendums to display.</p>
      )}

      {filteredReferendums.map(ref => (
        <div key={ref.id} style={{
          border: '1px solid #ccc',
          padding: '1rem',
          marginBottom: '1rem',
          borderRadius: '6px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <h3>{ref.title}</h3>
          <p>{ref.description}</p>
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            <strong>Creator:</strong> {ref.creator?.username || `User #${ref.creator_id}`}
          </p>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate(`/referendums/edit/${ref.id}`)}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(ref.id)}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}