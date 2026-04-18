import React, { createContext, useState } from 'react';
import api from '../config/api';

export const SchemeContext = createContext();

export const SchemeProvider = ({ children }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const schemeContext = {
    schemes,
    loading,
    error,
    getAllSchemes: async (filters = {}) => {
      try {
        setError(null);
        setLoading(true);

        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/schemes?${params.toString()}`);
        setSchemes(response.data.schemes);

        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch schemes';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    getSchemeById: async (id) => {
      try {
        setError(null);
        setLoading(true);

        const response = await api.get(`/schemes/${id}`);
        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch scheme';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
  };

  return <SchemeContext.Provider value={schemeContext}>{children}</SchemeContext.Provider>;
};
