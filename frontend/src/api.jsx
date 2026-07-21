import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// ⚠️ للأندرويد إيميوليتر: يبقى 10.0.2.2 (ثابت دايماً)
// لآيفون حقيقي أو أندرويد حقيقي: استبدل بـ IP جهازك الفعلي من ipconfig
const LOCAL_IP = '172.20.10.3';

function getBaseUrl() {
  const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

  if (platform === 'android') {
    return 'http://10.0.2.2:8000';       // Android Emulator
  }
  if (platform === 'ios') {
    return 'http://localhost:8000';       // iOS Simulator (يشارك شبكة الماك)
  }
  return 'http://127.0.0.1:8000';         // متصفح عادي (dev على الويب)
}

const BASE_URL = getBaseUrl();

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh');
        const res = await axios.post(`${BASE_URL}/api/token/refresh/`, {
          refresh: refresh,
        });
        localStorage.setItem('token', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return API(original);
      } catch (e) {
        localStorage.clear(); sessionStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;