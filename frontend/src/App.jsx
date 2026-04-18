import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TaskPage from './pages/TaskPage';
import UserPermissionsPage from './pages/UserPermissionsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/users/permissions" element={<UserPermissionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;