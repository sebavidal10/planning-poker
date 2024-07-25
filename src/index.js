import React from 'react';
import ReactDOM from 'react-dom';
import Root from './views/Root'; // Asegúrate de importar el componente Root
import './assets/styles/main.css';

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
);
