import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Aumentado para 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para log de requests (debug)
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para log de responses (debug)
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout:', error.config?.url);
    } else if (error.message === 'Network Error') {
      console.error('🌐 Network Error - Check if backend is running at:', API_BASE_URL);
    } else {
      console.error('❌ API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Churches
export const getChurchByQR = (qrCodeId) => api.get(`/churches/qr/${qrCodeId}`);
export const getChurchById = (id) => api.get(`/churches/${id}`);
export const createChurch = (churchData) => api.post('/churches', churchData);
export const getAllChurches = (latitude, longitude) => 
  api.get('/churches/all', { params: { latitude, longitude } });
export const getNearbyChurches = (latitude, longitude, radius = 50) => 
  api.get('/churches/nearby', { params: { latitude, longitude, radius } });
export const churchAdminLogin = (email, password) => 
  api.post('/churches/admin/login', { email, password });

// Users
export const createUser = (userData) => api.post('/users', userData);
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getChurchMembers = (churchId) => api.get(`/users/church/${churchId}/members`);
export const getUserSuggestions = (userId) => api.get(`/users/${userId}/suggestions`);
export const addUserInterest = (userId, interestTagId) => 
  api.post(`/users/${userId}/interests`, { interest_tag_id: interestTagId });
export const removeUserInterest = (userId, interestTagId) => 
  api.delete(`/users/${userId}/interests/${interestTagId}`);
export const sendWelcome = (userId, fromUserId, eventId) => 
  api.post(`/users/${userId}/welcome`, { from_user_id: fromUserId, event_id: eventId });
export const toggleChurchAdmin = (userId) =>
  api.patch(`/users/${userId}/toggle-admin`);

// Groups
export const getChurchGroups = (churchId, type) => 
  api.get(`/groups/church/${churchId}`, { params: { type } });
export const getGroupById = (id) => api.get(`/groups/${id}`);
export const createGroup = (groupData) => api.post('/groups', groupData);
export const updateGroup = (groupId, groupData) => api.put(`/groups/${groupId}`, groupData);
export const deleteGroup = (groupId) => api.delete(`/groups/${groupId}`);
export const joinGroup = (groupId, userId) => 
  api.post(`/groups/${groupId}/join`, { user_id: userId });
export const leaveGroup = (groupId, userId) => 
  api.post(`/groups/${groupId}/leave`, { user_id: userId });
export const requestJoinGroup = (groupId, userId) =>
  api.post(`/groups/${groupId}/request-join`, { user_id: userId });
export const approveJoinRequest = (groupId, userId) =>
  api.post(`/groups/${groupId}/approve-request`, { user_id: userId });
export const rejectJoinRequest = (groupId, userId) =>
  api.post(`/groups/${groupId}/reject-request`, { user_id: userId });
export const getGroupPendingRequests = (groupId) =>
  api.get(`/groups/${groupId}/pending-requests`);
export const toggleGroupAdmin = (groupId, userId) =>
  api.patch(`/groups/${groupId}/toggle-admin`, { user_id: userId });

// Events
export const getChurchEvents = (churchId, skip = 0, limit = 50) => 
  api.get(`/events/church/${churchId}`, { params: { skip, limit } });

// Interests
export const getInterests = (category) => 
  api.get('/interests', { params: { category } });

export default api;

