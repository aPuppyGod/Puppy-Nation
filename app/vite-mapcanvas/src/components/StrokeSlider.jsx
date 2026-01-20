"import React from 'react'

const StrokeSlider = ({ strokeWidth, onStrokeWidthChange, fontSize, onFontSizeChange, selectedTool }) => {
  const isTextTool = selectedTool === 'text'

  return (
    <div className=\"stroke-slider-container\">
      <div className=\"glass-pill px-4 py-3 flex items-center gap-4\" style={{ minWidth: '200px' }}>
        {isTextTool ? (
          <>
            <span className=\"text-xs text-zinc-500 uppercase tracking-wider whitespace-nowrap\">Size</span>
            <input
              type=\"range\"
              min={12}
              max={72}
              step={2}
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className=\"w-24 accent-blue-500\"
            />
            <span className=\"font-mono text-xs text-zinc-400 w-8 text-right\">{fontSize}</span>
          </>
        ) : (
          <>
            <span className=\"text-xs text-zinc-500 uppercase tracking-wider whitespace-nowrap\">Stroke</span>
            <input
              type=\"range\"
              min={1}
              max={20}
              step={1}
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className=\"w-24 accent-blue-500\"
            />
            <span className=\"font-mono text-xs text-zinc-400 w-8 text-right\">{strokeWidth}px</span>
          </>
        )}
      </div>
    </div>
  )
}

export default StrokeSlider
"
