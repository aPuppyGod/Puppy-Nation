import React from 'react'
import { Toaster } from 'sonner'
import MapCanvas from './pages/MapCanvas'
import './App.css'

function App() {
  return (
    <div className=\"App\">
      <MapCanvas />
      <Toaster position=\"bottom-center\" theme=\"dark\" />
    </div>
  )
}

export default App
