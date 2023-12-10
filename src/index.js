import React from 'react';
import ReactDOM from 'react-dom';

import Page from 'components/Page';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <div className="top-level-container">
      <Page />
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);
