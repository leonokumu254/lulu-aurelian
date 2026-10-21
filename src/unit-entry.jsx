import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './components/UnitPage.css';
import UnitPage from './components/UnitPage.jsx';
import Toast from './components/Toast.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const rootEl = document.getElementById('unit-root');
const unitId = rootEl?.getAttribute('data-unit') || 'skyview';

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <UnitPage unitId={unitId} />
      <Toast />
    </ErrorBoundary>
  </StrictMode>,
);
