import assert from 'node:assert/strict';
import { chromium, type Page } from 'playwright';
import { withPreview } from './preview.ts';

async function checkQuote(page: Page) {
  const form = page.locator('[data-quote-form]');
  const submit = form.getByRole('button', { name: 'Подготовить детали' });
  await submit.click();
  assert.equal(await form.locator('[aria-invalid=true]').count(), 6);
  assert.equal(await page.locator(':focus').getAttribute('name'), 'name');
  for (const [name, value] of Object.entries({
    name: 'Анна',
    phone: '1234',
    from: 'Пермь, ул. Ленина, 1',
    to: 'Пермь, ул. Мира, 2',
    date: '2000-01-01',
    time: '00:30',
    comment: 'Два шкафа и холодильник',
  }))
    await form.locator(`[name=${name}]`).fill(value);
  await submit.click();
  assert.equal(await form.locator('[aria-invalid=true]').count(), 2);
  await form.locator('[name=date]').fill('2099-01-02');
  await form.locator('[name=phone]').fill('+7 (999) 000-11-22');
  await form.locator('[name=loaders]').check();
  await form.locator('[name=service]').selectOption({ label: 'Мебель и техника' });
  let submissions = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') submissions++;
  });
  await submit.click();
  const done = page.locator('[data-quote-done]');
  assert(await done.isVisible());
  const summary = await page.locator('#trip-text').inputValue();
  for (const part of [
    'Анна',
    '00:30',
    '02.01.2099',
    'Газель 6,2 м',
    'Грузчики: нужны',
    'Два шкафа',
  ])
    assert(summary.includes(part));
  assert(summary.includes('Услуга: Мебель и техника'));
  assert.equal(submissions, 0);
  await done.getByRole('button', { name: 'Скопировать' }).click();
  await page.waitForFunction(() =>
    Boolean(document.querySelector('[data-copy-status]')?.textContent),
  );
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.equal(copied.replaceAll('\r\n', '\n'), summary);
  await done.getByRole('button', { name: 'Изменить' }).click();
  assert.equal(await form.locator('[name=name]').inputValue(), 'Анна');
  for (const vehicle of ['short', 'long']) {
    await page.locator(`#fleet [data-vehicle=${vehicle}]`).click();
    assert.equal(await form.locator('[name=vehicle]').inputValue(), vehicle);
  }
}

async function checkCalculator(page: Page) {
  const machine = page.locator('#calc-truck');
  const quantity = page.locator('#calc-amount');
  const expectPrice = async (expected: string) =>
    assert.equal((await page.locator('#calc-price').innerText()).replace(/\s/g, ''), expected);
  await expectPrice('2200₽');
  await machine.selectOption('long');
  await expectPrice('3000₽');
  await quantity.fill('1');
  await expectPrice('—');
  await quantity.fill('2.5');
  await expectPrice('3750₽');
  await page.getByText('Межгород', { exact: true }).click();
  await expectPrice('—');
  await quantity.fill('-1');
  await expectPrice('—');
  await quantity.fill('100');
  await expectPrice('6000₽');
  await machine.selectOption('short');
  await expectPrice('4500₽');
  await page.getByText('По Перми', { exact: true }).click();
  await expectPrice('2750₽');
  await machine.selectOption('long');
  await page.locator('#calc-order').click();
  assert.equal(await page.locator('#quote-vehicle').inputValue(), 'long');
}

await withPreview(async (url) => {
  const browser = await chromium.launch();
  try {
    for (const width of [375, 390, 768, 1366, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        locale: 'ru-RU',
        reducedMotion: 'reduce',
        permissions: ['clipboard-read', 'clipboard-write'],
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error' && m.location().url.startsWith(url)) errors.push(m.text());
      });
      // Сетевая ошибка виджета должна оставить контакты и внешнюю карту доступными.
      await page.route('https://yandex.ru/map-widget/**', (route) => route.abort('failed'));
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('h1').count(), 1);
      assert(!(await page.locator('body').innerText()).includes('Груз59'));
      const ids = await page
        .locator('a[href^="#"]')
        .evaluateAll((links) =>
          links
            .map((a) => a.getAttribute('href')!.slice(1))
            .filter((id) => !document.getElementById(id)),
        );
      assert.deepEqual(ids, []);
      assert.deepEqual(
        new Set(
          await page
            .locator('a[href^="tel:"]')
            .evaluateAll((a) => a.map((el) => el.getAttribute('href'))),
        ),
        new Set(['tel:+79638765444', 'tel:+79028018551']),
      );
      const badBoxes = await page
        .locator(
          'main h1, main h2, main h3, main .btn, main input, main select, main img, .header__inner > *',
        )
        .evaluateAll((nodes) =>
          nodes
            .filter((n) => {
              const b = n.getBoundingClientRect();
              return b.width && (b.right > innerWidth + 1 || b.left < -1);
            })
            .map((n) => n.className),
        );
      assert.deepEqual(badBoxes, []);
      const burger = page.locator('[data-burger]');
      if (await burger.isVisible()) {
        await burger.click();
        await page.keyboard.press('Escape');
        assert.equal(await burger.getAttribute('aria-expanded'), 'false');
        await burger.click();
        await page.locator('#mobile-menu a[href="#fleet"]').click();
        assert.equal(await burger.getAttribute('aria-expanded'), 'false');
        assert.equal(new URL(page.url()).hash, '#fleet');
      } else {
        for (const link of await page.locator('.nav a').all()) {
          await link.click();
          assert.equal(new URL(page.url()).hash, await link.getAttribute('href'));
        }
        await page.locator('.header__cta').click();
        assert.equal(new URL(page.url()).hash, '#quote');
      }
      await checkCalculator(page);
      await checkQuote(page);
      for (const btn of await page.locator('.faq__btn').all()) {
        await btn.click();
        assert.equal(await btn.getAttribute('aria-expanded'), 'true');
        await btn.click();
        assert.equal(await btn.getAttribute('aria-expanded'), 'false');
      }
      await page.locator('#contacts').scrollIntoViewIfNeeded();
      await page
        .locator('.contacts__frame')
        .waitFor({ state: 'attached', timeout: 2000 })
        .catch(async () => {
          assert(await page.locator('[data-map]').innerText());
        });
      assert(await page.locator('.map-link').isVisible());
      assert(!(await page.locator('.map-link').getAttribute('href'))?.includes('pt='));
      await page.locator('.footer .logo').click();
      assert.equal(new URL(page.url()).hash, '#top');
      assert.deepEqual(errors, []);
      await context.close();
      console.log(
        `${width}px — меню, тарифы, форма, копирование, FAQ, контакты и резервная ссылка карты ✓`,
      );
    }
  } finally {
    await browser.close();
  }
});
