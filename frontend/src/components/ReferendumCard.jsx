import { formatDateTime, formatDateOnly } from '../utils/dateFormatter';

export default function ReferendumCard({ referendum }) {
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
    </div>
  );
}