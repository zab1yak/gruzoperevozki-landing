/** Общий запуск `npm run preview` для скриптов проверки дизайна. */
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import type { Page } from 'playwright';

const PORT = 4173;
const HOST = '127.0.0.1';
export const PREVIEW_URL = `http://${HOST}:${PORT}/gruzoperevozki-landing/`;

function startPreview(): ChildProcess {
  return spawn(
    'npm',
    ['run', 'preview', '--', '--host', HOST, '--port', String(PORT), '--strictPort'],
    { shell: true, stdio: 'ignore' },
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
      const res = await fetch(PREVIEW_URL);
      if (res.ok) return;
    } catch {
      // сервер ещё не поднялся
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Preview не ответил за ${timeoutMs / 1000} с: ${PREVIEW_URL}`);
}

/** Поднимает preview, выполняет `run` и гасит сервер даже при ошибке. */
export async function withPreview(run: (url: string) => Promise<void>): Promise<void> {
  const server = startPreview();
  try {
    await waitForServer();
    await run(PREVIEW_URL);
  } finally {
    stopPreview(server);
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
  });
  await page.waitForTimeout(800);
}
