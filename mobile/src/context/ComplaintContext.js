import React, { createContext, useState } from 'react';
import api from '../config/api';

export const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const complaintContext = {
    complaints,
    myComplaints,
    loading,
    error,
    createComplaint: async (formData) => {
      try {
        setError(null);
        setLoading(true);

        const response = await api.post('/complaints', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to create complaint';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    getMyComplaints: async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await api.get('/complaints/my-complaints');
        setMyComplaints(response.data.complaints);

        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch complaints';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    getAllComplaints: async (filters = {}) => {
      try {
        setError(null);
        setLoading(true);

        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/complaints/all?${params.toString()}`);
        setComplaints(response.data.complaints);

        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch complaints';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    getComplaintById: async (id) => {
      try {
        setError(null);
        setLoading(true);

        const response = await api.get(`/complaints/${id}`);
        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch complaint';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    updateComplaintStatus: async (id, updateData) => {
      try {
        setError(null);
        setLoading(true);

        const response = await api.put(`/complaints/${id}`, updateData);
        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to update complaint';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    deleteComplaint: async (id) => {
      try {
        setError(null);
        setLoading(true);

        const response = await api.delete(`/complaints/${id}`);
        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete complaint';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
  };

  return <ComplaintContext.Provider value={complaintContext}>{children}</ComplaintContext.Provider>;
};
