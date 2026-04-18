import { useState } from 'react';

function UserPermissionsModal({ user, onClose, onSubmit }) {
  const originallyLockedAdmin = Boolean(user.isLockedAdmin);

  const [role, setRole] = useState(user.role);
  const [isLockedAdminValue, setIsLockedAdminValue] = useState(
    Boolean(user.isLockedAdmin)
  );

  const [canCreateTasks, setCanCreateTasks] = useState(user.canCreateTasks);
  const [canEditTasks, setCanEditTasks] = useState(user.canEditTasks);
  const [canDeleteTasks, setCanDeleteTasks] = useState(user.canDeleteTasks);
  const [canAssignTasks, setCanAssignTasks] = useState(user.canAssignTasks);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdminUser = role === 'admin';
  const isLockedAdmin = originallyLockedAdmin || isLockedAdminValue;
  const isRoleOnlyAdminEdit = isAdminUser && !isLockedAdmin;
  const permissionsLocked = isLockedAdmin || isRoleOnlyAdminEdit;

  const handleRoleChange = (newRole) => {
    if (isLockedAdmin) return;

    setRole(newRole);

    if (newRole !== 'admin') {
      setIsLockedAdminValue(false);
    }

    if (newRole === 'manager') {
      setCanCreateTasks(true);
      setCanEditTasks(true);
      setCanDeleteTasks(false);
      setCanAssignTasks(true);
    } else if (newRole === 'contributor') {
      setCanCreateTasks(false);
      setCanEditTasks(true);
      setCanDeleteTasks(false);
      setCanAssignTasks(false);
    } else if (newRole === 'admin') {
      setCanCreateTasks(true);
      setCanEditTasks(true);
      setCanDeleteTasks(true);
      setCanAssignTasks(true);
    }
  };

  const handleEditTasksChange = (checked) => {
    if (permissionsLocked) return;

    setCanEditTasks(checked);

    if (!checked) {
      setCanAssignTasks(false);
    }
  };

  const handleLockedAdminChange = async (checked) => {
    if (originallyLockedAdmin || saving) return;

    if (!checked) {
      setIsLockedAdminValue(false);
      return;
    }

    const confirmed = window.confirm(
      'Lock this admin account? This will permanently lock in full admin access and this account will no longer be editable.'
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');

      // force full locked-admin state
      const lockedPayload = {
        id: user.id,
        role: 'admin',
        isLockedAdmin: true,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canAssignTasks: true,
      };

      await onSubmit(lockedPayload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to lock admin account.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (originallyLockedAdmin) {
      return;
    }

    if (isLockedAdminValue && role !== 'admin') {
      setError('Only admin users can be marked as locked admins.');
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        id: user.id,
        role,
        isLockedAdmin: isLockedAdminValue,
        canCreateTasks,
        canEditTasks,
        canDeleteTasks,
        canAssignTasks,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="task-modal-overlay">
      <div className="task-modal">
        <h2>Edit User Permissions</h2>

        <form onSubmit={handleSubmit} className="task-edit-form">
          {error && <div className="form-error">{error}</div>}

          {isLockedAdmin && (
            <div className="permission-locked-message">
              This is a locked admin account. Nothing in this modal can be edited.
            </div>
          )}

          {isRoleOnlyAdminEdit && !isLockedAdmin && (
            <div className="permission-locked-message">
              Admin permissions are fixed. You may only change this user&apos;s role
              to manager or contributor.
            </div>
          )}

          <div className="input-group">
            <label htmlFor="user-role">Role</label>
            <select
              id="user-role"
              name="role"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={isLockedAdmin || saving}
            >
              <option value="contributor">Contributor</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {isAdminUser && (
            <div className="permission-checkbox-group">
              <label
                className={`permission-checkbox-row ${
                  isLockedAdmin ? 'permission-checkbox-disabled' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isLockedAdminValue}
                  onChange={(e) => handleLockedAdminChange(e.target.checked)}
                  disabled={originallyLockedAdmin || saving}
                />
                <span>Locked admin account</span>
              </label>
            </div>
          )}

          <div className="permission-checkbox-group">
            <label
              className={`permission-checkbox-row ${
                permissionsLocked ? 'permission-checkbox-disabled' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={canCreateTasks}
                onChange={(e) => setCanCreateTasks(e.target.checked)}
                disabled={permissionsLocked || saving}
              />
              <span>Can create tasks</span>
            </label>

            <label
              className={`permission-checkbox-row ${
                permissionsLocked ? 'permission-checkbox-disabled' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={canDeleteTasks}
                onChange={(e) => setCanDeleteTasks(e.target.checked)}
                disabled={permissionsLocked || saving}
              />
              <span>Can delete tasks</span>
            </label>

            <label
              className={`permission-checkbox-row ${
                permissionsLocked ? 'permission-checkbox-disabled' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={canEditTasks}
                onChange={(e) => handleEditTasksChange(e.target.checked)}
                disabled={permissionsLocked || saving}
              />
              <span>Can edit tasks</span>
            </label>

            <label
              className={`permission-checkbox-row ${
                !canEditTasks || permissionsLocked ? 'permission-checkbox-disabled' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={canAssignTasks}
                onChange={(e) => setCanAssignTasks(e.target.checked)}
                disabled={!canEditTasks || permissionsLocked || saving}
              />
              <span>Can assign tasks</span>
            </label>
          </div>

          <div className="task-modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              {isLockedAdmin ? 'Close' : 'Cancel'}
            </button>

            {!isLockedAdmin && (
              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserPermissionsModal;