import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './router/App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    
    {/*
      GitHub Pages (Project Pages) no soporta SPA routing con BrowserRouter sin hacks de 404.
      HashRouter evita 404 al refrescar y funciona bien en /<repo>/.
    */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
