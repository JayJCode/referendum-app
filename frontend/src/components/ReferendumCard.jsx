import { useEffect, useState } from 'react';
import { formatDateOnly } from '../utils/dateFormatter';
import { useAuth } from '../context/AuthContext';
import { getTagsByReferendumId, getVotesByReferendumId, createVote } from '../api';


export default function ReferendumCard({ referendum }) {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [tags, setTags] = useState([]);
  const { user } = useAuth();

  const now = new Date();
  const startDate = referendum.start_date ? new Date(referendum.start_date) : null;
  const endDate = referendum.end_date ? new Date(referendum.end_date) : null;

  const canVote =
    referendum.status === 'active' &&
    startDate &&
    endDate &&
    now >= startDate &&
    now <= endDate;

  useEffect(() => {
    const fetchVotesAndTags = async () => {
      try {
        const [voteData, tagResponse] = await Promise.all([
          getVotesByReferendumId(referendum.id),
          getTagsByReferendumId(referendum.id)
        ]);

        setVotes(voteData);
        setTags(tagResponse.data.tags || []);

        if (user) {
          const voted = voteData.some(v => v.user_id === user.id);
          setHasVoted(voted);
        }
      } catch (error) {
        console.error('Failed to fetch votes or tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotesAndTags();
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

      const updatedVotes = await getVotesByReferendumId(referendum.id);
      setVotes(updatedVotes);
    } catch (error) {
      console.error('Vote failed:', error);
      if (error.response?.data?.detail) {
        setVoteError(error.response.data.detail);
      } else {
        setVoteError('Error accured, try again later.');
      }
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      gap: '2rem',
      flexWrap: 'wrap'
    }}>
      {/* LEWA KOLUMNA */}
      <div style={{ flex: 1, minWidth: '250px' }}>
        <h3 style={{ marginTop: 0 }}>{referendum.title}</h3>
        <div style={{
          display: 'inline-block',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor:
            referendum.status === 'active' ? '#d1fae5' :
            referendum.status === 'pending' ? '#fef3c7' :
            referendum.status === 'closed' ? '#e5e7eb' :
            referendum.status === 'cancelled' ? '#fee2e2' : '#e5e5e5',
          color:
            referendum.status === 'active' ? '#065f46' :
            referendum.status === 'pending' ? '#92400e' :
            referendum.status === 'closed' ? '#374151' :
            referendum.status === 'cancelled' ? '#991b1b' : '#333',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          marginBottom: '0.5rem'
        }}>
          {referendum.status.toUpperCase()}
        </div>
        <p>{referendum.description}</p>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          Created by: {referendum.creator?.username || `User #${referendum.creator_id}`}
        </div>
        {/* Tagi */}
        {tags.length > 0 && (
          <div style={{ marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags.map(tag => (
              <span key={tag.id} style={{
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* PRAWA KOLUMNA */}
      <div style={{ 
        flex: 1,
        minWidth: '250px',
        maxWidth: '320px',
        marginLeft: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {referendum.start_date && referendum.end_date ? (
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Period:</strong> {formatDateOnly(referendum.start_date)} → {formatDateOnly(referendum.end_date)}
          </div>
        ) : (
          <div style={{ marginBottom: '0.5rem', color: 'gray' }}>
            <strong>Period:</strong> Date not set yet
          </div>
        )}

        {/* Głosy */}
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {loading ? (
            <p>Loading votes...</p>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span><strong>Votes:</strong></span>
              <span>✅: {votesFor}</span>
              <span>❌: {votesAgainst}</span>
            </div>
          )}
        </div>

        {/* Głosowanie */}
        {!loading && user && !hasVoted && (
          <>
            {!canVote ? (
              <p style={{ color: 'gray', fontSize: '0.9rem' }}>
                🕒 Voting is unavailable.
                {referendum.status === 'pending' && <span> Referendum hasn't been approved.</span>}
                {referendum.status === 'closed' && <span> Time for voting has gone.</span>}
                {referendum.status === 'canceled' && <span> Referendum was unproper.</span>}
              </p>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button onClick={() => handleVote(true)}>✅ Vote for</button>
                <button onClick={() => handleVote(false)}>❌ Vote against</button>
              </div>
            )}
          </>
        )}

        {hasVoted && (
          <p style={{ color: 'gray', fontSize: '0.9rem' }}>You have already voted!</p>
        )}

        {voteError && (
          <p style={{ marginTop: '0.5rem', color: 'red' }}>{voteError}</p>
        )}
      </div>
    </div>
  );
}
