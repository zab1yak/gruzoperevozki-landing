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

export function tag(label: string, accent = false): string {
  return `<span class="tag${accent ? ' tag--accent' : ''}">${label}</span>`;
}

export function card(content: string, options: { href?: string; className?: string } = {}): string {
  const cls = `card${options.href ? ' card--link' : ''} ${options.className ?? ''}`.trim();
  return options.href
    ? `<a class="${cls}" href="${options.href}">${content}</a>`
    : `<article class="${cls}">${content}</article>`;
}

export function plate(content: string, accent = false): string {
  return `<div class="plate${accent ? ' plate--accent' : ''}">${content}</div>`;
}

export function photo(caption: string, className = ''): string {
  return `<figure class="photo ${className}" role="img" aria-label="${caption}"><figcaption class="photo__caption">${caption}</figcaption></figure>`;
}

export function sectionHead(eyebrow: string, title: string, id: string): string {
  return `<div class="section__head"><p class="label">${eyebrow}</p><h2 id="${id}">${title}</h2></div>`;
}
