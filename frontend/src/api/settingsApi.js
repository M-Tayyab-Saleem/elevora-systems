import axios from '../axios';

export const settingsApi = {
  updateProfile: async (data) => {
    const response = await axios.put('/users/profile', data);
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await axios.put('/users/settings', data);
    return response.data;
  },

  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axios.post(`/users/${userId}/upload-avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadCover: async (userId, file) => {
    const formData = new FormData();
    formData.append('coverImage', file);
    const response = await axios.post(`/users/${userId}/upload-cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
