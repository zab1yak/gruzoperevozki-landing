import { eyebrows, faq, reviews } from '../content';
import { card, sectionHead } from './ui';

function stars(count: number): string {
  const on = '★'.repeat(count);
  const off = '★'.repeat(5 - count);
  return `<span class="stars" role="img" aria-label="Оценка ${count} из 5"><span class="stars__on">${on}</span><span class="stars__off">${off}</span></span>`;
}

function avatar(initials: string, extra = ''): string {
  return `<span class="avatar ${extra}" aria-hidden="true">${initials}</span>`;
}

export function renderReviews(): string {
  const cards = reviews.items
    .map((item) =>
      card(
        `<header class="review__head">
             ${avatar(item.initials)}
             <div>
               <p class="review__name">${item.name}</p>
               <p class="label">${item.date}</p>
             </div>
             ${stars(item.stars)}
           </header>
           <p class="review__text">${item.text}</p>`,
        { className: 'review' },
      ),
    )
    .join('');

  const avatars = reviews.items
    .map((item, index) => avatar(item.initials, `avatar--stack avatar--${index % 4}`))
    .join('');

  return `
    <section class="section" id="reviews" aria-labelledby="reviews-title">
      <div class="container">
        <div class="reviews__head">
          ${sectionHead(eyebrows.reviews, reviews.title, 'reviews-title')}
          <div class="rating">
            <span class="stat-value rating__value">${reviews.rating.value}</span>
            <div class="rating__meta">
              ${stars(5)}
              <div class="rating__avatars">${avatars}</div>
              <p class="label">${reviews.rating.label}</p>
            </div>
          </div>
        </div>
        <div class="grid grid--2 reviews__grid">${cards}</div>

        <aside class="guarantee plate plate--accent" aria-label="${reviews.guarantee.title}">
          <h3 class="guarantee__title">${reviews.guarantee.title}</h3>
          <p class="guarantee__text">${reviews.guarantee.text}</p>
        </aside>
      </div>
    </section>`;
}

export function renderFaq(): string {
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
    <section class="section" id="faq" aria-labelledby="faq-title">
      <div class="container grid grid--12 faq">
        <div class="span" style="--span: 5">
          ${sectionHead(eyebrows.faq, faq.title, 'faq-title')}
        </div>
        <ul class="span faq__list" style="--span: 7">${items}</ul>
      </div>
    </section>`;
}

export function initFaq(): void {
  document.querySelectorAll<HTMLButtonElement>('.faq__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.closest('.faq__item')?.classList.toggle('is-open', !open);
    });
  });
}
