import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

function TaskRow({ task, currentUser, onClick, onDelete, isDeleting }) {
  const canEdit = Boolean(currentUser?.canEditTasks);
  const canDelete = Boolean(currentUser?.canDeleteTasks);

  const handleRowClick = () => {
    if (!canEdit) return;
    onClick?.();
  };

  const handleEditClick = (e) => {
    e.stopPropagation();

    if (!canEdit) return;
    onClick?.();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();

    if (!canDelete || isDeleting) return;

    onDelete?.(task);
  };

  return (
    <div
      className={`task-row ${canEdit ? 'task-row-clickable' : ''}`}
      onClick={handleRowClick}
    >
      <div className="task-cell task-cell-status" data-label="Status">
        <span
          className={`task-status-pill ${
            task.status === 'Todo'
              ? 'task-status-todo'
              : task.status === 'In Progress'
              ? 'task-status-in-progress'
              : 'task-status-done'
          }`}
        >
          {task.status}
        </span>
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
        {task.assignedUser ? (
          <div
            className="task-assigned-user"
            data-full-name={task.assignedUser.name}
            title={task.assignedUser.name}
          >
            <div className="task-assigned-avatar">
              {task.assignedUser.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="task-assigned-name">{task.assignedUser.name}</span>
          </div>
        ) : (
          <span className="task-unassigned">Unassigned</span>
        )}
      </div>

      <div className="task-cell task-cell-actions" data-label="Actions">
        <div className="task-actions-buttons">
          {canEdit && (
            <button
              type="button"
              className="edit-task-button"
              onClick={handleEditClick}
              aria-label="Edit task"
              title="Edit"
            >
              <span className="edit-task-button-icon"><FontAwesomeIcon icon={faPenToSquare} /></span>
              <span className="edit-task-button-text">Edit</span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              className="delete-task-button"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              aria-label={isDeleting ? 'Deleting task' : 'Delete task'}
              title={isDeleting ? 'Deleting...' : 'Delete'}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskRow;