"import React from 'react';
import { Map, Trash2 } from 'lucide-react';

const TopBar = ({ scale, isAdmin, onClearCanvas }) => {
  return (
    <div className=\"top-bar\" data-testid=\"top-bar\">
      <div className=\"glass-pill px-5 py-2.5 flex items-center gap-4\">
        {/* Logo */}
        <div className=\"flex items-center gap-2\">
          <Map size={20} className=\"text-blue-500\" />
          <span className=\"font-semibold text-white tracking-tight\">MapMaker</span>
        </div>
        
        {/* Divider */}
        <div className=\"w-px h-5 bg-zinc-700\" />
        
        {/* Mode indicator */}
        <div className={`mode-indicator ${isAdmin ? 'edit' : 'view'}`}>
          {isAdmin ? 'Edit Mode' : 'View Only'}
        </div>
        
        {/* Zoom level display */}
        <div className=\"coords-display\">
          {Math.round(scale * 100)}% zoom
        </div>
        
        {/* Clear button (admin only) */}
        {isAdmin && (
          <>
            <div className=\"w-px h-5 bg-zinc-700\" />
            <button
              onClick={onClearCanvas}
              className=\"text-zinc-500 hover:text-red-400 transition-colors p-1\"
              title=\"Clear Canvas\"
              data-testid=\"clear-canvas-btn\"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBar;
"
