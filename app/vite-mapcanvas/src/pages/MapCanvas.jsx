import React, { useState, useEffect, useRef } from 'react'
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva'
import { toast } from 'sonner'
import axios from 'axios'
import Toolbar from '@/components/Toolbar'
import ZoomControls from '@/components/ZoomControls'
import ColorPicker from '@/components/ColorPicker'
import StrokeSlider from '@/components/StrokeSlider'
import AdminModal from '@/components/AdminModal'
import TopBar from '@/components/TopBar'
import { 
  Hand, Pencil, Square, Circle as CircleIcon, Minus, Type, Eraser,
  Lock, Unlock, Share2, Check
} from 'lucide-react'

const API = 'https://puppy-nation.onrender.com/api'

const TOOLS = [
  { id: 'pan', icon: Hand, label: 'Pan (Space)' },
  { id: 'pencil', icon: Pencil, label: 'Pencil (P)' },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: CircleIcon, label: 'Circle (C)' },
  { id: 'line', icon: Minus, label: 'Line (L)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
]

const COLORS = [
  '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#71717a', '#000000'
]

const MapCanvas = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [elements, setElements] = useState([])
  const [selectedTool, setSelectedTool] = useState('pan')
  const [selectedColor, setSelectedColor] = useState('#ffffff')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [fontSize, setFontSize] = useState(24)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentElement, setCurrentElement] = useState(null)
  const [startPos, setStartPos] = useState(null)
  const [textInput, setTextInput] = useState(null)
  const [copied, setCopied] = useState(false)
  const stageRef = useRef(null)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      try {
        const params = new URLSearchParams(hash.slice(1))
        const x = parseFloat(params.get('x'))
        const y = parseFloat(params.get('y'))
        const s = parseFloat(params.get('s'))
        if (!isNaN(x) && !isNaN(y) && !isNaN(s)) {
          setStagePos({ x, y })
          setScale(s)
        }
      } catch (e) {
        console.error('Failed to parse URL hash:', e)
      }
    }
  }, [])

  useEffect(() => {
    loadElements()
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (textInput || !isAdmin) return
      switch (e.key.toLowerCase()) {
        case 'p': setSelectedTool('pencil'); break
        case 'r': setSelectedTool('rectangle'); break
        case 'c': setSelectedTool('circle'); break
        case 'l': setSelectedTool('line'); break
        case 't': setSelectedTool('text'); break
        case 'e': setSelectedTool('eraser'); break
        case ' ': e.preventDefault(); setSelectedTool('pan'); break
        case 'escape': setTextInput(null); break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdmin, textInput])

  const loadElements = async () => {
    try {
      const response = await axios.get(`${API}/canvas/elements`)
      setElements(response.data.elements || [])
    } catch (error) {
      console.error('Failed to load elements:', error)
    }
  }

  const saveElement = async (element) => {
    try {
      await axios.post(`${API}/canvas/elements`, element)
    } catch (error) {
      console.error('Failed to save element:', error)
      toast.error('Failed to save')
    }
  }

  const deleteElement = async (elementId) => {
    try {
      await axios.delete(`${API}/canvas/elements/${elementId}`)
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to delete element:', error)
      }
    }
  }

  const getPointerPos = () => {
    const stage = stageRef.current
    const pointerPos = stage.getPointerPosition()
    return {
      x: (pointerPos.x - stagePos.x) / scale,
      y: (pointerPos.y - stagePos.y) / scale
    }
  }

  const handleWheel = (e) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    const oldScale = scale
    const pointerPos = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointerPos.x - stagePos.x) / oldScale,
      y: (pointerPos.y - stagePos.y) / oldScale,
    }
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const scaleBy = 1.15
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
    newScale = Math.max(0.02, Math.min(50, newScale))
    setScale(newScale)
    setStagePos({
      x: pointerPos.x - mousePointTo.x * newScale,
      y: pointerPos.y - mousePointTo.y * newScale,
    })
  }

  const handleMouseDown = (e) => {
    if (!isAdmin || selectedTool === 'pan') return
    const pos = getPointerPos()
    setStartPos(pos)
    setIsDrawing(true)

    if (selectedTool === 'pencil') {
      setCurrentElement({
        id: `el-${Date.now()}`, type: 'freehand', points: [pos.x, pos.y],
        color: selectedColor, strokeWidth, zoomLevel: scale
      })
    } else if (selectedTool === 'line') {
      setCurrentElement({
        id: `el-${Date.now()}`, type: 'line', points: [pos.x, pos.y, pos.x, pos.y],
        color: selectedColor, strokeWidth, zoomLevel: scale
      })
    } else if (selectedTool === 'rectangle') {
      setCurrentElement({
        id: `el-${Date.now()}`, type: 'rectangle', x: pos.x, y: pos.y,
        width: 0, height: 0, color: selectedColor, strokeWidth, zoomLevel: scale
      })
    } else if (selectedTool === 'circle') {
      setCurrentElement({
        id: `el-${Date.now()}`, type: 'circle', x: pos.x, y: pos.y,
        radius: 0, color: selectedColor, strokeWidth, zoomLevel: scale
      })
    } else if (selectedTool === 'text') {
      setTextInput({ x: pos.x, y: pos.y, screenX: e.evt.clientX, screenY: e.evt.clientY })
      setIsDrawing(false)
    } else if (selectedTool === 'eraser') {
      const clickedElement = findElementAtPoint(pos)
      if (clickedElement) {
        setElements(prev => prev.filter(el => el.id !== clickedElement.id))
        deleteElement(clickedElement.id)
      }
    }
  }

  const findElementAtPoint = (pos) => {
    const threshold = 10 / scale
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i]
      if (el.type === 'freehand' || el.type === 'line') {
        for (let j = 0; j < el.points.length - 2; j += 2) {
          const dist = pointToLineDistance(pos.x, pos.y, el.points[j], el.points[j+1], el.points[j+2], el.points[j+3])
          if (dist < threshold + el.strokeWidth) return el
        }
      } else if (el.type === 'rectangle') {
        if (pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) return el
      } else if (el.type === 'circle') {
        const dist = Math.sqrt(Math.pow(pos.x - el.x, 2) + Math.pow(pos.y - el.y, 2))
        if (dist <= el.radius + threshold) return el
      } else if (el.type === 'text') {
        if (pos.x >= el.x && pos.x <= el.x + 200 && pos.y >= el.y - 30 && pos.y <= el.y + 10) return el
      }
    }
    return null
  }

  const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1
    const dot = A * C + B * D, lenSq = C * C + D * D
    let param = lenSq !== 0 ? dot / lenSq : -1
    let xx, yy
    if (param < 0) { xx = x1; yy = y1 }
    else if (param > 1) { xx = x2; yy = y2 }
    else { xx = x1 + param * C; yy = y1 + param * D }
    return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2)
  }

  const handleMouseMove = () => {
    if (!isDrawing || !currentElement) return
    const pos = getPointerPos()
    if (selectedTool === 'pencil') {
      setCurrentElement(prev => ({ ...prev, points: [...prev.points, pos.x, pos.y] }))
    } else if (selectedTool === 'line') {
      setCurrentElement(prev => ({ ...prev, points: [prev.points[0], prev.points[1], pos.x, pos.y] }))
    } else if (selectedTool === 'rectangle') {
      setCurrentElement(prev => ({ ...prev, width: pos.x - startPos.x, height: pos.y - startPos.y }))
    } else if (selectedTool === 'circle') {
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2))
      setCurrentElement(prev => ({ ...prev, radius }))
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) { setIsDrawing(false); return }
    setIsDrawing(false)
    let shouldSave = false
    if (selectedTool === 'pencil' && currentElement.points.length > 4) shouldSave = true
    else if (selectedTool === 'line') {
      const dx = currentElement.points[2] - currentElement.points[0]
      const dy = currentElement.points[3] - currentElement.points[1]
      if (Math.sqrt(dx * dx + dy * dy) > 5) shouldSave = true
    } else if (selectedTool === 'rectangle') {
      if (Math.abs(currentElement.width) > 5 && Math.abs(currentElement.height) > 5) shouldSave = true
    } else if (selectedTool === 'circle') {
      if (currentElement.radius > 5) shouldSave = true
    }
    if (shouldSave) {
      setElements(prev => [...prev, currentElement])
      saveElement(currentElement)
    }
    setCurrentElement(null)
    setStartPos(null)
  }

  const handleTextSubmit = (text) => {
    if (!text.trim()) { setTextInput(null); return }
    const newElement = {
      id: `el-${Date.now()}`, type: 'text', x: textInput.x, y: textInput.y,
      text, color: selectedColor, fontSize, zoomLevel: scale
    }
    setElements(prev => [...prev, newElement])
    saveElement(newElement)
    setTextInput(null)
  }

  const handleZoomIn = () => setScale(Math.min(scale * 1.3, 50))
  const handleZoomOut = () => setScale(Math.max(scale / 1.3, 0.02))
  const handleResetView = () => {
    setScale(1)
    setStagePos({ x: 0, y: 0 })
    window.history.replaceState(null, '', window.location.pathname)
  }

  const handleShare = async () => {
    const params = new URLSearchParams({ x: Math.round(stagePos.x), y: Math.round(stagePos.y), s: scale.toFixed(2) })
    const shareUrl = `${window.location.origin}${window.location.pathname}#${params.toString()}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied!')
      window.history.replaceState(null, '', `#${params.toString()}`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAdminLogin = async (password) => {
    try {
      const response = await axios.post(`${API}/auth/verify`, { password })
      if (response.data.success) {
        setIsAdmin(true)
        setShowAdminModal(false)
        toast.success('Edit mode enabled')
      } else {
        toast.error('Invalid password')
      }
    } catch {
      toast.error('Authentication failed')
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    setSelectedTool('pan')
    toast.success('Switched to view mode')
  }

  const handleClearCanvas = async () => {
    if (!window.confirm('Clear the entire canvas?')) return
    try {
      await axios.delete(`${API}/canvas/elements`)
      setElements([])
      toast.success('Canvas cleared')
    } catch {
      toast.error('Failed to clear canvas')
    }
  }

  const renderElement = (el) => {
    if (el.type === 'freehand' || el.type === 'line') {
      return <Line key={el.id} points={el.points} stroke={el.color} strokeWidth={el.strokeWidth} tension={el.type === 'freehand' ? 0.5 : 0} lineCap=\"round\" lineJoin=\"round\" />
    } else if (el.type === 'rectangle') {
      return <Rect key={el.id} x={el.x} y={el.y} width={el.width} height={el.height} stroke={el.color} strokeWidth={el.strokeWidth} fill=\"transparent\" />
    } else if (el.type === 'circle') {
      return <Circle key={el.id} x={el.x} y={el.y} radius={el.radius} stroke={el.color} strokeWidth={el.strokeWidth} fill=\"transparent\" />
    } else if (el.type === 'text') {
      return <Text key={el.id} x={el.x} y={el.y} text={el.text} fill={el.color} fontSize={el.fontSize} fontFamily=\"Inter\" />
    }
    return null
  }

  const getCursor = () => {
    if (!isAdmin) return 'grab'
    switch (selectedTool) {
      case 'pan': return 'grab'
      case 'pencil': return 'crosshair'
      case 'eraser': return 'pointer'
      case 'text': return 'text'
      default: return 'crosshair'
    }
  }

  return (
    <div className=\"canvas-container\">
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
        onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
        style={{ cursor: getCursor() }}
      >
        <Layer>
          {scale > 0.1 && (
            <>
              <Line points={[-50, 0, 50, 0]} stroke=\"rgba(59, 130, 246, 0.3)\" strokeWidth={1 / scale} />
              <Line points={[0, -50, 0, 50]} stroke=\"rgba(59, 130, 246, 0.3)\" strokeWidth={1 / scale} />
            </>
          )}
          {elements.map(renderElement)}
          {currentElement && renderElement(currentElement)}
        </Layer>
      </Stage>

      {textInput && (
        <input
          type=\"text\"
          className=\"canvas-text-input\"
          style={{ left: textInput.screenX, top: textInput.screenY, fontSize, color: selectedColor }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTextSubmit(e.target.value)
            else if (e.key === 'Escape') setTextInput(null)
          }}
          onBlur={(e) => handleTextSubmit(e.target.value)}
        />
      )}

      <TopBar scale={scale} isAdmin={isAdmin} onClearCanvas={handleClearCanvas} />

      <div className=\"admin-btn-container\">
        {isAdmin ? (
          <button onClick={handleLogout} className=\"glass-pill px-4 py-2 flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors\">
            <Unlock size={16} />
            <span className=\"text-sm font-medium\">Editing</span>
          </button>
        ) : (
          <button onClick={() => setShowAdminModal(true)} className=\"glass-pill px-4 py-2 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors\">
            <Lock size={16} />
            <span className=\"text-sm font-medium\">Edit</span>
          </button>
        )}
      </div>

      {isAdmin && <Toolbar tools={TOOLS} selectedTool={selectedTool} onSelectTool={setSelectedTool} />}
      {isAdmin && <ColorPicker colors={COLORS} selectedColor={selectedColor} onSelectColor={setSelectedColor} />}
      {isAdmin && <StrokeSlider strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth} fontSize={fontSize} onFontSizeChange={setFontSize} selectedTool={selectedTool} />}

      <ZoomControls scale={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleResetView} />

      <div className=\"share-btn-container\">
        <button onClick={handleShare} className={`glass-pill px-4 py-2 flex items-center gap-2 transition-all duration-200 ${copied ? 'text-green-400' : 'text-zinc-400 hover:text-white'}`}>
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          <span className=\"text-sm font-medium\">{copied ? 'Copied!' : 'Share View'}</span>
        </button>
      </div>

      <AdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} onLogin={handleAdminLogin} />
    </div>
  )
}

export default MapCanvas
