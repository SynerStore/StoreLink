import ReactDOM from 'react-dom/client';
import TaskPanelApp from './app';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<TaskPanelApp />);
}
