import { company, fleet, services, workingHours } from '../content';

function field(name: string, title: string, control: string) {
  return `<div class="field"><label class="field__label" for="quote-${name}">${title}</label>${control}
    <p class="field__error" id="quote-${name}-error"></p></div>`;
}

function input(name: string, label: string, attrs: string) {
  return field(
    name,
    label,
    `<input class="input" id="quote-${name}" name="${name}" required aria-describedby="quote-${name}-error" ${attrs}>`,
  );
}

const permClock = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Yekaterinburg',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function renderQuoteCard(): string {
  return `<section class="section" id="quote" aria-labelledby="quote-title"><div class="container quote-layout">
    <div class="quote-intro"><h2 id="quote-title">Детали поездки</h2>
      <p class="lead">Подготовьте маршрут для разговора с перевозчиком. Данные останутся в этом окне.</p>
      <p>Заказать машину можно по телефону.</p>
      ${company.contacts.map((c) => `<a class="quote-phone" href="${c.href}">${c.name} · ${c.phone}</a>`).join('')}</div>
    <div class="card quote-card">
      <form class="quote__form" data-quote-form novalidate aria-labelledby="quote-title">
        ${input('name', 'Ваше имя', 'type="text" autocomplete="given-name" maxlength="80" placeholder="Имя"')}
        ${input('phone', 'Телефон', 'type="tel" autocomplete="tel" inputmode="tel" maxlength="30" placeholder="+7 (___) ___-__-__"')}
        ${input('from', 'Адрес загрузки', 'type="text" maxlength="240" placeholder="Город, улица, дом"')}
        ${input('to', 'Адрес доставки', 'type="text" maxlength="240" placeholder="Город, улица, дом"')}
        ${input('date', 'Дата подачи', `type="date" min="${permClock.format(new Date()).slice(0, 10)}"`)}
        ${input('time', `Время в Перми (${workingHours.open}–${workingHours.close})`, `type="time" min="${workingHours.open}" max="${workingHours.close}"`)}
        ${field('vehicle', 'Машина', `<select class="input input--select" id="quote-vehicle" name="vehicle" aria-describedby="quote-vehicle-error"><option value="">Помогите выбрать</option>${fleet.items.map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}</select>`)}
        ${field('service', 'Услуга', `<select class="input input--select" id="quote-service" name="service"><option value="">Уточню по телефону</option>${services.items.map((s) => `<option>${s.title}</option>`).join('')}</select>`)}
        <div class="field field--wide"><label class="field__label" for="quote-comment">О грузе <span>(по желанию)</span></label>
          <textarea class="input" id="quote-comment" name="comment" rows="2" maxlength="1000" placeholder="Что везём, вес и особенности погрузки"></textarea></div>
        <div class="quote__submit"><label class="loaders"><input type="checkbox" name="loaders"> Нужны грузчики</label><button type="submit" class="btn">Подготовить детали</button></div>
      </form>
      <div class="quote__done" data-quote-done hidden>
        <h3 tabindex="-1">Детали для звонка</h3><p>Заказ оформляется по телефону. Текст можно скопировать.</p>
        <label class="visually-hidden" for="trip-text">Подготовленные детали поездки</label>
        <textarea id="trip-text" class="input" readonly rows="8"></textarea>
        <div class="quote__actions"><button class="btn" type="button" data-copy>Скопировать</button>
          <button class="btn btn--ghost" type="button" data-edit>Изменить</button></div>
        <p role="status" data-copy-status></p>
        ${company.contacts.map((c) => `<a class="quote-phone" href="${c.href}">${c.name} · ${c.phone}</a>`).join('')}
      </div>
    </div></div></section>`;
}

export function initQuoteForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-quote-form]')!;
  const done = document.querySelector<HTMLElement>('[data-quote-done]')!;
  const summary = done.querySelector<HTMLTextAreaElement>('#trip-text')!;
  const copyStatus = done.querySelector<HTMLElement>('[data-copy-status]')!;
  const required = Array.from(form.querySelectorAll<HTMLInputElement>('input[required]'));
  const date = form.querySelector<HTMLInputElement>('[name=date]')!;
  const time = form.querySelector<HTMLInputElement>('[name=time]')!;
  const vehicle = form.querySelector<HTMLSelectElement>('[name=vehicle]')!;

  function validate(control: HTMLInputElement) {
    const value = control.value.trim();
    const now = permClock.format(new Date());
    date.min = now.slice(0, 10);
    if (!value) return 'Заполните поле.';
    switch (control.name) {
      case 'name':
        return /\p{L}/u.test(value) ? '' : 'Укажите ваше имя.';
      case 'phone':
        return /^[+\d\s()-]+$/.test(value) &&
          /^(?:\+7|8|7)\d{10}$/.test(value.replace(/[\s()-]/g, ''))
          ? ''
          : 'Введите номер с +7 или 8 и ещё 10 цифр.';
      case 'from':
      case 'to':
        return value.length >= 3 && /\p{L}/u.test(value)
          ? ''
          : 'Уточните адрес, укажите город или улицу.';
      case 'date':
        return value < date.min ? 'Выберите сегодняшнюю или будущую дату.' : '';
      case 'time':
        if (value < workingHours.open || value > workingHours.close) {
          return `Выберите время подачи с ${workingHours.open} до ${workingHours.close} по Перми.`;
        }
        return date.value === date.min && value < now.slice(-5)
          ? 'Это время в Перми уже прошло.'
          : '';
      default:
        return '';
    }
  }
  function check(control: HTMLInputElement) {
    const error = validate(control);
    form.querySelector<HTMLElement>(`#${control.id}-error`)!.textContent = error;
    control.setAttribute('aria-invalid', String(Boolean(error)));
    return !error;
  }
  required.forEach((control) => {
    control.addEventListener('blur', () => {
      if (control.value) check(control);
    });
    control.addEventListener('input', () => {
      if (control.getAttribute('aria-invalid') === 'true') check(control);
    });
  });
  date.addEventListener('change', () => {
    if (time.value) check(time);
  });
  function edit() {
    done.hidden = true;
    form.hidden = false;
    copyStatus.textContent = '';
  }
  document.addEventListener('click', (event) => {
    const link =
      event.target instanceof Element && event.target.closest<HTMLAnchorElement>('a[data-vehicle]');
    if (link) {
      edit();
      vehicle.value = link.dataset.vehicle ?? '';
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalid = required.filter((control) => !check(control));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    const data = new FormData(form);
    const read = (name: string) => String(data.get(name) ?? '').trim();
    const vehicleName = vehicle.selectedOptions[0].text;
    const dateRu = date.value.split('-').reverse().join('.');
    summary.value = [
      `Имя: ${read('name')}`,
      `Телефон: ${read('phone')}`,
      `Загрузка: ${read('from')}`,
      `Доставка: ${read('to')}`,
      `Подача: ${dateRu} в ${time.value} (Пермь)`,
      `Машина: ${vehicleName}`,
      `Грузчики: ${data.has('loaders') ? 'нужны' : 'не требуются'}`,
      read('service') && `Услуга: ${read('service')}`,
      read('comment') && `О грузе: ${read('comment')}`,
    ]
      .filter(Boolean)
      .join('\n');
    form.hidden = true;
    done.hidden = false;
    done.querySelector('h3')!.focus();
  });
  done.querySelector('[data-edit]')!.addEventListener('click', () => {
    edit();
    required[0].focus();
  });
  done.querySelector('[data-copy]')!.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summary.value);
      copyStatus.textContent = 'Детали скопированы.';
    } catch {
      summary.focus();
      summary.select();
      copyStatus.textContent = 'Текст выделен. Выберите «Копировать» в меню устройства.';
    }
  });
}
