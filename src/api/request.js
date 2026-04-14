import axios from 'axios'
import { useUserStore } from '../stores/userStore'

const request = axios.create({
  baseURL: '',
  timeout: 10000
})

// Request Interceptor
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // You can customize this part based on how your backend structure successful responses
    // For now, based on your API structure response is: { code: 'OK', message: 'success', data: ... }
    if (res.code === 'OK' || res.code === '200') {
      return res.data
    } else {
      // Handle custom error codes here
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      // You could trigger a global event or redirect to handle UI updates for login
      window.dispatchEvent(new CustomEvent('auth-unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default request
