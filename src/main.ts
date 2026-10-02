import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './style.css';
import { renderHeader, initHeader } from './components/header';
import { renderHero } from './components/hero';
import { renderStats } from './components/stats';
import { renderServices } from './components/services';
import { renderFleet } from './components/fleet';
import { renderProcess } from './components/process';
import { renderQuoteForm, initQuoteForm } from './components/quoteForm';
import { renderReviews, renderFaq, initFaq } from './components/reviews';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `
    ${renderHeader()}
    <main>
      ${renderHero()}
      ${renderStats()}
      ${renderServices()}
      ${renderFleet()}
      ${renderProcess()}
      ${renderQuoteForm()}
      ${renderReviews()}
      ${renderFaq()}
    </main>`;
  initHeader();
  initQuoteForm();
  initFaq();
}
