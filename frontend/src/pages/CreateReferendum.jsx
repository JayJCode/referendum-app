import { useEffect, useState} from 'react';
import { formatDateTime, formatDateOnly } from '../utils/dateFormatter';
import { getVotesByReferendumId, createVote } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ReferendumCard({ referendum }) {
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const data = await getVotesByReferendumId(referendum.id);
        setVotes(data);
        if (user) {
          const alreadyVoted = data.some(v => v.user_id === user.id);
          setHasVoted(alreadyVoted);
        }
      } catch (error) {
        console.error('Failed to fetch votes:', error);
        setError('Błąd wczytywania głosów.');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [referendum.id, user]);

  const handleVote = async (voteValue) => {
    try {
      await createVote(referendum.id, voteValue);
      // Odśwież listę głosów
      const updatedVotes = await getVotesByReferendumId(referendum.id);
      setVotes(updatedVotes);
      setHasVoted(true);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Nie udało się oddać głosu.');
      }
    }
  };

  const votesFor = votes.filter(v => v.vote_value === true).length;
  const votesAgainst = votes.filter(v => v.vote_value === false).length;

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
      ':hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }}>
      <h3 style={{ marginTop: 0 }}>{referendum.title}</h3>
      <p>{referendum.description}</p>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <span>Created by: {referendum.creator?.username || `User #${referendum.creator_id}`}</span>
        <span>{formatDateTime(referendum.start_date)}</span>
      </div>
      {referendum.start_date && (
        <div style={{ marginTop: '0.5rem' }}>
          <strong>Voting Period: </strong>
          {formatDateOnly(referendum.start_date)} → {formatDateOnly(referendum.end_date)}
        </div>
      )}

      {/* Głosy */}
      <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
        {loading ? (
          <p>Loading votes...</p>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ color: 'green' }}>✅ Za: {votesFor}</span>
            <span style={{ color: 'red' }}>❌ Przeciw: {votesAgainst}</span>
          </div>
        )}
      </div>

      {/* Głosowanie */}
      {user && !loading && !hasVoted && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button onClick={() => handleVote(true)} style={{ padding: '0.5rem 1rem' }}>
            Głosuj ZA
          </button>
          <button onClick={() => handleVote(false)} style={{ padding: '0.5rem 1rem' }}>
            Głosuj PRZECIW
          </button>
        </div>
      )}

      {/* Komunikat */}
      {user && hasVoted && (
        <p style={{ marginTop: '1rem', color: '#888' }}>Już oddałeś głos w tym referendum.</p>
      )}

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
      )}
    </div>
  );
}
