import type { Consultation } from './consultation'

export interface DashboardStats {
  totalClients: number
  totalPets: number
  alivePets: number
  deadPets: number
  totalDoctors: number
  totalConsultations: number
  todayConsultations: number
}

export interface RecentConsultation extends Consultation { }
