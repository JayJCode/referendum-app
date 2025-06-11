import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReferendums, getUserReferendums, getTagsByReferendumId } from '../api';
import ReferendumCard from '../components/ReferendumCard';

export default function Referendums() {
  const { user } = useAuth();
  const [referendums, setReferendums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    showMineOnly: false,
    status: 'all'
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

        const refs = response.data;
        
        const withTags = await Promise.all(
          refs.map(async (r) => {
            try {
              const tagsRes = await getTagsByReferendumId(r.id);
              const tagNames = (tagsRes.data.tags || []).map(t => t.name.toLowerCase());
              return { ...r, tags: tagNames };
            } catch {
              return { ...r, tags: [] };
            }
          })
        );

        setReferendums(withTags);
      } catch (error) {
        console.error('Error fetching referendums:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.showMineOnly, user]);

  const filteredReferendums = referendums.filter(ref => {
    const term = filters.search.trim().toLowerCase();

    if (term.startsWith('#')) {
      const tagSearch = term.slice(1);
      if (!ref.tags || !ref.tags.includes(tagSearch)) {
        return false;
      }
    } else if (term) {
      const inTitle = ref.title.toLowerCase().includes(term);
      const inDesc = ref.description.toLowerCase().includes(term);
      if (!inTitle && !inDesc) {
        return false;
      }
    }

    if (filters.status !== 'all' && ref.status !== filters.status) {
      return false;
    }

    return true;
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Browse Referendums</h2>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Search (use #tag for tags)"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ padding: '0.5rem', flexGrow: 1 }}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={{ padding: '0.5rem' }}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {user && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={filters.showMineOnly}
              onChange={(e) => setFilters({ ...filters, showMineOnly: e.target.checked })}
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
              <ReferendumCard key={referendum.id} referendum={referendum} />
            ))
          ) : (
            <p>No referendums found</p>
          )}
        </div>
      )}
    </div>
  );
}
