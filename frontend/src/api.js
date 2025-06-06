import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

export const getReferendums = async (params = {}) => {
  return API.get('/referendums/', { params });
};

export const getReferendumById = async (id) => {
  return API.get(`/referendums/?referendum_id=${id}`);
};

export const getUserReferendums = async (userId, params = {}) => {
  return API.get(`/referendums/`, { 
    params: { ...params, user_id: userId } 
  });
};

export const createReferendum = async (data) => {
  return API.post('/referendums/', data);
};

export const getVotesByReferendumId = async (referendumId) => {
  try {
    const response = await API.get(`/votes/?referendum_id=${referendumId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching votes", error);
    return [];
  }
};

export const createVote = async (voteData) => {
  return API.post('/votes/', voteData);
};