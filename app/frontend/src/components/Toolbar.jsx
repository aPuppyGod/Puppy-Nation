"import React from 'react';

const Toolbar = ({ tools, selectedTool, onSelectTool }) => {
  return (
    <div className=\"toolbar-container\" data-testid=\"toolbar\">
      <div className=\"glass-pill flex flex-col gap-1 p-2\">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
              title={tool.label}
              data-testid={`tool-${tool.id}`}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;
"
