import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

function FilterBar({
  currentUser,
  users,
  tasks,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  assignedUserId,
  setAssignedUserId,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const canAssignTasks = Boolean(currentUser?.canAssignTasks);

  // Prefer an explicit users list (from /users) when available (admins).
  // Otherwise derive the user list from the tasks currently displayed so
  // non-admin users can still filter by assigned user.
  let assignableUsers = [];

  if (Array.isArray(users) && users.length > 0) {
    assignableUsers = users.filter(
      (u) => u.role === 'manager' || u.role === 'contributor'
    );
  } else if (Array.isArray(tasks) && tasks.length > 0) {
    const map = new Map();
    tasks.forEach((t) => {
      if (t.assignedUser && (t.assignedUser.role === 'manager' || t.assignedUser.role === 'contributor')) {
        map.set(t.assignedUser.id, t.assignedUser);
      }
    });
    assignableUsers = Array.from(map.values());
  }

  const hasActiveFilters =
    statusFilter !== '' || assignedUserId !== '' || searchTerm.trim() !== '';

  return (
    <section className="filter-panel">
      <button
        type="button"
        className="filter-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="filter-toggle-left">
          <span className="filter-title">Filters</span>
          <span className="filter-subtitle">
            {hasActiveFilters ? (
                <div className='filter-applied'>
                <FontAwesomeIcon icon={faCheck} className="filter-check-icon" />
                Filters applied
                </div>
            ) : (
                'Show task filters'
            )}
          </span>
        </div>

        <span className={`filter-chevron ${isOpen ? 'open' : ''}`}><FontAwesomeIcon icon={faChevronDown} /> </span>
      </button>

      {isOpen && (
        <div className="filter-bar">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

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
            <label htmlFor="assigned-user-filter">Assigned</label>
            <select
              id="assigned-user-filter"
              name="assignedUserFilter"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="unassigned">Unassigned</option>
              {canAssignTasks &&
                assignableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}
    </section>
  );
}

export default FilterBar;