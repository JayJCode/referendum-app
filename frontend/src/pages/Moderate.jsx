import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReferendums, deleteReferendum } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Moderate() {
  const { user } = useAuth();
  const [referendums, setReferendums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError('Nie udało się pobrać referendum.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferendums();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to referendum?')) return;

    try {
      await deleteReferendum(id);
      setReferendums(prev => prev.filter(ref => ref.id !== id));
    } catch (error) {
      console.error('Failed to delete referendum:', error);
      alert('Wystąpił błąd podczas usuwania.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Moderacja Referendów</h2>

      {loading && <p>Ładowanie...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && referendums.length === 0 && (
        <p>Brak dostępnych referendum do moderacji.</p>
      )}

      {referendums.map(ref => (
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
            <strong>Twórca:</strong> {ref.creator?.username || `User #${ref.creator_id}`}
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
              Edytuj
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
              Usuń
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
