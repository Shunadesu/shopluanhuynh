import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useSpinConfig() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/spin/config');
        if (!cancelled) {
          setData(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Lỗi tải cấu hình vòng quay');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

export function useMySpins() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSpins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/spin/my-spins');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải số lượt quay');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpins();
  }, []);

  return { data, loading, error, refetch: fetchSpins };
}

export function useSpinHistory(page = 1, limit = 20) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/spin/history?page=${page}&limit=${limit}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải lịch sử quay');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, limit]);

  return { data, loading, error, refetch: fetchHistory };
}

export async function spinWheel() {
  try {
    const res = await api.post('/spin/spin');
    return { success: true, data: res.data };
  } catch (err) {
    return { 
      success: false, 
      error: err.response?.data?.message || 'Lỗi khi quay' 
    };
  }
}
