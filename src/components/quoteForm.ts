import { cta, eyebrows, quoteForm } from '../content';
import { button, card, sectionHead } from './ui';

type FieldName = 'from' | 'to' | 'weight' | 'volume' | 'date' | 'phone';

const { fields, errors } = quoteForm;

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function field(name: FieldName, label: string, attrs: string, wide = false): string {
  return `
    <div class="field${wide ? ' field--wide' : ''}">
      <label class="label field__label" for="quote-${name}">${label}</label>
      <input class="input" id="quote-${name}" name="${name}" ${attrs} aria-describedby="quote-${name}-error" />
      <p class="field__error" id="quote-${name}-error" role="alert"></p>
    </div>`;
}

export function renderQuoteForm(): string {
  const formHtml = `
    <form class="quote__form" novalidate data-quote-form>
      ${field('from', fields.from.label, `type="text" autocomplete="street-address" placeholder="${fields.from.placeholder}" required`, true)}
      ${field('to', fields.to.label, `type="text" autocomplete="off" placeholder="${fields.to.placeholder}" required`, true)}
      ${field('weight', fields.weight.label, `type="text" inputmode="decimal" placeholder="${fields.weight.placeholder}" required`)}
      ${field('volume', fields.volume.label, `type="text" inputmode="decimal" placeholder="${fields.volume.placeholder}" required`)}
      ${field('date', fields.date.label, `type="date" min="${todayIso()}" required`)}
      ${field('phone', fields.phone.label, `type="tel" inputmode="tel" autocomplete="tel" placeholder="${fields.phone.placeholder}" required`)}
      <div class="field field--wide quote__submit">
        ${button({ label: cta.send, type: 'submit', block: true })}
        <p class="label quote__consent">${quoteForm.consent}</p>
      </div>
    </form>
    <div class="quote__done" data-quote-done role="status" hidden>
      <p class="quote__thanks" tabindex="-1">${quoteForm.success}</p>
      ${button({ label: quoteForm.again, variant: 'ghost', className: 'js-quote-again' })}
    </div>`;

  return `
    <section class="section" id="quote" aria-labelledby="quote-title">
      <div class="container grid grid--12 quote">
        <div class="span quote__side" style="--span: 5">
          ${sectionHead(eyebrows.quote, quoteForm.title, 'quote-title')}
          <p class="lead">${quoteForm.lead}</p>
        </div>
        <div class="span" style="--span: 7">
          ${card(formHtml, { className: 'quote__card' })}
        </div>
      </div>
    </section>`;
}

function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return '';
  const p = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)];
  let out = `+7 (${p[0]}`;
  if (p[0].length === 3) out += ')';
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
}

function isPositive(value: string): boolean {
  const n = Number(value.trim().replace(',', '.'));
  return value.trim() !== '' && Number.isFinite(n) && n > 0;
}

function validate(name: FieldName, value: string): string {
  const v = value.trim();
  switch (name) {
    case 'from':
    case 'to':
      return v ? '' : errors.required;
    case 'weight':
    case 'volume':
      if (!v) return errors.required;
      return isPositive(v) ? '' : errors.number;
    case 'date':
      if (!v) return errors.required;
      return v >= todayIso() ? '' : errors.date;
    case 'phone':
      if (!v) return errors.required;
      return v.replace(/\D/g, '').length === 11 ? '' : errors.phone;
  }
}

export function initQuoteForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-quote-form]');
  const done = document.querySelector<HTMLElement>('[data-quote-done]');
  if (!form || !done) return;

  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('.input'));

  const check = (input: HTMLInputElement): boolean => {
    const message = validate(input.name as FieldName, input.value);
    const error = form.querySelector<HTMLElement>(`#${input.id}-error`);
    if (error) error.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  };

  inputs.forEach((input) => {
    input.addEventListener('blur', () => {
      if (input.value || input.getAttribute('aria-invalid') === 'true') check(input);
    });
    input.addEventListener('input', () => {
      if (input.name === 'phone') input.value = formatPhone(input.value);
      if (input.getAttribute('aria-invalid') === 'true') check(input);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalid = inputs.filter((input) => !check(input));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    // Отправки на сервер нет: только сообщение об успехе
    form.hidden = true;
    done.hidden = false;
    done.querySelector<HTMLElement>('.quote__thanks')?.focus();
  });

  done.querySelector('.js-quote-again')?.addEventListener('click', () => {
    form.reset();
    inputs.forEach((input) => {
      input.setAttribute('aria-invalid', 'false');
      const error = form.querySelector<HTMLElement>(`#${input.id}-error`);
      if (error) error.textContent = '';
    });
    done.hidden = true;
    form.hidden = false;
    inputs[0].focus();
  });
}
