import { useEffect, useState } from 'react';
import { formatDateTime, formatDateOnly } from '../utils/dateFormatter';
import { getVotesByReferendumId } from '../api';

export default function ReferendumCard({ referendum }) {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const data = await getVotesByReferendumId(referendum.id);
        setVotes(data);
      } catch (error) {
        console.error('Failed to fetch votes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [referendum.id]);

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
            <span>✅ Za: {votesFor}</span>
            <span>❌ Przeciw: {votesAgainst}</span>
          </div>
        )}
      </div>
    </div>
  );
}
