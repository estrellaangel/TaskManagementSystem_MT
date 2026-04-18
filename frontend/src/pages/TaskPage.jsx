import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faGear, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import TaskList from '../components/TaskList';
import Pagination from '../components/Pagination';
import TaskFormModal from '../components/TaskFormModal';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import '../components/FilterBar.css';
import '../components/TaskList.css';
import '../components/TaskModal.css';

import './TaskPage.css';

function TaskPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Task data and page UI state
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  // Loading / error state for async requests
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Permission flags pulled from the logged-in user
  const canAssignTasks = Boolean(user?.canAssignTasks);
  const canCreateTasks = Boolean(user?.canCreateTasks);
  const canEditTasks = Boolean(user?.canEditTasks);
  const canDeleteTasks = Boolean(user?.canDeleteTasks);

  // Filter/search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Fetch assignable users for dropdowns/filters
  const fetchUsers = async () => {
    try {
      if (canAssignTasks) {
        const response = await api.get('/users');
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch task list using current page + filters
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/tasks', {
        params: {
          page,
          limit: 5,
          status: statusFilter || undefined,
          assignedUserId: canAssignTasks
            ? assignedUserId || undefined
            : undefined,
          search: debouncedSearchTerm.trim() || undefined,
        },
      });

      setTasks(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error(error);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  // EFFECTS: search, filtering, pagination, and initial data loading

  // Debounce search input so API is not called on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fetch tasks whenever page or active filters change
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchTasks();
  }, [page, statusFilter, assignedUserId, debouncedSearchTerm]);

  // Fetch users once when page loads
  useEffect(() => {
    if (!user) return;
    fetchUsers();
  }, []);

  // Reset back to first page whenever filters/search change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, assignedUserId, debouncedSearchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleTaskClick = (task) => {
    if (!canEditTasks) return;
    setSelectedTask(task);
  };

  const handleCloseEditor = () => {
    setSelectedTask(null);
  };

  const handleCreateTask = async (newTask) => {
    if (!canCreateTasks) {
      throw new Error('You do not have permission to create tasks.');
    }

    try {
      const response = await api.post('/tasks', {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        assignedUserId: canAssignTasks ? newTask.assignedUserId : null,
      });

      setTasks((prevTasks) => [response.data, ...prevTasks]);
      setShowCreateForm(false);
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleSaveTask = async (updatedTask) => {
    if (!canEditTasks) {
      throw new Error('You do not have permission to edit tasks.');
    }

    try {
      const payload = {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        ...(canAssignTasks && {
          assignedUserId: updatedTask.assignedUserId,
        }),
      };

      const response = await api.put(`/tasks/${updatedTask.id}`, payload);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? response.data : task
        )
      );

      setSelectedTask(null);
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!canDeleteTasks) {
      alert('You do not have permission to delete tasks.');
      return;
    }

    try {
      setDeletingTaskId(taskId);
      await api.delete(`/tasks/${taskId}`);

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to delete task.');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleRequestDeleteTask = (task) => {
    setTaskToDelete(task);
  };

  const handleCancelDeleteTask = () => {
    setTaskToDelete(null);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;

    await handleDeleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  return (
    <div className="task-page">
      <div className="task-page-header">
        <div>
          <h1 className="task-page-title">Tasks</h1>
          <p className="task-page-subtitle">
            Welcome, <span className="task-page-subtitle-role">
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
            </span>{' '}
            {user?.name}
            </p>
        </div>

        <div className="task-header-actions">
          {canCreateTasks && (
            <button
              className="add-task-button"
              onClick={() => setShowCreateForm(true)}
            >
            <FontAwesomeIcon icon={faPlus} /> Add Task
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              className="edit-permissions-button"
              onClick={() => navigate('/users/permissions')}
            >
              <FontAwesomeIcon icon={faGear} /> Manage Users
            </button>
          )}

          <button className="logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} /> Logout
          </button>
        </div>
      </div>

      <FilterBar
        currentUser={user}
        users={users}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        assignedUserId={assignedUserId}
        setAssignedUserId={setAssignedUserId}
      />

      {error && <p className="task-error">{error}</p>}

      <div className={`task-content ${loading ? 'task-content-loading' : ''}`}>
        {!error && (
          <>
            <TaskList
              tasks={tasks}
              currentUser={user}
              onTaskClick={handleTaskClick}
              onDeleteTask={handleRequestDeleteTask}
              deletingTaskId={deletingTaskId}
            />

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            )}
          </>
        )}
      </div>

      {selectedTask && (
        <TaskFormModal
          mode="edit"
          currentUser={user}
          users={users}
          task={selectedTask}
          onClose={handleCloseEditor}
          onSubmit={handleSaveTask}
        />
      )}

      {showCreateForm && (
        <TaskFormModal
          mode="create"
          currentUser={user}
          users={users}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {taskToDelete && (
        <div className="task-modal-overlay">
          <div className="task-modal delete-confirm-modal">
            <h2>⚠️ Delete Task</h2>
            <p className="delete-confirm-text">
              Are you sure you want to delete <strong>{taskToDelete.title}</strong>?
            </p>

            <div className="task-modal-actions">
              <button
                type="button"
                onClick={handleCancelDeleteTask}
                disabled={deletingTaskId === taskToDelete.id}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleConfirmDeleteTask}
                disabled={deletingTaskId === taskToDelete.id}
              >
                {deletingTaskId === taskToDelete.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskPage;