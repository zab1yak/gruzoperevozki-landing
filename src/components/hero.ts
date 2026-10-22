import { company, hero, stats } from '../content';
import { renderQuoteCard } from './quoteForm';
import { button, tag } from './ui';

/**
 * Первый экран: слева кто мы и цифры доверия, справа сразу заявка с датой и временем подачи.
 * Всё помещается в экран ноутбука 1366×768 и 1536×730 (1920 при масштабе 125%).
 */
export function renderHero(): string {
  const facts = stats
    .map(
      (item, index) => `
        <li class="hero__fact${index === 0 ? ' hero__fact--lead' : ''}">
          <span class="stat-value">${item.value}</span>
          <span class="label">${item.label}</span>
        </li>`,
    )
    .join('');

  return `
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="container hero__inner">
        <div class="hero__main">
          ${tag(hero.badge, true)}
          <h1 id="hero-title">${hero.title}</h1>
          <p class="lead hero__sub">${hero.subtitle}</p>
          <div class="hero__contact">
            ${button({ label: company.phone, href: company.phoneHref, variant: 'ghost' })}
            <p class="hero__hours">${company.hoursCompact}</p>
          </div>
        </div>
        ${renderQuoteCard()}
        <ul class="hero__facts" aria-label="Компания в цифрах">${facts}</ul>
      </div>
    </section>`;
}
