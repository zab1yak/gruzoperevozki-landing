import { eyebrows, fleet } from '../content';
import { card, photo, sectionHead, tag } from './ui';

export function renderFleet(): string {
  const cards = fleet.items
    .map((item) =>
      card(
        `${photo(item.imageCaption, 'fleet__photo')}
           <h3>${item.name}</h3>
           <dl class="fleet__specs">
             <div>
               <dd class="stat-value">${item.capacityT}</dd>
               <dt class="label">${fleet.labels.capacity}</dt>
             </div>
             <div>
               <dd class="stat-value">${item.volumeM3}</dd>
               <dt class="label">${fleet.labels.volume}</dt>
             </div>
           </dl>
           <p class="fleet__body">${item.body}</p>
           <div class="fleet__price">${tag(item.price, true)}</div>`,
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
