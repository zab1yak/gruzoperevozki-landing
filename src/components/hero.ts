import { company, cta, hero } from '../content';
import { button, plate, tag } from './ui';

/** Заглушка объекта: схематичный фургон. Замените фото целиком, когда будет настоящий кадр. */
const truck = `
  <svg class="hero__truck" viewBox="0 0 720 340" aria-hidden="true">
    <path d="M0 40 L36 0 H470 V250 H0 Z" fill="#1c1c1f" stroke="rgb(255 255 255 / 0.14)"/>
    <path d="M486 40 H590 L690 130 V250 H486 Z" fill="#232326" stroke="rgb(255 255 255 / 0.14)"/>
    <path d="M510 62 H580 L650 128 H510 Z" fill="#0b0b0c"/>
    <rect x="0" y="206" width="470" height="10" fill="#ff8a1f"/>
    <rect x="0" y="250" width="690" height="28" fill="#141416"/>
    <g fill="#0b0b0c" stroke="rgb(255 255 255 / 0.2)" stroke-width="3">
      <circle cx="132" cy="288" r="46"/>
      <circle cx="560" cy="288" r="46"/>
    </g>
    <g fill="#2a2a2e">
      <circle cx="132" cy="288" r="18"/>
      <circle cx="560" cy="288" r="18"/>
    </g>
  </svg>`;

export function renderHero(): string {
  return `
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="hero__photo" role="img" aria-label="${hero.imageCaption}">
        ${truck}
      </div>

      <div class="container hero__inner">
        <div class="hero__col">
          <div class="hero__top">
            ${tag('Пермь / Пермский край', true)}
          </div>
          <div class="hero__main">
            <h1 id="hero-title">${hero.title.join('<br />')}</h1>
            <p class="lead hero__sub">${hero.subtitle}</p>
            <div class="hero__actions">
              ${button({ label: cta.quote, href: '#quote' })}
              ${button({ label: cta.call, href: company.phoneHref, variant: 'ghost' })}
            </div>
          </div>
        </div>

        <div class="hero__corner">
          <p class="label hero__caption">${hero.imageCaption}</p>
          ${plate(`${company.yearsOnMarket} года на рынке`)}
        </div>
      </div>
    </section>`;
}
