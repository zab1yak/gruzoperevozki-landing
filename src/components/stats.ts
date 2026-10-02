import { stats } from '../content';

export function renderStats(): string {
  const items = stats
    .map(
      (item, index) => `
        <li class="stat${index === 0 ? ' stat--lead' : ''}">
          <span class="stat-value">${item.value}</span>
          <span class="label">${item.label}</span>
        </li>`,
    )
    .join('');
  return `
    <section class="stats" id="stats" aria-label="Компания в цифрах">
      <div class="container">
        <ul class="grid grid--4 grid--gap-hero stats__list">${items}</ul>
      </div>
    </section>`;
}
