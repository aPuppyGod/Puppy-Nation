"import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const ZoomControls = ({ scale, onZoomIn, onZoomOut, onReset }) => {
  const zoomPercentage = Math.round(scale * 100);
  
  return (
    <div className=\"zoom-controls\" data-testid=\"zoom-controls\">
      <div className=\"glass flex flex-col rounded-xl overflow-hidden\">
        <button
          onClick={onZoomIn}
          className=\"zoom-btn\"
          title=\"Zoom In\"
          data-testid=\"zoom-in-btn\"
        >
          <ZoomIn size={18} />
        </button>
        
        <div className=\"px-3 py-2 text-center border-y border-zinc-800\">
          <span className=\"font-mono text-xs text-zinc-400\" data-testid=\"zoom-level\">
            {zoomPercentage}%
          </span>
        </div>
        
        <button
          onClick={onZoomOut}
          className=\"zoom-btn\"
          title=\"Zoom Out\"
          data-testid=\"zoom-out-btn\"
        >
          <ZoomOut size={18} />
        </button>
        
        <button
          onClick={onReset}
          className=\"zoom-btn border-t border-zinc-800\"
          title=\"Reset View\"
          data-testid=\"reset-view-btn\"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ZoomControls;
"
