import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReferendumById, updateReferendum } from '../api';
import { useAuth } from '../context/AuthContext';
import ReferendumForm from '../components/ReferendumForm';

export default function EditReferendum() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [referendum, setReferendum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    useEffect(() => {
    if (!user || user.role !== 'admin') {
        navigate('/');
        return;
    }

    const fetchReferendum = async () => {
        try {
        const response = await getReferendumById(id);
        const data = response.data;

        // Jeśli response.data to lista (np. [ {...} ])
        if (Array.isArray(data) && data.length > 0) {
            setReferendum(data[0]);
        } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
            // Jeśli response.data ma strukturę paginowaną (np. { results: [ {...} ] })
            setReferendum(data.results[0]);
        } else {
            setError('Nie znaleziono referendum.');
        }
        } catch (err) {
        console.error('Błąd podczas pobierania referendum:', err);
        setError('Nie udało się załadować danych.');
        } finally {
        setLoading(false);
        }
    };

    fetchReferendum();
    }, [id, user, navigate]);

  const handleSubmit = async (formData) => {
    try {
      await updateReferendum(id, formData);
      navigate('/moderate');
    } catch (err) {
      console.error('Błąd podczas aktualizacji:', err);
      alert('Aktualizacja nie powiodła się.');
    }
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!referendum) return <p>Referendum nie znaleziono.</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Edytuj Referendum</h2>
      <ReferendumForm
        initialValues={referendum}
        onSubmit={handleSubmit}
        submitText="Zapisz zmiany"
      />
    </div>
  );
}
