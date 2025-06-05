import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReferendums, getUserReferendums } from '../api';
import ReferendumCard from '../components/ReferendumCard';

export default function Referendums() {
  const { user } = useAuth();
  const [referendums, setReferendums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    showMineOnly: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        
        if (filters.showMineOnly && user) {
          response = await getUserReferendums(user.id, { expand: 'creator' });
        } else {
          response = await getReferendums({ expand: 'creator' });
        }
        
        setReferendums(response.data);
      } catch (error) {
        console.error('Error fetching referendums:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.showMineOnly, user]);

  const filteredReferendums = referendums.filter(ref =>
    ref.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    ref.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Browse Referendums</h2>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Search referendums..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          style={{ padding: '0.5rem', flexGrow: 1 }}
        />
        
        {user && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={filters.showMineOnly}
              onChange={(e) => setFilters({...filters, showMineOnly: e.target.checked})}
            />
            Show only my referendums
          </label>
        )}
      </div>

      {loading ? (
        <p>Loading referendums...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredReferendums.length > 0 ? (
            filteredReferendums.map((referendum) => (
              <ReferendumCard 
                key={referendum.id} 
                referendum={referendum}
              />
            ))
          ) : (
            <p>No referendums found</p>
          )}
        </div>
      )}
    </div>
  );
}