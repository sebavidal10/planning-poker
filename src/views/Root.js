import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
  Navigate,
} from 'react-router-dom';
import App from './App';
import Home from './Home';
import NotFound from './NotFound';

const VotingApp = () => {
  let { votingInstanceName } = useParams();
  return <App votingInstanceName={votingInstanceName} />;
};

const Root = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:votingInstanceName" element={<VotingApp />} />
      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
  </Router>
);

export default Root;
