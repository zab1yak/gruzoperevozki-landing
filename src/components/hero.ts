import { company, cta, hero } from '../content';
import { button, plate, tag } from './ui';

const WIDTHS = [640, 960, 1440, 1920, 2560];

function unsplash(width: number): string {
  return `${hero.image.src}?auto=format&fit=crop&w=${width}&q=70`;
}

export function renderHero(): string {
  const srcset = WIDTHS.map((w) => `${unsplash(w)} ${w}w`).join(', ');
  return `
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="hero__photo">
        <img
          class="hero__img"
          src="${unsplash(1920)}"
          srcset="${srcset}"
          sizes="100vw"
          width="1920"
          height="1280"
          alt="${hero.image.alt}"
          fetchpriority="high"
          decoding="async"
        />
      </div>

      <div class="container hero__inner">
        <div class="hero__col">
          <div class="hero__top">
            ${tag('Пермь / Пермский край', true)}
          </div>
          <div class="hero__main">
            <h1 id="hero-title">${hero.title.join(' <br />')}</h1>
            <p class="lead hero__sub">${hero.subtitle}</p>
            <div class="hero__actions">
              ${button({ label: cta.quote, href: '#quote' })}
              ${button({ label: cta.call, href: company.phoneHref, variant: 'ghost' })}
            </div>
          </div>
        </div>

        <div class="hero__corner">
          ${plate(company.hoursCompact)}
        </div>
      </div>
    </section>`;
}
