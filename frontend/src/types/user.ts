export type UserRole = 'admin' | 'doctor' | 'receptionist'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string
  role?: UserRole
}

export interface AuthResponse {
  accessToken: string
  user: User
}
