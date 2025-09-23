import axios from 'axios'
import { API_BASE_URL } from '../config/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('[API] Response error:', error.response?.status, error.response?.data)
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to backend on port 8000. Please check if the backend is running.')
    }
    throw error
  }
)

export default api
