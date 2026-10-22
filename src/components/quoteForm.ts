import { cta, quoteForm, services } from '../content';
import { button } from './ui';

type FieldName = 'from' | 'to' | 'cargo' | 'date' | 'time' | 'phone';

const { fields, errors, slots } = quoteForm;

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isWeekend(iso: string): boolean {
  const [y, m, d] = iso.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
}

function field(name: FieldName, label: string, control: string): string {
  return `
    <div class="field">
      <label class="field__label" for="quote-${name}">${label}</label>
      ${control}
      <p class="field__error" id="quote-${name}-error"></p>
    </div>`;
}

function input(name: FieldName, attrs: string): string {
  return `<input class="input" id="quote-${name}" name="${name}" ${attrs} aria-describedby="quote-${name}-error" />`;
}

function select(name: FieldName, placeholder: string, options: string[]): string {
  const items = options.map((o) => `<option value="${o}">${o}</option>`).join('');
  return `
    <select class="input input--select" id="quote-${name}" name="${name}" required aria-describedby="quote-${name}-error">
      <option value="" disabled selected>${placeholder}</option>${items}
    </select>`;
}

/** Карточка заявки для первого экрана. Отправки на сервер пока нет: только проверка и сообщение. */
export function renderQuoteCard(): string {
  const cargo = services.items.map((item) => item.title);
  return `
    <div class="card quote-card" id="quote">
      <h2 class="quote-card__title" id="quote-title">${quoteForm.title}</h2>
      <p class="quote-card__lead">${quoteForm.lead}</p>
      <form class="quote__form" novalidate aria-labelledby="quote-title" data-quote-form>
        ${field('from', fields.from.label, input('from', `type="text" autocomplete="street-address" placeholder="${fields.from.placeholder}" required`))}
        ${field('to', fields.to.label, input('to', `type="text" autocomplete="off" placeholder="${fields.to.placeholder}" required`))}
        ${field('cargo', fields.cargo.label, select('cargo', fields.cargo.placeholder, cargo))}
        ${field('phone', fields.phone.label, input('phone', `type="tel" inputmode="tel" autocomplete="tel" placeholder="${fields.phone.placeholder}" required`))}
        ${field('date', fields.date.label, input('date', `type="date" min="${todayIso()}" required`))}
        ${field('time', fields.time.label, select('time', fields.time.placeholder, slots))}
        <div class="quote__submit">
          ${button({ label: cta.send, type: 'submit', block: true })}
          <p class="quote__consent">${quoteForm.consent}</p>
        </div>
      </form>
      <div class="quote__done" data-quote-done role="status" hidden>
        <p class="quote__thanks" tabindex="-1">${quoteForm.success}</p>
        ${button({ label: quoteForm.again, variant: 'ghost', className: 'js-quote-again' })}
      </div>
    </div>`;
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

/** Окно 20:00–22:00 есть только в будни. */
function lateSlotOnWeekend(form: HTMLFormElement): boolean {
  const date = form.querySelector<HTMLInputElement>('#quote-date')?.value ?? '';
  const time = form.querySelector<HTMLSelectElement>('#quote-time')?.value ?? '';
  if (!date || !time) return false;
  return isWeekend(date) && slots.indexOf(time) > slots.indexOf(quoteForm.weekendLastSlot);
}

function validate(name: FieldName, value: string, form: HTMLFormElement): string {
  const v = value.trim();
  switch (name) {
    case 'from':
    case 'to':
      return v ? '' : errors.required;
    case 'cargo':
      return v ? '' : errors.select;
    case 'date':
      if (!v) return errors.required;
      return v >= todayIso() ? '' : errors.date;
    case 'time':
      if (!v) return errors.select;
      return lateSlotOnWeekend(form) ? errors.weekend : '';
    case 'phone':
      if (!v) return errors.required;
      return v.replace(/\D/g, '').length === 11 ? '' : errors.phone;
  }
}

export function initQuoteForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-quote-form]');
  const done = document.querySelector<HTMLElement>('[data-quote-done]');
  if (!form || !done) return;

  const controls = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('.input'),
  );
  const time = form.querySelector<HTMLSelectElement>('#quote-time');

  const check = (control: HTMLInputElement | HTMLSelectElement): boolean => {
    const message = validate(control.name as FieldName, control.value, form);
    const error = form.querySelector<HTMLElement>(`#${control.id}-error`);
    if (error) error.textContent = message;
    control.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  };

  controls.forEach((control) => {
    control.addEventListener('blur', () => {
      if (control.value || control.getAttribute('aria-invalid') === 'true') check(control);
    });
    control.addEventListener('input', () => {
      if (control.name === 'phone') control.value = formatPhone(control.value);
      if (control.getAttribute('aria-invalid') === 'true') check(control);
    });
    control.addEventListener('change', () => {
      if (control instanceof HTMLSelectElement) check(control);
      // Смена даты может сделать выбранное время недоступным (выходной)
      if (control.name === 'date' && time?.value) check(time);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalid = controls.filter((control) => !check(control));
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
    controls.forEach((control) => {
      control.setAttribute('aria-invalid', 'false');
      const error = form.querySelector<HTMLElement>(`#${control.id}-error`);
      if (error) error.textContent = '';
    });
    done.hidden = true;
    form.hidden = false;
    controls[0].focus();
  });
}
