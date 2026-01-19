"import React from \"react\";
import \"@/App.css\";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from \"@/components/ui/sonner\";
import MapCanvas from \"@/pages/MapCanvas\";

function App() {
  return (
    <div className=\"App\">
      <HashRouter>
        <Routes>
          <Route path=\"/\" element={<MapCanvas />} />
        </Routes>
       <HashRouter>
      <Toaster position=\"bottom-center\" theme=\"dark\" />
    </div>
  );
}

export default App;
"
