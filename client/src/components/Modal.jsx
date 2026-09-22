import { X } from "lucide-react";
import React from "react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
      {children}
  </div>
  </div>;
}
