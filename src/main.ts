import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './style.css';
import { renderHeader, initHeader } from './components/header';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `
    ${renderHeader()}
    <main id="top"></main>`;
  initHeader();
}
