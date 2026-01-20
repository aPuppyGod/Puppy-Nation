"import React from 'react'

const ColorPicker = ({ colors, selectedColor, onSelectColor }) => {
  return (
    <div className=\"color-picker-container\">
      <div className=\"glass-pill flex items-center gap-2 p-2\">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        <div className=\"relative ml-1\">
          <input
            type=\"color\"
            value={selectedColor}
            onChange={(e) => onSelectColor(e.target.value)}
            className=\"w-6 h-6 rounded-full cursor-pointer opacity-0 absolute inset-0\"
          />
          <div
            className=\"w-6 h-6 rounded-full\"
            style={{
              background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
              border: '2px dashed #52525b'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ColorPicker
"
