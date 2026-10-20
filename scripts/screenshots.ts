/**
 * Скриншоты всей страницы для ревью дизайна.
 * Поднимает `npm run preview`, снимает страницу на четырёх ширинах и кладёт PNG в screenshots/.
 * Запуск: npm run shots (сборка делается перед запуском).
 */
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, type Page } from 'playwright';

const PORT = 4173;
const HOST = '127.0.0.1';
const URL = `http://${HOST}:${PORT}/gruzoperevozki-landing/`;
const WIDTHS = [390, 768, 1440, 1920];
const OUT_DIR = resolve(import.meta.dirname, '..', 'screenshots');

function startPreview(): ChildProcess {
  return spawn(
    'npm',
    ['run', 'preview', '--', '--host', HOST, '--port', String(PORT), '--strictPort'],
    {
      shell: true,
      stdio: 'ignore',
    },
  );
}

function stopPreview(server: ChildProcess): void {
  if (!server.pid) return;
  if (process.platform === 'win32') {
    // npm на Windows запускает vite через cmd, поэтому гасим всё дерево процессов
    execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' });
  } else {
    server.kill('SIGTERM');
  }
}

async function waitForServer(timeoutMs = 30_000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(URL);
      if (res.ok) return;
    } catch {
      // сервер ещё не поднялся
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Preview не ответил за ${timeoutMs / 1000} с: ${URL}`);
}

/** Прокручивает страницу до конца, чтобы сработали анимации появления блоков. */
async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const server = startPreview();
  try {
    await waitForServer();
    const browser = await chromium.launch();
    try {
      for (const width of WIDTHS) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        await page.goto(URL, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await scrollThrough(page);
        const file = resolve(OUT_DIR, `page-${width}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`✓ ${width}px → screenshots/page-${width}.png`);
        await page.close();
      }
    } finally {
      await browser.close();
    }
  } finally {
    stopPreview(server);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
