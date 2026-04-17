function FilterBar({
  currentUser,
  users,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  assignedUserId,
  setAssignedUserId,
}) {
  const canAssignTasks = Boolean(currentUser?.canAssignTasks);

  const assignableUsers = users.filter(
    (user) => user.role === 'manager' || user.role === 'contributor'
  );

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="task-search">Search</label>
        <input
          id="task-search"
          name="taskSearch"
          type="text"
          placeholder="Search title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-search"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          name="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {canAssignTasks && (
        <div className="filter-group">
          <label htmlFor="assigned-user-filter">Assigned</label>
          <select
            id="assigned-user-filter"
            name="assignedUserFilter"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            className="filter-select"
          >
            <option value="">All Assigned</option>
            <option value="unassigned">Unassigned</option>
            {assignableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default FilterBar;