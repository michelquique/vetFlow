import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { MainLayout } from './components/layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admission from './pages/Admission'
import Clients from './pages/Clients'
import Pets from './pages/Pets'
import Consultations from './pages/Consultations'
import Doctors from './pages/Doctors'
import Catalog from './pages/Catalog'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admission" element={<Admission />} />
          <Route path="clients" element={<Clients />} />
          <Route path="pets" element={<Pets />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="schedule" element={<div className="text-2xl font-bold">Agenda - Próximamente</div>} />
          <Route path="reminders" element={<div className="text-2xl font-bold">Recordatorios - Próximamente</div>} />
          <Route path="reports" element={<div className="text-2xl font-bold">Reportes - Próximamente</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
