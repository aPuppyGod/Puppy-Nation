"import React from 'react';
import { Slider } from '@/components/ui/slider';

const StrokeSlider = ({ 
  strokeWidth, 
  onStrokeWidthChange, 
  fontSize, 
  onFontSizeChange,
  selectedTool 
}) => {
  const isTextTool = selectedTool === 'text';
  
  return (
    <div className=\"stroke-slider-container\" data-testid=\"stroke-slider\">
      <div className=\"glass-pill px-4 py-3 flex items-center gap-4 min-w-[200px]\">
        {isTextTool ? (
          <>
            <span className=\"text-xs text-zinc-500 uppercase tracking-wider whitespace-nowrap\">
              Size
            </span>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => onFontSizeChange(value[0])}
              min={12}
              max={72}
              step={2}
              className=\"w-24\"
              data-testid=\"font-size-slider\"
            />
            <span className=\"font-mono text-xs text-zinc-400 w-8 text-right\">
              {fontSize}
            </span>
          </>
        ) : (
          <>
            <span className=\"text-xs text-zinc-500 uppercase tracking-wider whitespace-nowrap\">
              Stroke
            </span>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => onStrokeWidthChange(value[0])}
              min={1}
              max={20}
              step={1}
              className=\"w-24\"
              data-testid=\"stroke-width-slider\"
            />
            <span className=\"font-mono text-xs text-zinc-400 w-8 text-right\">
              {strokeWidth}px
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default StrokeSlider;
"
