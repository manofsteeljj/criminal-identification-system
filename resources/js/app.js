import { createRoot } from 'react-dom/client';
import App from './AppRoot';

const rootElement = document.getElementById('app');

if (rootElement) {
	createRoot(rootElement).render(<App />);
}
