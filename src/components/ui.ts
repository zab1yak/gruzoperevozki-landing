import { company } from '../content';

type ButtonOptions = {
  label: string;
  href?: string;
  variant?: 'primary' | 'ghost';
  size?: 'md' | 'sm';
  block?: boolean;
  type?: 'button' | 'submit';
  className?: string;
};

export function button({
  label,
  href,
  variant = 'primary',
  size = 'md',
  block = false,
  type = 'button',
  className = '',
}: ButtonOptions): string {
  const cls = [
    'btn',
    variant === 'ghost' ? 'btn--ghost' : '',
    size === 'sm' ? 'btn--sm' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return href
    ? `<a class="${cls}" href="${href}">${label}</a>`
    : `<button class="${cls}" type="${type}">${label}</button>`;
}

export function card(content: string, options: { href?: string; className?: string } = {}): string {
  const cls = `card${options.href ? ' card--link' : ''} ${options.className ?? ''}`.trim();
  return options.href
    ? `<a class="${cls}" href="${options.href}">${content}</a>`
    : `<article class="${cls}">${content}</article>`;
}

export function brand(): string {
  return `<a class="logo" href="#top" aria-label="${company.name}, на главную">
    <img src="${import.meta.env.BASE_URL}favicon.svg" width="40" height="32" alt="">
    <span class="logo__text">${company.name}</span>
  </a>`;
}
