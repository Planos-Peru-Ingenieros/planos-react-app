import axios from 'axios';

const API_URL = 'https://tu-dominio-django.com/api/login/'; // Cambia por tu URL real

export const login = async (username, password) => {
  try {
    const response = await axios.post(API_URL, { username, password });
    if (response.data.success) {
      // Guardamos los datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    return { success: false, message: 'Error de conexión con el servidor' };
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};