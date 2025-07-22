import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import Login from './pages/login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
