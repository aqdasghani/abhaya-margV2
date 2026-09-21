import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'
import MainLayout from '../components/layout/MainLayout'
import DashboardLayout from '../components/layout/DashboardLayout'
import AdminLayout from '../components/layout/AdminLayout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import VerifyTourist from '../pages/VerifyTourist'
import NotFound from '../pages/NotFound'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminRegister from '../pages/admin/AdminRegister'
import AdminOverview from '../pages/admin/AdminOverview'
import AdminTourists from '../pages/admin/AdminTourists'
import AdminTouristDetail from '../pages/admin/AdminTouristDetail'
import AdminTracking from '../pages/admin/AdminTracking'
import AdminIncidents from '../pages/admin/AdminIncidents'
import AdminIncidentDetail from '../pages/admin/AdminIncidentDetail'
import AdminLostTourists from '../pages/admin/AdminLostTourists'
import AdminLostTouristDetail from '../pages/admin/AdminLostTouristDetail'
import AdminGeofences from '../pages/admin/AdminGeofences'

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            {/* Tourist Portal Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Admin Portal Authentication Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            {/* Public Digital ID Verification */}
            <Route path="/verify/:touristId" element={<VerifyTourist />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
            <Route path="/admin/tracking" element={<AdminRoute><AdminTracking /></AdminRoute>} />
            <Route path="/admin/map" element={<AdminRoute><AdminTracking /></AdminRoute>} />
            <Route path="/admin/incidents" element={<AdminRoute><AdminIncidents /></AdminRoute>} />
            <Route path="/admin/incidents/:incidentId" element={<AdminRoute><AdminIncidentDetail /></AdminRoute>} />
            <Route path="/admin/tourists" element={<AdminRoute><AdminTourists /></AdminRoute>} />
            <Route path="/admin/tourists/:uid" element={<AdminRoute><AdminTouristDetail /></AdminRoute>} />
            <Route path="/admin/lost" element={<AdminRoute><AdminLostTourists /></AdminRoute>} />
            <Route path="/admin/lost/:uid" element={<AdminRoute><AdminLostTouristDetail /></AdminRoute>} />
            <Route path="/admin/geofences" element={<AdminRoute><AdminGeofences /></AdminRoute>} />
          </Route>


          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRoutes