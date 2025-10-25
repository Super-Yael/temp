import { ref } from 'vue';
import axios from 'axios';

const storedToken = localStorage.getItem('token');
const storedUserRaw = localStorage.getItem('user');

const token = ref(storedToken || null);
const user = ref(null);

if (storedUserRaw) {
  try {
    user.value = JSON.parse(storedUserRaw);
  } catch (error) {
    user.value = null;
    localStorage.removeItem('user');
  }
}

if (token.value) {
  axios.defaults.headers.common.Authorization = `Bearer ${token.value}`;
}

const login = (newToken, userInfo = null) => {
  token.value = newToken;
  user.value = userInfo;
  localStorage.setItem('token', newToken);
  if (userInfo) {
    localStorage.setItem('user', JSON.stringify(userInfo));
  } else {
    localStorage.removeItem('user');
  }
  axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
};

const logout = () => {
  token.value = null;
  user.value = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common.Authorization;
};

export const auth = {
  token,
  user,
  login,
  logout,
};
