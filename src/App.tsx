import { Navigate, Route, Routes } from 'react-router'
import ProtectedLayout from './components/ProtectedLayout'
import LoginPage from './pages/LoginPage'
import ProjectsPage from './pages/ProjectsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/projects" element={<ProjectsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  )
}

export default App
