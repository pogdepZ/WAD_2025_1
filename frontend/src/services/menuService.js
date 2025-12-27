import axios from 'axios';

// URL gốc (đã cấu hình proxy, nhưng nên define rõ nếu cần)
const API_URL = '/api/menu';

export const getMenu = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createCategory = async (name) => {
  const response = await axios.post(`${API_URL}/categories`, { name });
  return response.data;
};

export const createItem = async (itemData) => {
  const response = await axios.post(`${API_URL}/items`, itemData);
  return response.data;
};