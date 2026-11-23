import '@fontsource-variable/inter/wght.css';
import './style.css';
import { renderHeader, initHeader } from './components/header';
import { renderHero } from './components/hero';
import { initCalculator } from './components/calculator';
import { renderServices } from './components/services';
import { renderFleet } from './components/fleet';
import { renderProcess } from './components/process';
import { renderQuoteCard, initQuoteForm } from './components/quoteForm';
import { renderFaq, initFaq } from './components/reviews';
import { renderContacts, renderFooter, initMap } from './components/contacts';
import { initAnimations } from './components/animations';
import { a11y, company, hero } from './content';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `<a class="skip-link" href="#main">${a11y.skip}</a>
    ${renderHeader()}<main id="main" tabindex="-1">
    ${renderHero()}${renderServices()}${renderFleet()}${renderQuoteCard()}
    ${renderProcess()}${renderFaq()}${renderContacts()}</main>${renderFooter()}`;
  initHeader();
  initCalculator();
  initQuoteForm();
  initFaq();
  initMap();
  initAnimations();
}
const jsonLd = document.createElement('script');
jsonLd.type = 'application/ld+json';
jsonLd.textContent = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'MovingCompany',
  name: company.name,
  description: hero.subtitle,
  areaServed: company.area,
  telephone: company.contacts.map((c) => c.href.slice(4)),
  openingHours: 'Mo-Su 00:00-23:59',
});
document.head.appendChild(jsonLd);
