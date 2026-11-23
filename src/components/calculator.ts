import { fleet, minHours, rubles } from '../content';

export function renderCalculator(): string {
  return `<section id="calculator" class="calculator section--light" aria-labelledby="calc-title">
    <h2 id="calc-title">Расчёт стоимости</h2>
    <fieldset class="route-switch"><legend class="visually-hidden">Тип перевозки</legend>
      <label><input type="radio" name="route" value="city" checked><span>По Перми</span></label>
      <label><input type="radio" name="route" value="road"><span>Межгород</span></label>
    </fieldset>
    <div class="calc__fields">
      <label>Машина<select id="calc-truck" class="input input--select">${fleet.items.map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}</select></label>
      <label><span id="calc-unit">Часы (от 2)</span><input class="input" id="calc-amount" type="number" inputmode="decimal" min="${minHours}" step="any" value="${minHours}" aria-describedby="calc-note"></label>
    </div>
    <div class="calc__result"><span>Ориентир за машину</span><output id="calc-price" for="calc-truck calc-amount" aria-live="polite">${rubles(fleet.items[0].hourly * minHours)}</output></div>
    <p id="calc-note" class="calc__note"></p>
    <a class="btn" id="calc-order" href="#quote">Выбрать машину</a>
  </section>`;
}

export function initCalculator(): void {
  const truck = document.querySelector<HTMLSelectElement>('#calc-truck')!;
  const amount = document.querySelector<HTMLInputElement>('#calc-amount')!;
  const price = document.querySelector<HTMLOutputElement>('#calc-price')!;
  const note = document.querySelector<HTMLElement>('#calc-note')!;
  const unit = document.querySelector<HTMLElement>('#calc-unit')!;
  const order = document.querySelector<HTMLAnchorElement>('#calc-order')!;
  const choices = document.querySelectorAll<HTMLInputElement>('[name="route"]');
  const values = { city: String(minHours), road: '' };
  let mode: keyof typeof values = 'city';

  const update = () => {
    const vehicle = fleet.items.find((item) => item.id === truck.value)!;
    const city = mode === 'city';
    const rate = city ? vehicle.hourly : vehicle.perKm;
    const total = amount.valueAsNumber * rate;
    const valid =
      amount.value !== '' &&
      amount.validity.valid &&
      total > 0 &&
      Number.isFinite(total) &&
      total <= Number.MAX_SAFE_INTEGER;
    values[mode] = amount.value;
    amount.setAttribute(
      'aria-invalid',
      String(!valid && (amount.value !== '' || amount.validity.badInput)),
    );
    price.value = valid ? rubles(total) : '—';
    note.textContent = valid
      ? city
        ? `${rubles(rate)}/ч · от ${minHours} часов. Грузчики отдельно.`
        : `${rubles(rate)}/км за указанный путь. Подачу, обратную дорогу и итог уточните по телефону.`
      : city
        ? `Укажите время от ${minHours} часов.`
        : 'Укажите расстояние в километрах больше нуля.';
    order.dataset.vehicle = vehicle.id;
  };
  choices.forEach((choice) =>
    choice.addEventListener('change', () => {
      mode = choice.value === 'road' ? 'road' : 'city';
      unit.textContent = mode === 'city' ? 'Часы (от 2)' : 'Расстояние, км';
      amount.min = mode === 'city' ? String(minHours) : '0';
      amount.value = values[mode];
      update();
    }),
  );
  truck.addEventListener('change', update);
  amount.addEventListener('input', update);
  update();
}
