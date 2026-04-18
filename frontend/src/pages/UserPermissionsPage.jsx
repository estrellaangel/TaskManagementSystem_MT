import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import UserPermissionsModal from '../components/UserPermissionsModal';
import './UserPermissionsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';


function UserPermissionsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/tasks');
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (updatedUser) => {
  try {
    console.log('Sending user update:', updatedUser);

    const response = await api.put(`/users/${updatedUser.id}/permissions`, {
      role: updatedUser.role,
      isLockedAdmin: updatedUser.isLockedAdmin,
      canCreateTasks: updatedUser.canCreateTasks,
      canEditTasks: updatedUser.canEditTasks,
      canDeleteTasks: updatedUser.canDeleteTasks,
      canAssignTasks: updatedUser.canAssignTasks,
    });

    console.log('Saved user response:', response.data);

    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? response.data : u))
    );

    setSelectedUser(null);
  } catch (error) {
    console.error('Save user failed:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Failed to update user.');
  }
};

  return (
    <div className="user-permissions-page">
      <div className="user-permissions-header">
        <div>
          <h1>User Permissions</h1>
          <p>Manage contributor and manager access.</p>
        </div>

        <button onClick={() => navigate('/tasks')}><FontAwesomeIcon icon={faArrowLeft} /> Back to Tasks</button>
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p className="page-error">{error}</p>}

      {!loading && !error && (
        <div className="user-table-wrapper">
          <div className="user-table">
            <div className="user-row user-table-head">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Permissions</div>
              <div>Actions</div>
            </div>

            {users.map((editableUser) => (
              <div key={editableUser.id} className="user-row">
                <div>{editableUser.name}</div>
                <div>{editableUser.email}</div>
                <div>{editableUser.role}</div>
                <div>
                  {[
                    editableUser.canCreateTasks && 'Create',
                    editableUser.canEditTasks && 'Edit',
                    editableUser.canDeleteTasks && 'Delete',
                    editableUser.canAssignTasks && 'Assign',
                  ]
                    .filter(Boolean)
                    .join(', ') || 'No permissions'}
                </div>
                <div>
                  <button onClick={() => setSelectedUser(editableUser)}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedUser && (
        <UserPermissionsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSubmit={handleSaveUser}
        />
      )}
    </div>
  );
}

export default UserPermissionsPage;