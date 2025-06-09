import { useNavigate } from 'react-router-dom';
import { createReferendum } from '../api';
import ReferendumForm from '../components/ReferendumForm';
import { useAuth } from '../context/AuthContext';

export default function CreateReferendum() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await createReferendum({ ...formData, creator_id: user.id });
      navigate('/referendums');
    } catch (err) {
      console.error('Błąd podczas tworzenia referendum:', err);
      alert('Nie udało się utworzyć referendum.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Utwórz nowe referendum</h2>
      <ReferendumForm
        onSubmit={handleSubmit}
        submitText="Utwórz"
      />
    </div>
  );
}