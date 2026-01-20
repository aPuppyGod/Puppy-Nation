import React from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

const ZoomControls = ({ scale, onZoomIn, onZoomOut, onReset }) => {
  const zoomPercentage = Math.round(scale * 100)

  return (
    <div className=\"zoom-controls\">
      <div className=\"glass flex flex-col rounded-xl overflow-hidden\">
        <button onClick={onZoomIn} className=\"zoom-btn\" title=\"Zoom In\">
          <ZoomIn size={18} />
        </button>
        <div className=\"px-3 py-2 text-center\" style={{ borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}>
          <span className=\"font-mono text-xs text-zinc-400\">{zoomPercentage}%</span>
        </div>
        <button onClick={onZoomOut} className=\"zoom-btn\" title=\"Zoom Out\">
          <ZoomOut size={18} />
        </button>
        <button onClick={onReset} className=\"zoom-btn\" style={{ borderTop: '1px solid #27272a' }} title=\"Reset View\">
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  )
}

export default ZoomControls
