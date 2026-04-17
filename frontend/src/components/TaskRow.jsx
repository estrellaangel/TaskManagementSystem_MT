function TaskRow({ task, currentUser, onClick, onDelete, isDeleting }) {
  const canEdit = Boolean(currentUser?.canEditTasks);
  const canDelete = Boolean(currentUser?.canDeleteTasks);

  const handleRowClick = () => {
    if (!canEdit) return;
    onClick?.();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();

    if (!canDelete || isDeleting) return;

    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (confirmed) {
      onDelete?.(task.id);
    }
  };

  return (
    <div
      className={`task-row ${canEdit ? 'task-row-clickable' : ''}`}
      onClick={handleRowClick}
    >
      <div className="task-cell task-cell-status" data-label="Status">
        {task.status}
      </div>

      <div className="task-cell task-cell-description" data-label="Description">
        <div className="task-title">{task.title}</div>
        {task.description && (
          <div className="task-description">{task.description}</div>
        )}
      </div>

      <div className="task-cell task-cell-date" data-label="Date">
        {new Date(task.createdAt).toLocaleDateString()}
      </div>

      <div className="task-cell task-cell-assigned" data-label="Assigned">
        {task.assignedUser?.name || 'Unassigned'}
      </div>

      <div className="task-cell task-cell-actions" data-label="Actions">
        {canDelete && (
          <button
            type="button"
            className="delete-task-button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskRow;