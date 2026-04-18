import { useState, useEffect, useRef } from 'react';

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
  const [showSaving, setShowSaving] = useState(false);
  // timers & timestamps (refs so they survive renders without triggering updates)
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const shownAtRef = useRef(null);

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

    // Clear any previous timers
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    // Delayed-show: wait a short delay before showing the overlay to avoid flashes
    const SHOW_DELAY = 120; // ms (tweakable: 80-150ms)
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      shownAtRef.current = Date.now();
      setShowSaving(true);
    }, SHOW_DELAY);

    try {
    await onSubmit({
        ...(task || {}),
        title: title.trim(),
        description: description.trim(),
        status,
        assignedUserId: canAssignTasks
        ? assignedUserId === '' ? null : Number(assignedUserId)
        : task?.assignedUserId ?? null,
    });
    } catch (err) {
    setError(err.message || 'Something went wrong.');
    } finally {
    setSaving(false);
    }
  };

  // Delayed-show + min-duration logic
  useEffect(() => {
    const MIN_VISIBLE = 1000; // ms - keep visible at least this long once shown

    // When saving stops, decide whether to cancel the pending show or hide after min duration
    if (!saving) {
      // If overlay hasn't been shown yet but a show timer is pending, cancel it
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
        setShowSaving(false);
        shownAtRef.current = null;
      } else if (showSaving) {
        // Overlay is visible; ensure it stays visible at least MIN_VISIBLE
        const elapsed = Date.now() - (shownAtRef.current || 0);
        const remaining = MIN_VISIBLE - elapsed;

        if (remaining > 0) {
          // schedule hide after remaining time
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => {
            setShowSaving(false);
            shownAtRef.current = null;
            hideTimerRef.current = null;
          }, remaining);
        } else {
          setShowSaving(false);
          shownAtRef.current = null;
        }
      }
    }
  }, [saving, showSaving]);

  // cleanup on unmount only — don't clear timers on every render/update because
  // that can cancel timers we just created in event handlers (like handleSubmit)
  useEffect(() => {
    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="task-modal-overlay">
      <div className="task-modal">
        <h2>{mode === 'edit' ? 'Edit Task' : 'Add Task'}</h2>

        {showSaving && (
          <div className="modal-saving-overlay">
            <div className="modal-saving-content">
              <div className="spinner" />
              <div>Saving...</div>
            </div>
          </div>
        )}

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