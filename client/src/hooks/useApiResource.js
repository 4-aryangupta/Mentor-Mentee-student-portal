import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';
import { getErrorMessage } from '../services/api.js';
export default function useApiResource(path) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await api.get(path); setData(response.data.data); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [path]);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, setData, loading, error, refresh, setError };
}
