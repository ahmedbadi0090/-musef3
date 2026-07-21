import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// 💡 غير هذا إلى IP جهازك المحلي (مثلاً IP الشبكة المنزلية)
// أو استخدم رابط ngrok إذا كنت تجرب عبر Appetize.io مثل: 'https://xxxx.ngrok-free.app'
const LOCAL_IP = '172.20.10.3'; 

function getBaseUrl() {
  const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

  // إذا كنت تستخدم ngrok للتجربة الخارجية، ضع رابط ngrok مباشرة لجميع المنصات
  // return 'https://your-ngrok-url.ngrok-free.app';

  if (platform === 'android') {
    return 'http://10.0.2.2:8000'; // Android Emulator المحلي
  }
  
  if (platform === 'ios') {
    // 💡 التعديل هنا: استخدام IP الجهاز بدلاً من localhost ليعمل على الشبكة الخارجية أو Appetize
    return `http://${LOCAL_IP}:8000`; 
  }
  
  return 'http://127.0.0.1:8000'; // متصفح الويب أثناء التطوير
}

const BASE_URL =  'https://shiny-moments-doubt.loca.lt';

const API = axios.create({
  baseURL: BASE_URL,
});

// Interceptor لإضافة الـ Bearer Token تلقائياً مع كل طلب
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor لمعالجة انتهاء جلسة الـ JWT وتحديث الـ Token (Refresh Token)
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
        localStorage.clear(); 
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;