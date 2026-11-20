import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Loader from './components/Loader.jsx';
import PortalLayout from './components/PortalLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UserDirectory from './pages/UserDirectory.jsx';
import Assignments from './pages/Assignments.jsx';
import MentorStudents from './pages/MentorStudents.jsx';
import MentorStudentDetail from './pages/MentorStudentDetail.jsx';
import Progress from './pages/Progress.jsx';
import Sessions from './pages/Sessions.jsx';
import Profile from './pages/Profile.jsx';
function HomeRedirect() { const { user, ready } = useAuth(); if (!ready) return <Loader/>; return <Navigate to={user ? `/${user.role}/dashboard` : '/login'} replace/>; }
export default function App() {
  return <Routes>
    <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
    <Route element={<ProtectedRoute/>}><Route element={<PortalLayout/>}>
      <Route element={<ProtectedRoute roles={['admin']}/> }>
        <Route path="/admin/dashboard" element={<Dashboard/>}/>
        <Route path="/admin/students" element={<UserDirectory role="student"/>}/>
        <Route path="/admin/mentors" element={<UserDirectory role="mentor"/>}/>
        <Route path="/admin/assignments" element={<Assignments/>}/>
      </Route>
      <Route element={<ProtectedRoute roles={['mentor']}/> }>
        <Route path="/mentor/dashboard" element={<Dashboard/>}/>
        <Route path="/mentor/students" element={<MentorStudents/>}/>
        <Route path="/mentor/students/:id" element={<MentorStudentDetail/>}/>
      </Route>
      <Route element={<ProtectedRoute roles={['student']}/> }>
        <Route path="/student/dashboard" element={<Dashboard/>}/>
        <Route path="/student/progress" element={<Progress/>}/>
      </Route>
      <Route path="/sessions" element={<Sessions/>}/><Route path="/profile" element={<Profile/>}/>
    </Route></Route>
    <Route path="/" element={<HomeRedirect/>}/><Route path="*" element={<HomeRedirect/>}/>
  </Routes>;
}
