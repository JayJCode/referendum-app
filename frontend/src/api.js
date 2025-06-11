import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;

export const getReferendums = async (params = {}) => {
  return API.get('/referendums/', { params });
};

export const getReferendumById = async (id) => {
  return API.get('/referendums/', { params: { referendum_id: id } });
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

export const deleteReferendum = async (id) => {
  return API.delete(`/referendums/`, { params: { referendum_id: id } });
};

export const updateReferendum = async (id, data) => {
  return API.patch(`/referendums/`, data, { params: { referendum_id: id } });
};

export const getUsers = async () => {
  return API.get('/users/');
};

export const deleteUser = async (id) => {
  return API.delete(`/users/`, { params: { user_id: id } });
};

export const updateUser = async (id, data) => {
  return API.patch(`/users/`, data, { params: { user_id: id } });
};

export const getTags = async () => {
  return API.get('/tags/');
};

export const createTag = async (tag_name) => {
  return API.post('/tags/', { name: tag_name });
};

export const deleteTag = async (tag_id) => {
  return API.delete(`/tags/${tag_id}/`);
};

export const getTagsByReferendumId = async (referendum_id) => {
  return API.get(`/tags/referendum/${referendum_id}`);
};

export const addTagToReferendum = async (referendum_id, tag_id) => {
  return API.post('/tags/referendum/', {
    referendum_id,
    tag_id
  });
};

export const getTagIdByName = async (tagName) => {
  const response = await getTags();
  const tag = response.data.find(t => t.name.toLowerCase() === tagName.toLowerCase());
  if (!tag) throw new Error(`Tag "${tagName}" not found`);
  return tag.id;
};

export const removeTagFromReferendum = async (referendum_id, tag_id) => {
  return API.delete('/tags/referendum/', {
    params: { referendum_id, tag_id }
  });
};