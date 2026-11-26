import { company, dailySchedule, hero } from '../content';
import { renderCalculator } from './calculator';

export function renderHero(): string {
  const primary = company.contacts[0];
  return `
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="container">
        <div class="hero__intro">
          <div class="hero__main">
            <p class="hero__hours">${dailySchedule}</p>
            <h1 id="hero-title">${hero.title} <span>${hero.location}</span></h1>
          </div>
          <div class="hero__contact">
            <p class="lead">${hero.subtitle}</p>
            <a href="${primary.href}">Уточнить стоимость по телефону</a>
          </div>
        </div>
        <div class="hero__grid">
          <figure class="hero__visual">
            <img src="${import.meta.env.BASE_URL}${hero.image}" width="1600" height="640" alt="Иллюстрация тентованной Газели" fetchpriority="high">
            <figcaption><span>Тентованные Газели</span><span>Иллюстрация</span></figcaption>
          </figure>
          ${renderCalculator()}
        </div>
        <ul class="hero__facts" aria-label="О компании">
          <li><b>3 года</b><span>работаем в Перми</span></li>
          <li><b>2 машины</b><span>с кузовами 4 и 6,2 м</span></li>
          <li><b>2 грузчика</b><span>по запросу</span></li>
        </ul>
      </div>
    </section>`;
}
