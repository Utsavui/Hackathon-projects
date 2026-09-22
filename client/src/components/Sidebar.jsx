import { BarChart3, CheckSquare, FolderKanban, LogOut, Sparkles, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import React from "react";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && <div className="mobile-overlay" onClick={onClose} />}

      <aside className={`sidebar${isOpen ? " mobile-open" : ""}`}>
        {/* Mobile close button */}
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>

        <div className="brand">
          <div className="brand-mark">N</div>
          <div>
            <strong>NovaTask</strong>
            <span>Innovation Hacks</span>
          </div>
        </div>

        <div className="nav-title">WORKSPACE</div>
        <nav>
          <a className="active"><BarChart3 size={18} /> Overview</a>
          <a><FolderKanban size={18} /> Projects</a>
          <a><CheckSquare size={18} /> My Tasks</a>
          <a><Sparkles size={18} /> AI Assistant</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-user">
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div><b>{user?.name}</b><span>{user?.email}</span></div>
          </div>
          <button className="logout" onClick={logout}><LogOut size={17} /> Logout</button>
        </div>
      </aside>

      {/* Bottom navigation bar — mobile only */}
      <nav className="mobile-nav">
        <button className="mobile-nav-item active">
          <BarChart3 size={20} />
          <span>Overview</span>
        </button>
        <button className="mobile-nav-item">
          <FolderKanban size={20} />
          <span>Projects</span>
        </button>
        <button className="mobile-nav-item">
          <CheckSquare size={20} />
          <span>Tasks</span>
        </button>
        <button className="mobile-nav-item">
          <Sparkles size={20} />
          <span>AI</span>
        </button>
        <button className="mobile-nav-item" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
}
