import { useState } from 'react';

function TaskFormModal({
  mode,
  currentUser,
  users,
  task = null,
  onClose,
  onSubmit,
}) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'Todo');
  const [assignedUserId, setAssignedUserId] = useState(task?.assignedUserId ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const canAssignTasks = Boolean(currentUser?.canAssignTasks);
  const canCreateTasks = Boolean(currentUser?.canCreateTasks);
  const canEditTasks = Boolean(currentUser?.canEditTasks);

  const canSubmit = mode === 'create' ? canCreateTasks : canEditTasks;

  const assignableUsers = users.filter(
  (user) => user.role === 'manager' || user.role === 'contributor'
);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // BASIC VALIDATION

    // Check permissions first to avoid unnecessary validation if user can't submit anyway
    if (!canSubmit) {
      setError('You do not have permission to do this.');
      return;
    }

    // Check title is not empty
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        ...(task || {}),
        title: title.trim(),
        description: description.trim(),
        status,
        ...(canAssignTasks && {
            assignedUserId: assignedUserId === '' ? null : Number(assignedUserId),
        }),
        });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="task-modal-overlay">
      <div className="task-modal">
        <h2>{mode === 'edit' ? 'Edit Task' : 'Add Task'}</h2>

        <form onSubmit={handleSubmit} className="task-edit-form">
          {error && <div className="form-error">{error}</div>}

          <div className="input-group">
            <label>Title</label>
            <input
              id="task-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              id="task-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Status</label>
            <select 
            id="task-status"
            name="status"
            value={status} 
            onChange={(e) => setStatus(e.target.value)}>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {canAssignTasks && (
            <div className="input-group">
                <label>Assigned Employee</label>
                <select
                id="assigned-user"
                name="assignedUserId"
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                >
                <option value="">Unassigned</option>
                {assignableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                    {user.name}
                    </option>
                ))}
                </select>
            </div>
            )}

          <div className="task-modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving || !canSubmit}>
              {saving ? 'Saving...' : mode === 'edit' ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskFormModal;