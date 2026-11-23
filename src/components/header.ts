import { company, cta, nav } from '../content';
import { brand, button } from './ui';

export function renderHeader(): string {
  const links = nav.map((item) => `<a class="nav__link" href="${item.href}">${item.label}</a>`);
  return `
    <header class="header" data-header>
      <div class="container header__inner">
        ${brand()}

        <nav class="nav" aria-label="Основное меню">${links.join('')}</nav>

        <a class="header__phone" href="${company.contacts[0].href}">${company.contacts[0].phone}</a>
        ${button({ label: cta.quote, href: '#quote', size: 'sm', className: 'header__cta' })}

        <a class="header__call" href="${company.contacts[0].href}" aria-label="Позвонить: ${company.contacts[0].phone}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>
        </a>

        <button
          class="burger"
          type="button"
          aria-expanded="false"
          aria-controls="mobile-menu"
          aria-label="Открыть меню"
          data-burger
        >
          <span class="burger__line"></span>
          <span class="burger__line"></span>
        </button>
      </div>

      <div class="mobile-menu" id="mobile-menu" data-menu hidden>
        <nav class="mobile-menu__nav" aria-label="Мобильное меню">
          ${nav.map((item) => `<a class="mobile-menu__link" href="${item.href}">${item.label}</a>`).join('')}
        </nav>
        <div class="mobile-menu__foot">
          <a class="mobile-menu__phone" href="${company.contacts[0].href}">${company.contacts[0].phone}</a>
          <p class="label">Пермь · Круглосуточно</p>
          ${button({ label: cta.quote, href: '#quote', block: true })}
        </div>
      </div>
    </header>`;
}

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!header || !burger || !menu) return;

  const setOpen = (open: boolean) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
    document.querySelector('main')!.inert = open;
    document.querySelector('footer')!.inert = open;
    menu.inert = !open;
    if (open) {
      menu.hidden = false;
      // кадр на смену display, чтобы сработал transition
      requestAnimationFrame(() => {
        if (header.classList.contains('is-open')) menu.classList.add('is-visible');
      });
    } else {
      menu.classList.remove('is-visible');
      const hide = () => {
        if (!header.classList.contains('is-open')) menu.hidden = true;
      };
      menu.addEventListener('transitionend', hide, { once: true });
      window.setTimeout(hide, 600);
    }
  };

  burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
      setOpen(false);
      burger.focus();
    }
  });
  window.matchMedia('(min-width: 1280px)').addEventListener('change', (event) => {
    if (event.matches && header.classList.contains('is-open')) setOpen(false);
  });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
