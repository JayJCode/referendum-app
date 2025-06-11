import { useState } from 'react';

export default function ReferendumForm({
  initialValues = {},
  onSubmit,
  submitText = 'Save',
  showDates = false,
  showStatus = false,
}) {
  const [form, setForm] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    start_date: initialValues.start_date ? initialValues.start_date.slice(0, 10) : '',
    end_date: initialValues.end_date ? initialValues.end_date.slice(0, 10) : '',
    status: initialValues.status || 'pending',
  });

  const [tagsInput, setTagsInput] = useState(
    initialValues.tags ? initialValues.tags.join(', ') : ''
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = { ...form };

    if (!showDates) {
      delete dataToSend.start_date;
      delete dataToSend.end_date;
    }

    if (!showStatus) {
      delete dataToSend.status;
    }

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onSubmit({ ...dataToSend, tags });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
        rows={4}
      />

      {showDates && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
          />
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
          />
        </div>
      )}

      {showStatus && (
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="pending">⏳ Pending</option>
          <option value="active">✅ Active</option>
          <option value="closed">🔒 Closed</option>
          <option value="cancelled">❌ Cancelled</option>
        </select>
      )}

      <input
        type="text"
        name="tags"
        placeholder="Tags (comma separated)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />

      <button
        type="submit"
        style={{
          padding: '0.5rem 1rem',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        {submitText}
      </button>
    </form>
  );
}
