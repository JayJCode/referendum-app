import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getTags, createTag, deleteTag } from '../api';

export default function Tags() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchTags = async () => {
      try {
        setLoading(true);
        const res = await getTags();
        setTags(res.data);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        setError('Failed to load tags list.');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;

    try {
      await deleteTag(id);
      setTags(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert(error.response?.data?.detail || 'An error occurred while deleting the tag.');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      alert('Tag name cannot be empty');
      return;
    }

    try {
      const res = await createTag(newTagName.trim());
      setTags(prev => [...prev, res.data]);
      setNewTagName('');
    } catch (error) {
      console.error('Failed to create tag:', error);
      alert(error.response?.data?.detail || 'An error occurred while creating the tag.');
    }
  };

  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Tags Management</h2>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by tag name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', flexGrow: 1, minWidth: '250px' }}
        />
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="New tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          style={{ padding: '0.5rem', flexGrow: 1, maxWidth: '300px' }}
        />
        <button
          onClick={handleCreateTag}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Tag
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && filteredTags.length === 0 && (
        <p>No tags found.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filteredTags.map(t => (
          <div key={t.id} style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '6px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p><strong>{t.name}</strong></p>
            </div>
            <button
              onClick={() => handleDelete(t.id)}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                height: 'fit-content'
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}