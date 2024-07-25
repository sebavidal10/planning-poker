import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';
import App from './App';
import Home from './Home';

const VotingApp = () => {
  let { votingInstanceName } = useParams();
  return <App votingInstanceName={votingInstanceName} />;
};

const Root = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:votingInstanceName" element={<VotingApp />} />
    </Routes>
  </Router>
);

export default Root;
