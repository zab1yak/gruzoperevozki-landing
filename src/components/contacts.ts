import { company, contacts, cta, eyebrows, footer, nav } from '../content';
import { button, sectionHead } from './ui';

/** Маршрут до адреса в Яндекс Картах: точку старта карты определят сами (открывается в новой вкладке). */
export function yandexRouteUrl(address: string): string {
  return `https://yandex.ru/maps/?rtext=~${encodeURIComponent(address)}&rtt=auto`;
}

/**
 * Виджет Яндекс Карт без ключа и скриптов на нашей странице: iframe с меткой по координатам.
 * Режим с меткой, а не поиск: у поиска на широком экране внизу висит пустая панель результатов.
 */
export function yandexMapWidgetUrl({ lat, lon }: { lat: number; lon: number }): string {
  const point = `${lon},${lat}`;
  return `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(point)}&z=16&pt=${encodeURIComponent(`${point},pm2ylm`)}`;
}

export function renderContacts(): string {
  const hours = company.hours
    .map(
      (row) => `
        <li class="hours__row">
          <span class="label">${row.days}</span>
          <span class="stat-value">${row.time}</span>
        </li>`,
    )
    .join('');

  return `
    <section class="section" id="contacts" aria-labelledby="contacts-title">
      <div class="container grid grid--12 contacts">
        <div class="span contacts__head" style="--span: 12">
          ${sectionHead(eyebrows.contacts, contacts.title, 'contacts-title')}
        </div>
        <div class="span contacts__info" style="--span: 5">
          <address class="card address">
            <div class="address__item">
              <p class="label">${contacts.labels.address}</p>
              <p class="address__street">${company.address}</p>
              <p class="address__note">${company.addressNote}</p>
            </div>
            <div class="address__item">
              <p class="label">${contacts.labels.hours}</p>
              <ul class="hours">${hours}</ul>
            </div>
            <div class="address__item">
              <p class="label">${contacts.labels.phone}</p>
              <a class="address__phone" href="${company.phoneHref}">${company.phone}</a>
              <a class="contacts__link" href="mailto:${company.email}">${company.email}</a>
            </div>
            <div class="address__actions">
              ${button({ label: cta.quote, href: '#quote' })}
              <a
                class="btn btn--ghost"
                href="${yandexRouteUrl(company.address)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${contacts.mapLink}
                <span aria-hidden="true">↗</span>
                <span class="visually-hidden">(${contacts.newTab})</span>
              </a>
            </div>
          </address>
        </div>
        <div class="span contacts__map" style="--span: 7">
          <iframe
            class="contacts__frame"
            src="${yandexMapWidgetUrl(company.coords)}"
            title="${contacts.mapTitle}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </section>`;
}

export function renderFooter(): string {
  const links = nav
    .map((item) => `<a class="footer__link" href="${item.href}">${item.label}</a>`)
    .join('');
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer__top">
          <a class="logo" href="#top" aria-label="${company.name}, наверх">
            <svg class="logo__mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M0 0h22l10 10v22H10L0 22z" fill="currentColor"/></svg>
            <span class="logo__text">Груз<span class="logo__accent">59</span></span>
          </a>
          <nav class="footer__nav" aria-label="Меню в подвале">${links}</nav>
          <a class="footer__phone stat-value" href="${company.phoneHref}">${company.phone}</a>
        </div>
        <p class="footer__bottom label">${footer.copyright} / ${footer.legal}</p>
      </div>
    </footer>`;
}
