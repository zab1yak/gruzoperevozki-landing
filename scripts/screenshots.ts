/**
 * Скриншоты всей страницы для ревью дизайна.
 * Поднимает `npm run preview`, снимает страницу на четырёх ширинах и кладёт PNG в screenshots/.
 * Запуск: npm run shots (сборка делается перед запуском).
 */
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { scrollThrough, withPreview } from './preview.ts';

const WIDTHS = [390, 768, 1440, 1920];
const OUT_DIR = resolve(import.meta.dirname, '..', 'screenshots');

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  await withPreview(async (url) => {
    const browser = await chromium.launch();
    try {
      for (const width of WIDTHS) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await scrollThrough(page);
        await page.screenshot({ path: resolve(OUT_DIR, `page-${width}.png`), fullPage: true });
        console.log(`✓ ${width}px → screenshots/page-${width}.png`);
        await page.close();
      }
    } finally {
      await browser.close();
    }
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
