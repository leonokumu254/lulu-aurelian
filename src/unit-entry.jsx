import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './components/UnitPage.css';
import UnitPage from './components/UnitPage.jsx';

const rootEl = document.getElementById('unit-root');
const unitId = rootEl?.getAttribute('data-unit') || 'skyview';

createRoot(rootEl).render(
  <StrictMode>
    <UnitPage unitId={unitId} />
  </StrictMode>,
);
