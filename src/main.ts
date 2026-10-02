import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './style.css';
import { company, cta } from './content';
import { button, card, photo, plate, tag } from './components/ui';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `
    <main class="container section">
      <h1>${company.name}</h1>
      <p class="lead">${company.tagline}</p>
      <div style="display:flex;gap:16px;margin-block:32px;flex-wrap:wrap">
        ${button({ label: cta.quote, href: '#quote' })}
        ${button({ label: cta.call, href: company.phoneHref, variant: 'ghost' })}
        ${tag('Пермь')} ${tag('Межгород', true)}
        ${plate('Гарантия по договору', true)}
      </div>
      <div class="grid grid--3">
        ${card('<h3>Карточка</h3><p>Текст карточки</p>', { href: '#' })}
        ${card('<h3>Карточка</h3><p>Текст карточки</p>')}
        ${photo('Грузовик крупным планом')}
      </div>
    </main>`;
}
