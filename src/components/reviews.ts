import { company, faq } from '../content';
import { button } from './ui';

export function renderFaq(): string {
  const contact = company.contacts[0];
  const items = faq.items
    .map(
      (item, index) => `
        <li class="faq__item">
          <h3 class="faq__q">
            <button class="faq__btn" type="button" aria-expanded="false" aria-controls="faq-a-${index}" id="faq-q-${index}">
              <span>${item.q}</span>
              <span class="faq__icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div class="faq__panel" id="faq-a-${index}" role="region" aria-labelledby="faq-q-${index}">
            <div class="faq__panel-inner"><p>${item.a}</p></div>
          </div>
        </li>`,
    )
    .join('');
  return `
    <section class="section section--light" id="faq" aria-labelledby="faq-title">
      <div class="container grid grid--12 faq">
        <div class="span" style="--span: 5">
          <h2 class="section__head" id="faq-title">${faq.title}</h2>
          <div class="faq__help">
            <p>${faq.help}</p>
            ${button({ label: `${contact.phone} · ${contact.name}`, href: contact.href, variant: 'ghost' })}
          </div>
        </div>
        <ul class="span faq__list" style="--span: 7">${items}</ul>
      </div>
    </section>`;
}

export function initFaq(): void {
  document.querySelectorAll<HTMLButtonElement>('.faq__btn').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls') ?? '');
    // Свёрнутый ответ скрыт только высотой, поэтому выключаем его и для скринридера
    if (panel) panel.inert = true;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.closest('.faq__item')?.classList.toggle('is-open', !open);
      if (panel) panel.inert = open;
    });
  });
}
