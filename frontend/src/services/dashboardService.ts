import { api } from './api'
import type { DashboardStats, RecentConsultation } from '@/types/dashboard'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats')
    return response.data
  },

  async getRecentConsultations(): Promise<RecentConsultation[]> {
    const response = await api.get<RecentConsultation[]>('/dashboard/recent-consultations')
    return response.data
  },
}
