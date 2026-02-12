import React from 'react';
import ReactDOM from 'react-dom';
import Root from './views/Root';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './assets/styles/index.css';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <Root />
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
