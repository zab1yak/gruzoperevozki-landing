/** Каждый тест получает собственный Vite preview на свободном порту. */
import { preview } from 'vite';
import type { Page } from 'playwright';

export async function withPreview(run: (url: string) => Promise<void>): Promise<void> {
  const server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
  try {
    const url = server.resolvedUrls?.local[0];
    if (!url) throw new Error('У Vite preview нет локального адреса');
    await run(url);
  } finally {
    await server.close();
  }
}

/** Прокручивает страницу до конца, чтобы сработали анимации появления блоков. */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Фото грузятся лениво: ждём видимые картинки (скрытые через display: none не грузятся), не дольше 15 с
    const pending = Array.from(document.images).filter(
      (img) => !img.complete && img.getClientRects().length > 0,
    );
    const loaded = Promise.all(
      pending.map(
        (img) =>
          new Promise((done) => {
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
          }),
      ),
    );
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 15_000))]);
  });
  await page.waitForTimeout(800);
}
