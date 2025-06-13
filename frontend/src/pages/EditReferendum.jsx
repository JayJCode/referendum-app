import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getReferendumById,
  updateReferendum,
  getTagsByReferendumId,
  getTags,
  createTag,
  addTagToReferendum,
  removeTagFromReferendum,
} from '../api';
import { useAuth } from '../context/AuthContext';
import ReferendumForm from '../components/ReferendumForm';

export default function EditReferendum() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [referendum, setReferendum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchReferendum = async () => {
      try {
        const response = await getReferendumById(id);
        const data = response.data;

        let referendumData;
        if (Array.isArray(data) && data.length > 0) {
          referendumData = data[0];
        } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          referendumData = data.results[0];
        } else {
          setError("We couldn't find referendum.");
          return;
        }

        const tagsResponse = await getTagsByReferendumId(id);
        const tagNames = tagsResponse.data?.tags?.map(t => t.name) || [];

        setReferendum({
          ...referendumData,
          tags: tagNames,
        });
      } catch (err) {
        console.error('Error occurred:', err);
        setError('Failed loading data of referendum.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferendum();
  }, [id, user, navigate]);

  const handleSubmit = async (formData) => {
    try {
      const { tags, ...referendumData } = formData;

      await updateReferendum(id, referendumData);

      const existingTagsResponse = await getTagsByReferendumId(id);
      const existingTags = existingTagsResponse.data?.tags || [];

      if (existingTags.length > 0) {
        for (const tag of existingTags) {
          try {
            await removeTagFromReferendum(id, tag.id);
          } catch (err) {
            console.warn(`Failed to delete tag "${tag.name}" (id: ${tag.id})`, err);
          }
        }
      }

      const allTagsResponse = await getTags();
      const allTags = allTagsResponse.data;

      for (const tagName of tags) {
        const trimmed = tagName.trim();
        if (!trimmed) continue;

        let tagId;
        const existing = allTags.find(t => t.name.toLowerCase() === trimmed.toLowerCase());

        if (existing) {
          tagId = existing.id;
        } else {
          const createdTag = await createTag(trimmed);
          tagId = createdTag.data.id;
        }

        await addTagToReferendum(Number(id), tagId);
      }

      navigate('/moderate');
    } catch (err) {
      console.error('Error during update:', err);
      if (err.response?.data?.detail) {
        console.error('Validation errors:', err.response.data.detail);
        err.response.data.detail.forEach(e => {
          console.error(`Field ${e.loc.join('.')} – ${e.msg}`);
        });
      }
      alert('Updating referendum failed.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!referendum) return <p>Referendum not found.</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ paddingTop: '5rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Edit Referendum</h2>
        <ReferendumForm
          initialValues={referendum}
          onSubmit={handleSubmit}
          submitText="Save changes"
          showDates={true}
          showStatus={true}
        />
      </div>
    </div>
  );
}
