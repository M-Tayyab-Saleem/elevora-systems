import axios from '../axios';

const BASE_URL = '/tickets';

export const ticketsApi = {
  getMyTickets: async (params) => {
    const response = await axios.get(`${BASE_URL}/my-tickets`, { params });
    return response.data; // { success: true, data: [...], pagination: {...} }
  },

  getAllTickets: async (params) => {
    const response = await axios.get(`${BASE_URL}/all`, { params });
    return response.data; // backend currently returns array directly or wrapped based on controller
  },

  getTicketById: async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  createTicket: async (formData) => {
    // formData for multipart/form-data support
    const response = await axios.post(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateTicket: async (id, data) => {
    const response = await axios.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  deleteTicket: async (id) => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axios.patch(`${BASE_URL}/${id}/status`, { status });
    return response.data;
  },

  updatePriority: async (id, priority) => {
    const response = await axios.patch(`${BASE_URL}/${id}/priority`, { priority });
    return response.data;
  },

  assignTicket: async (id, assignedTo) => {
    const response = await axios.patch(`${BASE_URL}/${id}/assign`, { assignedTo });
    return response.data;
  },

  addResponse: async (id, data) => {
    const response = await axios.post(`${BASE_URL}/${id}/response`, data);
    return response.data;
  }
};
