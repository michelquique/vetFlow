import { api } from './api'
import type { AuthResponse, LoginDto, RegisterDto, User } from '@/types/user'

export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }
    return response.data
  },

  async register(data: RegisterDto): Promise<User> {
    const response = await api.post<User>('/auth/register', data)
    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile')
    return response.data
  },

  logout() {
    localStorage.removeItem('accessToken')
    window.location.href = '/login'
  },

  getToken(): string | null {
    return localStorage.getItem('accessToken')
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
