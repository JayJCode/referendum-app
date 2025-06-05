import { useState } from 'react';
import API from '../api';

export default function ApiTest() {
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);

  const testConnection = async () => {
    try {
      setMessage('Calling API...');
      const response = await API.get('/');
      setData(response.data);
      setMessage('API connection successful!');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
      setData(null);
    }
  };

  return (
    <div style={{ margin: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
      <h3>Backend Connection Test</h3>
      <button onClick={testConnection}>Test API Connection</button>
      <p>{message}</p>
      {data && (
        <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}