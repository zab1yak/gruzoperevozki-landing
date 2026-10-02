import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './style.css';
import { renderHeader, initHeader } from './components/header';
import { renderHero } from './components/hero';
import { renderStats } from './components/stats';
import { renderServices } from './components/services';
import { renderFleet } from './components/fleet';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `
    ${renderHeader()}
    <main>
      ${renderHero()}
      ${renderStats()}
      ${renderServices()}
      ${renderFleet()}
    </main>`;
  initHeader();
}
