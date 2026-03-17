import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 30000,
})

// Inject Clerk token into every request
export function setAuthToken(getToken) {
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken()
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch (e) {
      console.warn('Could not get auth token', e)
    }
    return config
  })
}

// Resume APIs
export const resumeApi = {
  list: () => api.get('/resume/list'),
  get: (id) => api.get(`/resume/${id}`),
  create: (data) => api.post('/resume/create', data),
  update: (id, data) => api.put(`/resume/update/${id}`, data),
  delete: (id) => api.delete(`/resume/delete/${id}`),
}

// AI APIs
export const aiApi = {
  generate: (payload) => api.post('/ai/generate', payload),
  improve: (payload) => api.post('/ai/improve', payload),
}

// Export APIs
export const exportApi = {
  pdf: (payload) => api.post('/export/pdf', payload, { responseType: 'blob' }),
  docx: (payload) => api.post('/export/docx', payload, { responseType: 'blob' }),
  txt: (payload) => api.post('/export/txt', payload),
}

// Analytics API
export const analyticsApi = {
  get: () => api.get('/analytics'),
}

export default api
