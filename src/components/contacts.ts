import { company, dailySchedule, nav } from '../content';
import { brand } from './ui';

// Центр города, без метки склада или офиса.
const view = 'll=56.2294%2C58.0105&z=10';
const mapsUrl = `https://yandex.ru/maps/50/perm/?${view}`;

export function renderContacts(): string {
  return `<section class="section" id="contacts" aria-labelledby="contacts-title">
    <div class="container grid grid--12 contacts">
      <div class="span contacts__head" style="--span:12"><h2 id="contacts-title">Связаться с нами</h2></div>
      <div class="span contacts__info" style="--span:5"><address class="card address">
        <p>${dailySchedule} по пермскому времени</p>
        ${company.contacts.map((c) => `<div class="address__item"><span>${c.name}</span><a class="address__phone" href="${c.href}">${c.phone}</a></div>`).join('')}
        <p>Пермь, Пермский край и междугородние рейсы по России. Машину подаём по согласованному адресу.</p>
      </address></div>
      <div class="span contacts__map-wrap" style="--span:7">
        <div class="contacts__map" data-map><button type="button" class="btn btn--ghost" data-open-map>Показать интерактивную карту</button></div>
        <a class="map-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">Открыть Пермь в Яндекс Картах</a>
      </div>
    </div></section>`;
}

export function initMap(): void {
  const host = document.querySelector<HTMLElement>('[data-map]')!;
  const button = host.querySelector('button')!;
  function loadMap() {
    if (!button.isConnected) return;
    const frame = document.createElement('iframe');
    frame.className = 'contacts__frame';
    frame.title = 'Интерактивная карта Перми и окрестностей';
    frame.src = `https://yandex.ru/map-widget/v1/?${view}`;
    frame.allowFullscreen = true;
    const status = document.createElement('p');
    status.className = 'map-status';
    status.role = 'status';
    status.textContent = 'Загружаем карту…';
    host.replaceChildren(status, frame);
    const timer = window.setTimeout(() => {
      status.textContent = 'Если карта недоступна, откройте её по ссылке ниже.';
    }, 9000);
    frame.addEventListener(
      'load',
      () => {
        clearTimeout(timer);
        status.remove();
      },
      { once: true },
    );
    frame.addEventListener(
      'error',
      () => {
        clearTimeout(timer);
        frame.remove();
        status.textContent = 'Не удалось загрузить карту. Откройте её по ссылке ниже.';
      },
      { once: true },
    );
  }
  button.addEventListener('click', loadMap, { once: true });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadMap();
      }
    });
    observer.observe(host);
  }
}

export function renderFooter(): string {
  return `<footer class="footer"><div class="container footer__top">
    ${brand()}<nav class="footer__nav" aria-label="Меню в подвале">${nav.map((n) => `<a class="footer__link" href="${n.href}">${n.label}</a>`).join('')}</nav>
    <span>© ${new Date().getFullYear()} ${company.name}</span>
  </div></footer>`;
}
