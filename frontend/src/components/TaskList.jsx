import TaskRow from './TaskRow';

function TaskList({
  tasks,
  currentUser,
  onTaskClick,
  onDeleteTask,
  deletingTaskId,
}) {
  return (
    <div className="task-table-wrapper">
      <div className="task-table">
        <div className="task-table-head task-row">
          <div className="task-cell task-cell-status">Status</div>
          <div className="task-cell task-cell-description">Description</div>
          <div className="task-cell task-cell-date">Date</div>
          <div className="task-cell task-cell-assigned">Assigned</div>
          <div className="task-cell task-cell-actions">Actions</div>
        </div>

        {tasks.length === 0 ? (
          <div className="task-empty-row">
            <p className="task-empty">No tasks found.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              currentUser={currentUser}
              onClick={() => onTaskClick(task)}
              onDelete={onDeleteTask}
              isDeleting={deletingTaskId === task.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;