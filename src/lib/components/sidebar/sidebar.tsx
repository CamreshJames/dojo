import React from 'react';
import { Link } from '@tanstack/react-router';
import { UsersIcon, TasksIcon, SubjectsIcon, CollapseIcon } from '@lib/utils/icons';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse }) => {
  return (
    <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/users" className="sidebar-link" title="Users">
              <UsersIcon className="sidebar-icon" />
              {!isCollapsed && <span>Users</span>}
            </Link>
          </li>
          <li>
            <Link to="/tasks" className="sidebar-link" title="Tasks">
              <TasksIcon className="sidebar-icon" />
              {!isCollapsed && <span>Tasks</span>}
            </Link>
          </li>
          <li>
            <Link to="/subjects" className="sidebar-link" title="Subjects">
              <SubjectsIcon className="sidebar-icon" />
              {!isCollapsed && <span>Subjects</span>}
            </Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button onClick={toggleCollapse} className="sidebar-toggle" aria-label="Toggle Sidebar">
          <CollapseIcon className="sidebar-icon" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;