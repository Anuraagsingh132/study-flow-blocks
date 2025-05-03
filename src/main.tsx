
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend Three.js with all the objects we're using in our animations
extend(THREE);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
