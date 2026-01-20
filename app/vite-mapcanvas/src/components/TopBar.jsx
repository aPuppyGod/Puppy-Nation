import React from 'react'
import { Map, Trash2 } from 'lucide-react'

const TopBar = ({ scale, isAdmin, onClearCanvas }) => {
  return (
    <div className=\"top-bar\">
      <div className=\"glass-pill px-5 py-2.5 flex items-center gap-4\">
        <div className=\"flex items-center gap-2\">
          <Map size={20} className=\"text-blue-500\" />
          <span className=\"font-semibold text-white tracking-tight\">Puppy Nation</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: '#3f3f46' }} />
        <div className={`mode-indicator ${isAdmin ? 'edit' : 'view'}`}>
          {isAdmin ? 'Edit Mode' : 'View Only'}
        </div>
        <div className=\"coords-display\">{Math.round(scale * 100)}% zoom</div>
        {isAdmin && (
          <>
            <div style={{ width: '1px', height: '20px', background: '#3f3f46' }} />
            <button onClick={onClearCanvas} className=\"text-zinc-500 hover:text-red-400 transition-colors p-1\" title=\"Clear Canvas\">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default TopBar
