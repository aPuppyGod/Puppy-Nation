"import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text, Transformer } from 'react-konva';
import { toast } from 'sonner';
import axios from 'axios';
import Toolbar from '@/components/Toolbar';
import ZoomControls from '@/components/ZoomControls';
import ColorPicker from '@/components/ColorPicker';
import StrokeSlider from '@/components/StrokeSlider';
import AdminModal from '@/components/AdminModal';
import TopBar from '@/components/TopBar';
import { 
  Hand, 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Minus, 
  Type, 
  Eraser,
  Lock,
  Unlock
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Tool definitions
const TOOLS = [
  { id: 'pan', icon: Hand, label: 'Pan (Space)' },
  { id: 'pencil', icon: Pencil, label: 'Pencil (P)' },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: CircleIcon, label: 'Circle (C)' },
  { id: 'line', icon: Minus, label: 'Line (L)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
];

// Preset colors
const COLORS = [
  '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#71717a', '#000000'
];

const MapCanvas = () => {
  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  // Canvas state
  const [elements, setElements] = useState([]);
  const [selectedTool, setSelectedTool] = useState('pan');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(24);
  
  // Viewport state
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const [startPos, setStartPos] = useState(null);
  
  // Text input state
  const [textInput, setTextInput] = useState(null);
  
  // Refs
  const stageRef = useRef(null);
  const textInputRef = useRef(null);
  
  // Window size
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Load elements on mount
  useEffect(() => {
    loadElements();
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (textInput) return; // Don't handle shortcuts when typing
      
      if (!isAdmin) {
        // Only pan tool for viewers
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case 'p':
          setSelectedTool('pencil');
          break;
        case 'r':
          setSelectedTool('rectangle');
          break;
        case 'c':
          setSelectedTool('circle');
          break;
        case 'l':
          setSelectedTool('line');
          break;
        case 't':
          setSelectedTool('text');
          break;
        case 'e':
          setSelectedTool('eraser');
          break;
        case ' ':
          e.preventDefault();
          setSelectedTool('pan');
          break;
        case 'escape':
          setTextInput(null);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, textInput]);

  // Load elements from backend
  const loadElements = async () => {
    try {
      const response = await axios.get(`${API}/canvas/elements`);
      setElements(response.data.elements || []);
    } catch (error) {
      console.error('Failed to load elements:', error);
    }
  };

  // Save element to backend
  const saveElement = async (element) => {
    try {
      await axios.post(`${API}/canvas/elements`, element);
    } catch (error) {
      console.error('Failed to save element:', error);
      toast.error('Failed to save');
    }
  };

  // Delete element from backend
  const deleteElement = async (elementId) => {
    try {
      await axios.delete(`${API}/canvas/elements/${elementId}`);
    } catch (error) {
      console.error('Failed to delete element:', error);
    }
  };

  // Get pointer position relative to stage
  const getPointerPos = () => {
    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    return {
      x: (pointerPos.x - stagePos.x) / scale,
      y: (pointerPos.y - stagePos.y) / scale
    };
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const oldScale = scale;
    const pointerPos = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointerPos.x - stagePos.x) / oldScale,
      y: (pointerPos.y - stagePos.y) / oldScale,
    };
    
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.15;
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Clamp scale
    newScale = Math.max(0.02, Math.min(50, newScale));
    
    setScale(newScale);
    setStagePos({
      x: pointerPos.x - mousePointTo.x * newScale,
      y: pointerPos.y - mousePointTo.y * newScale,
    });
  };

  // Handle mouse down
  const handleMouseDown = (e) => {
    if (!isAdmin || selectedTool === 'pan') {
      return;
    }
    
    const pos = getPointerPos();
    setStartPos(pos);
    setIsDrawing(true);
    
    if (selectedTool === 'pencil') {
      const newElement = {
        id: `el-${Date.now()}`,
        type: 'freehand',
        points: [pos.x, pos.y],
        color: selectedColor,
        strokeWidth: strokeWidth,
        zoomLevel: scale
      };
      setCurrentElement(newElement);
    } else if (selectedTool === 'line') {
      const newElement = {
        id: `el-${Date.now()}`,
        type: 'line',
        points: [pos.x, pos.y, pos.x, pos.y],
        color: selectedColor,
        strokeWidth: strokeWidth,
        zoomLevel: scale
      };
      setCurrentElement(newElement);
    } else if (selectedTool === 'rectangle') {
      const newElement = {
        id: `el-${Date.now()}`,
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: selectedColor,
        strokeWidth: strokeWidth,
        zoomLevel: scale
      };
      setCurrentElement(newElement);
    } else if (selectedTool === 'circle') {
      const newElement = {
        id: `el-${Date.now()}`,
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 0,
        color: selectedColor,
        strokeWidth: strokeWidth,
        zoomLevel: scale
      };
      setCurrentElement(newElement);
    } else if (selectedTool === 'text') {
      setTextInput({
        x: pos.x,
        y: pos.y,
        screenX: e.evt.clientX,
        screenY: e.evt.clientY
      });
      setIsDrawing(false);
    } else if (selectedTool === 'eraser') {
      // Check if clicked on any element
      const clickedElement = findElementAtPoint(pos);
      if (clickedElement) {
        setElements(prev => prev.filter(el => el.id !== clickedElement.id));
        deleteElement(clickedElement.id);
      }
    }
  };

  // Find element at point for eraser
  const findElementAtPoint = (pos) => {
    const threshold = 10 / scale;
    
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      
      if (el.type === 'freehand' || el.type === 'line') {
        for (let j = 0; j < el.points.length - 2; j += 2) {
          const dist = pointToLineDistance(
            pos.x, pos.y,
            el.points[j], el.points[j + 1],
            el.points[j + 2], el.points[j + 3]
          );
          if (dist < threshold + el.strokeWidth) {
            return el;
          }
        }
      } else if (el.type === 'rectangle') {
        if (pos.x >= el.x && pos.x <= el.x + el.width &&
            pos.y >= el.y && pos.y <= el.y + el.height) {
          return el;
        }
      } else if (el.type === 'circle') {
        const dist = Math.sqrt(Math.pow(pos.x - el.x, 2) + Math.pow(pos.y - el.y, 2));
        if (dist <= el.radius + threshold) {
          return el;
        }
      } else if (el.type === 'text') {
        // Rough text hit detection
        if (pos.x >= el.x && pos.x <= el.x + 200 &&
            pos.y >= el.y - 30 && pos.y <= el.y + 10) {
          return el;
        }
      }
    }
    return null;
  };

  // Point to line distance helper
  const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!isDrawing || !currentElement) return;
    
    const pos = getPointerPos();
    
    if (selectedTool === 'pencil') {
      setCurrentElement(prev => ({
        ...prev,
        points: [...prev.points, pos.x, pos.y]
      }));
    } else if (selectedTool === 'line') {
      setCurrentElement(prev => ({
        ...prev,
        points: [prev.points[0], prev.points[1], pos.x, pos.y]
      }));
    } else if (selectedTool === 'rectangle') {
      setCurrentElement(prev => ({
        ...prev,
        width: pos.x - startPos.x,
        height: pos.y - startPos.y
      }));
    } else if (selectedTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
      );
      setCurrentElement(prev => ({
        ...prev,
        radius: radius
      }));
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) {
      setIsDrawing(false);
      return;
    }
    
    setIsDrawing(false);
    
    // Only save if element has meaningful size
    let shouldSave = false;
    
    if (selectedTool === 'pencil' && currentElement.points.length > 4) {
      shouldSave = true;
    } else if (selectedTool === 'line') {
      const dx = currentElement.points[2] - currentElement.points[0];
      const dy = currentElement.points[3] - currentElement.points[1];
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        shouldSave = true;
      }
    } else if (selectedTool === 'rectangle') {
      if (Math.abs(currentElement.width) > 5 && Math.abs(currentElement.height) > 5) {
        shouldSave = true;
      }
    } else if (selectedTool === 'circle') {
      if (currentElement.radius > 5) {
        shouldSave = true;
      }
    }
    
    if (shouldSave) {
      setElements(prev => [...prev, currentElement]);
      saveElement(currentElement);
    }
    
    setCurrentElement(null);
    setStartPos(null);
  };

  // Handle text submit
  const handleTextSubmit = (text) => {
    if (!text.trim()) {
      setTextInput(null);
      return;
    }
    
    const newElement = {
      id: `el-${Date.now()}`,
      type: 'text',
      x: textInput.x,
      y: textInput.y,
      text: text,
      color: selectedColor,
      fontSize: fontSize,
      zoomLevel: scale
    };
    
    setElements(prev => [...prev, newElement]);
    saveElement(newElement);
    setTextInput(null);
  };

  // Zoom controls
  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.3, 50);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale / 1.3, 0.02);
    setScale(newScale);
  };

  const handleResetView = () => {
    setScale(1);
    setStagePos({ x: 0, y: 0 });
  };

  // Admin login
  const handleAdminLogin = async (password) => {
    try {
      const response = await axios.post(`${API}/auth/verify`, { password });
      if (response.data.success) {
        setIsAdmin(true);
        setShowAdminModal(false);
        toast.success('Edit mode enabled');
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      toast.error('Authentication failed');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setSelectedTool('pan');
    toast.success('Switched to view mode');
  };

  // Clear canvas
  const handleClearCanvas = async () => {
    if (!window.confirm('Are you sure you want to clear the entire canvas?')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/canvas/elements`);
      setElements([]);
      toast.success('Canvas cleared');
    } catch (error) {
      toast.error('Failed to clear canvas');
    }
  };

  // Render elements
  const renderElement = (el) => {
    if (el.type === 'freehand' || el.type === 'line') {
      return (
        <Line
          key={el.id}
          points={el.points}
          stroke={el.color}
          strokeWidth={el.strokeWidth}
          tension={el.type === 'freehand' ? 0.5 : 0}
          lineCap=\"round\"
          lineJoin=\"round\"
          globalCompositeOperation=\"source-over\"
        />
      );
    } else if (el.type === 'rectangle') {
      return (
        <Rect
          key={el.id}
          x={el.x}
          y={el.y}
          width={el.width}
          height={el.height}
          stroke={el.color}
          strokeWidth={el.strokeWidth}
          fill=\"transparent\"
        />
      );
    } else if (el.type === 'circle') {
      return (
        <Circle
          key={el.id}
          x={el.x}
          y={el.y}
          radius={el.radius}
          stroke={el.color}
          strokeWidth={el.strokeWidth}
          fill=\"transparent\"
        />
      );
    } else if (el.type === 'text') {
      return (
        <Text
          key={el.id}
          x={el.x}
          y={el.y}
          text={el.text}
          fill={el.color}
          fontSize={el.fontSize}
          fontFamily=\"Inter\"
        />
      );
    }
    return null;
  };

  // Determine cursor
  const getCursor = () => {
    if (!isAdmin) return 'grab';
    switch (selectedTool) {
      case 'pan': return 'grab';
      case 'pencil': return 'crosshair';
      case 'eraser': return 'pointer';
      case 'text': return 'text';
      default: return 'crosshair';
    }
  };

  return (
    <div className=\"canvas-container\" data-testid=\"map-canvas-container\">
      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={windowSize.width}
        height={windowSize.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        draggable={selectedTool === 'pan' || !isAdmin}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={scale}
        scaleY={scale}
        onDragEnd={(e) => {
          setStagePos({ x: e.target.x(), y: e.target.y() });
        }}
        style={{ cursor: getCursor() }}
      >
        <Layer>
          {/* Grid pattern for reference */}
          {scale > 0.1 && (
            <>
              {/* Origin marker */}
              <Line
                points={[-50, 0, 50, 0]}
                stroke=\"rgba(59, 130, 246, 0.3)\"
                strokeWidth={1 / scale}
              />
              <Line
                points={[0, -50, 0, 50]}
                stroke=\"rgba(59, 130, 246, 0.3)\"
                strokeWidth={1 / scale}
              />
            </>
          )}
          
          {/* Render all elements */}
          {elements.map(renderElement)}
          
          {/* Render current drawing element */}
          {currentElement && renderElement(currentElement)}
        </Layer>
      </Stage>
      
      {/* Text input overlay */}
      {textInput && (
        <input
          ref={textInputRef}
          type=\"text\"
          className=\"canvas-text-input\"
          style={{
            left: textInput.screenX,
            top: textInput.screenY,
            fontSize: fontSize,
            color: selectedColor
          }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleTextSubmit(e.target.value);
            } else if (e.key === 'Escape') {
              setTextInput(null);
            }
          }}
          onBlur={(e) => handleTextSubmit(e.target.value)}
          data-testid=\"text-input\"
        />
      )}
      
      {/* Top Bar */}
      <TopBar 
        scale={scale} 
        isAdmin={isAdmin}
        onClearCanvas={handleClearCanvas}
      />
      
      {/* Admin Button */}
      <div className=\"admin-btn-container\">
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className=\"glass-pill px-4 py-2 flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors\"
            data-testid=\"logout-btn\"
          >
            <Unlock size={16} />
            <span className=\"text-sm font-medium\">Editing</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAdminModal(true)}
            className=\"glass-pill px-4 py-2 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors\"
            data-testid=\"admin-login-btn\"
          >
            <Lock size={16} />
            <span className=\"text-sm font-medium\">Edit</span>
          </button>
        )}
      </div>
      
      {/* Toolbar (only show full toolbar for admin) */}
      {isAdmin && (
        <Toolbar
          tools={TOOLS}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
        />
      )}
      
      {/* Color Picker (only for admin) */}
      {isAdmin && (
        <ColorPicker
          colors={COLORS}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />
      )}
      
      {/* Stroke Width Slider (only for admin) */}
      {isAdmin && (
        <StrokeSlider
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          selectedTool={selectedTool}
        />
      )}
      
      {/* Zoom Controls */}
      <ZoomControls
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
      />
      
      {/* Admin Modal */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onLogin={handleAdminLogin}
      />
    </div>
  );
};

export default MapCanvas;
"
