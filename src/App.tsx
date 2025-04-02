import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Shirt } from 'lucide-react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Athletes from './pages/Athletes';
import Uniforms from './pages/Uniforms';
import Assignments from './pages/Assignments';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/athletes" element={<Athletes />} />
            <Route path="/uniforms" element={<Uniforms />} />
            <Route path="/assignments" element={<Assignments />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;