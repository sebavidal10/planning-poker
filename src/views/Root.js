import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import App from './App';
import Home from './Home';
import NotFound from './NotFound';

const Root = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:slug" element={<App />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
  </Router>
);

export default Root;
