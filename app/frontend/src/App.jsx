"import React from \"react\";
import \"@/App.css\";
import { BrowserRouter, Routes, Route } from \"react-router-dom\";
import { Toaster } from \"@/components/ui/sonner\";
import MapCanvas from \"@/pages/MapCanvas\";

function App() {
  return (
    <div className=\"App\">
      <BrowserRouter>
        <Routes>
          <Route path=\"/\" element={<MapCanvas />} />
        </Routes>
      </BrowserRouter>
      <Toaster position=\"bottom-center\" theme=\"dark\" />
    </div>
  );
}

export default App;
"
