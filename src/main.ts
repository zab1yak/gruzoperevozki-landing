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
import { renderContacts, renderFooter } from './components/contacts';
import { initAnimations } from './components/animations';
import { a11y, company, hero } from './content';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `
    <a class="skip-link" href="#main">${a11y.skip}</a>
    ${renderHeader()}
    <main id="main" tabindex="-1">
      ${renderHero()}
      ${renderStats()}
      ${renderServices()}
      ${renderFleet()}
      ${renderProcess()}
      ${renderQuoteForm()}
      ${renderReviews()}
      ${renderFaq()}
      ${renderContacts()}
    </main>
    ${renderFooter()}`;
  initHeader();
  initQuoteForm();
  initFaq();
  initAnimations();
}

// Структурированные данные для поисковиков, значения берутся из content.ts
const jsonLd = document.createElement('script');
jsonLd.type = 'application/ld+json';
jsonLd.textContent = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'MovingCompany',
  name: company.name,
  description: hero.subtitle,
  telephone: company.phone,
  email: company.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: company.city,
    streetAddress: company.address,
    addressCountry: 'RU',
  },
  areaServed: company.area,
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '22:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '10:00',
      closes: '20:00',
    },
  ],
});
document.head.appendChild(jsonLd);
