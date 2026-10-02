import { company, cta, nav } from '../content';
import { button } from './ui';

const logoMark = `<svg class="logo__mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M0 0h22l10 10v22H10L0 22z" fill="currentColor"/></svg>`;

export function renderHeader(): string {
  const links = nav.map((item) => `<a class="nav__link" href="${item.href}">${item.label}</a>`);
  return `
    <header class="header" data-header>
      <div class="container header__inner">
        <a class="logo" href="#top" aria-label="${company.name}, на главную">
          ${logoMark}
          <span class="logo__text">Груз<span class="logo__accent">59</span></span>
        </a>

        <div class="header__info">
          <span>${company.address}</span>
          <span class="header__hours">${company.hoursCompact}</span>
        </div>

        <nav class="nav" aria-label="Основное меню">${links.join('')}</nav>

        <a class="header__phone" href="${company.phoneHref}">${company.phone}</a>
        ${button({ label: cta.quote, href: '#quote', size: 'sm', className: 'header__cta' })}

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
          <a class="mobile-menu__phone" href="${company.phoneHref}">${company.phone}</a>
          <p class="label">${company.address}<br />${company.hoursCompact}</p>
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
    if (open) {
      menu.hidden = false;
      // кадр на смену display, чтобы сработал transition
      requestAnimationFrame(() => menu.classList.add('is-visible'));
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
  window.matchMedia('(min-width: 1121px)').addEventListener('change', (event) => {
    if (event.matches && header.classList.contains('is-open')) setOpen(false);
  });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
