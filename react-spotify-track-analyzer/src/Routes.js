// Routes.js
import React from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import HomePage from './Home.js';

const Routes = () => {
  return (
    <Router>
        <Route path="/" exact component={HomePage} />
    </Router>
  );
};

export default Routes;
