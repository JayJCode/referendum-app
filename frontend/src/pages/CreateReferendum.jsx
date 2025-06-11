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
      console.error('Error accured:', err);
      alert('There was a problem with creating referendum.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Create referendum</h2>
      <ReferendumForm
        onSubmit={handleSubmit}
        submitText="Create"
        showDates={false}
        showStatus={false}
      />
    </div>
  );
}