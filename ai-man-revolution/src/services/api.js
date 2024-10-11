import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Update for production

export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
};

export const loginUser = async (userData) => {
    const response = await axios.post(`${API_URL}/users/login`, userData);
    return response.data;
};

export const createCharacter = async (characterData) => {
    const response = await axios.post(`${API_URL}/characters`, characterData);
    return response.data;
};

export const createScript = async (scriptData) => {
    const response = await axios.post(`${API_URL}/scripts`, scriptData);return response.data;
};

export const getCharacters = async () => {
    const response = await axios.get(`${API_URL}/characters`);
    return response.data;
};

export const getScripts = async () => {
    const response = await axios.get(`${API_URL}/scripts`);
    return response.data;
};
