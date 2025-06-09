import { useState } from 'react';

export default function ReferendumForm({ initialValues = {}, onSubmit, submitText = 'Zapisz' }) {
  const [form, setForm] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    start_date: initialValues.start_date ? initialValues.start_date.slice(0, 10) : '',
    end_date: initialValues.end_date ? initialValues.end_date.slice(0, 10) : '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        type="text"
        name="title"
        placeholder="Tytuł"
        value={form.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Opis"
        value={form.description}
        onChange={handleChange}
        required
        rows={4}
      />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" style={{ padding: '0.5rem 1rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px' }}>
        {submitText}
      </button>
    </form>
  );
}
