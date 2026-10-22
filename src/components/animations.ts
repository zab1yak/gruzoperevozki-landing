/**
 * Появление блоков при скролле. Классы вешает JS, поэтому без скриптов
 * и при prefers-reduced-motion контент просто виден.
 */
const TARGETS = [
  '.section__head',
  '.fleet__note',
  '.card',
  '.photo',
  '.step',
  '.faq__item',
  '.guarantee',
  '.rating',
].join(',');

const HERO_TARGETS = '.hero__main > *, .quote-card';
const STAGGER = 0.08;
const STAGGER_MAX = 5;

function setDelays(elements: HTMLElement[]): void {
  const counters = new Map<Element, number>();
  elements.forEach((el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const index = counters.get(parent) ?? 0;
    counters.set(parent, index + 1);
    el.style.setProperty('--reveal-delay', `${Math.min(index, STAGGER_MAX) * STAGGER}s`);
  });
}

export function initAnimations(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  const hero = Array.from(document.querySelectorAll<HTMLElement>(HERO_TARGETS));
  // Первый экран анимируется отдельно, поэтому его блоки исключаем
  const blocks = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter(
    (el) => !el.closest('.hero'),
  );
  setDelays(hero);
  setDelays(blocks);

  [...hero, ...blocks].forEach((el) => el.classList.add('reveal'));

  // Первый экран анимируется сразу после загрузки
  requestAnimationFrame(() => {
    requestAnimationFrame(() => hero.forEach((el) => el.classList.add('is-in')));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  blocks.forEach((el) => observer.observe(el));

  // Внизу страницы показываем всё, что осталось: последние блоки могут не попасть в зону наблюдателя
  const revealRest = () => {
    if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 2) return;
    blocks.forEach((el) => el.classList.add('is-in'));
    window.removeEventListener('scroll', revealRest);
  };
  window.addEventListener('scroll', revealRest, { passive: true });
}
