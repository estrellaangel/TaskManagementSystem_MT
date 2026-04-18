import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

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
  const [isOpen, setIsOpen] = useState(false);

  const canAssignTasks = Boolean(currentUser?.canAssignTasks);

  const assignableUsers = users.filter(
    (user) => user.role === 'manager' || user.role === 'contributor'
  );

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
                Active filters applied
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