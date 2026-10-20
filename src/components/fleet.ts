import { eyebrows, fleet } from '../content';
import { card, photo, plate, sectionHead } from './ui';

export function renderFleet(): string {
  const cards = fleet.items
    .map((item) =>
      card(
        `${photo(item.image, 'fleet__photo', '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw')}
           <h3>${item.name}</h3>
           <dl class="fleet__specs">
             <div>
               <dt class="label">${fleet.labels.capacity}</dt>
               <dd class="stat-value">${item.capacityT}</dd>
             </div>
             <div>
               <dt class="label">${fleet.labels.volume}</dt>
               <dd class="stat-value">${item.volumeM3}</dd>
             </div>
           </dl>
           <p class="fleet__body">${item.body}</p>
           <div class="fleet__price">${plate(item.price)}</div>`,
        { className: 'fleet__card' },
      ),
    )
    .join('');
  return `
    <section class="section" id="fleet" aria-labelledby="fleet-title">
      <div class="container">
        <div class="fleet__head">
          ${sectionHead(eyebrows.fleet, fleet.title, 'fleet-title')}
          <p class="lead fleet__note">${fleet.note}</p>
        </div>
        <div class="grid grid--4 fleet__grid">${cards}</div>
      </div>
    </section>`;
}
