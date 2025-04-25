import { BrowserRouter, Routes, Route } from "react-router-dom";
import AngebotPage from "./pages/AngebotPage"; // ← Pfad anpassen, falls nötig!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/angebot/:token" element={<AngebotPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
