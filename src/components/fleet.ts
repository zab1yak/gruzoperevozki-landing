import { fleet, minHours, rubles } from '../content';
import { card } from './ui';

export function renderFleet(): string {
  const cards = fleet.items
    .map((t) =>
      card(
        `
    <img class="fleet__photo" alt="Иллюстрация модели с тентованным кузовом" src="${import.meta.env.BASE_URL}${t.image}" loading="lazy" decoding="async" width="800" height="320">
    <div class="fleet__details"><h3>${t.name}</h3>
      <dl class="fleet__specs">
        <div><dt>Кузов под тентом</dt><dd>${t.dimensions}</dd></div>
        <div><dt>Грузоподъёмность</dt><dd>${t.capacity}</dd></div>
        <div><dt>Загрузка</dt><dd>${t.loading}</dd></div>
      </dl>
      <div class="fleet__rates"><p><strong>${rubles(t.hourly)}</strong> / ч</p><p><strong>${rubles(t.perKm)}</strong> / км</p></div>
      <a class="btn btn--ghost" href="#quote" data-vehicle="${t.id}">Заказать Газель ${t.id === 'short' ? '4' : '6,2'} м</a>
    </div>`,
        { className: 'fleet__card' },
      ),
    )
    .join('');
  return `<section class="section" id="fleet" aria-labelledby="fleet-title"><div class="container">
    <div class="fleet__head"><h2 id="fleet-title">${fleet.title}</h2>
      <p>По городу — от ${minHours} часов. Для междугороднего рейса согласуем маршрут и итоговую стоимость.</p></div>
    <div class="grid grid--2 fleet__grid">${cards}</div>
    <p class="fleet__caption">На иллюстрациях показаны типы машин.</p>
  </div></section>`;
}
