import { services } from '../content';
import { card } from './ui';

export function renderServices(): string {
  const cards = services.items
    .map((item) => card(`<h3>${item.title}</h3><p>${item.text}</p>`, { className: 'service' }))
    .join('');
  return `<section class="section section--light" id="services" aria-labelledby="services-title">
    <div class="container services"><h2 id="services-title">${services.title}</h2><div class="services__grid">${cards}</div></div>
  </section>`;
}
