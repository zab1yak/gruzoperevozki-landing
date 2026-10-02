import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './style.css';
import { renderHeader, initHeader } from './components/header';
import { renderHero } from './components/hero';
import { renderStats } from './components/stats';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `
    ${renderHeader()}
    <main>
      ${renderHero()}
      ${renderStats()}
    </main>`;
  initHeader();
}
