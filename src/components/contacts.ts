import { company, contacts, cta, eyebrows, footer, nav } from '../content';
import { button, photo, sectionHead } from './ui';

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
        <div class="span contacts__info" style="--span: 5">
          ${sectionHead(eyebrows.contacts, contacts.title, 'contacts-title')}
          <dl class="contacts__list">
            <div>
              <dt class="label">${contacts.labels.phone}</dt>
              <dd><a class="contacts__phone stat-value" href="${company.phoneHref}">${company.phone}</a></dd>
            </div>
            <div>
              <dt class="label">${contacts.labels.address}</dt>
              <dd>${company.address}<br /><span class="contacts__note">${company.addressNote}</span></dd>
            </div>
            <div>
              <dt class="label">${contacts.labels.hours}</dt>
              <dd><ul class="hours">${hours}</ul></dd>
            </div>
            <div>
              <dt class="label">${contacts.labels.email}</dt>
              <dd><a class="contacts__link" href="mailto:${company.email}">${company.email}</a></dd>
            </div>
          </dl>
          <div class="contacts__actions">
            ${button({ label: cta.quote, href: '#quote' })}
          </div>
        </div>
        <div class="span" style="--span: 7">
          ${photo(contacts.mapCaption, 'contacts__map photo--map')}
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
