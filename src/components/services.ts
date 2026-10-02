import { eyebrows, services } from '../content';
import { card, photo, plate, sectionHead } from './ui';

export function renderServices(): string {
  const cards = services.items
    .map((item, index) =>
      card(
        `<span class="label">${String(index + 1).padStart(2, '0')}</span>
           <h3>${item.title}</h3>
           <p class="service__text">${item.text}</p>
           ${plate(item.price)}`,
        { className: 'service' },
      ),
    )
    .join('');
  return `
    <section class="section" id="services" aria-labelledby="services-title">
      <div class="container grid grid--12 services">
        <div class="span services__side" style="--span: 4">
          ${sectionHead(eyebrows.services, services.title, 'services-title')}
          ${photo(services.imageCaption, 'services__photo')}
        </div>
        <div class="span grid grid--2 services__grid" style="--span: 8">${cards}</div>
      </div>
    </section>`;
}
