import { useEffect, useState } from 'react';
import { formatDateTime, formatDateOnly } from '../utils/dateFormatter';
import { getVotesByReferendumId } from '../api';
import { createVote } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ReferendumCard({ referendum }) {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteError, setVoteError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const data = await getVotesByReferendumId(referendum.id);
        setVotes(data);
        if (user) {
          const voted = data.some(v => v.user_id === user.id);
          setHasVoted(voted);
        }
      } catch (error) {
        console.error('Failed to fetch votes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [referendum.id, user]);

  const votesFor = votes.filter(v => v.vote_value === true).length;
  const votesAgainst = votes.filter(v => v.vote_value === false).length;

  const handleVote = async (voteValue) => {
    try {
      await createVote({
        referendum_id: referendum.id,
        vote_value: voteValue
      });
      setHasVoted(true);
      setVoteError('');
      
      // opcjonalnie odśwież głosy:
      const updatedVotes = await getVotesByReferendumId(referendum.id);
      setVotes(updatedVotes);
    } catch (error) {
      console.error('Vote failed:', error);
      if (error.response?.data?.detail) {
        setVoteError(error.response.data.detail);
      } else {
        setVoteError('Błąd podczas głosowania. Spróbuj ponownie.');
      }
    }
  };

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
            <span>✅ Za: {votesFor}</span>
            <span>❌ Przeciw: {votesAgainst}</span>
          </div>
        )}
      </div>
      {/* Głosowanie */}
      {!loading && user && !hasVoted && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button onClick={() => handleVote(true)}>✅ Głosuj ZA</button>
          <button onClick={() => handleVote(false)}>❌ Głosuj PRZECIW</button>
        </div>
      )}

      {hasVoted && (
        <p style={{ marginTop: '1rem', color: 'green' }}>✅ Twój głos został oddany</p>
      )}

      {voteError && (
        <p style={{ marginTop: '1rem', color: 'red' }}>{voteError}</p>
      )}
    </div>
  );
}
