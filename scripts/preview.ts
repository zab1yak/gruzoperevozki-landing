/** Общий запуск `npm run preview` для скриптов проверки дизайна. */
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import type { Page } from 'playwright';

const PORT = 4173;
const HOST = '127.0.0.1';
export const PREVIEW_URL = `http://${HOST}:${PORT}/gruzoperevozki-landing/`;

const isWindows = process.platform === 'win32';

async function responds(timeoutMs = 2000): Promise<boolean> {
  try {
    const res = await fetch(PREVIEW_URL, { signal: AbortSignal.timeout(timeoutMs) });
    return res.ok;
  } catch {
    return false;
  }
}

function startPreview(): ChildProcess {
  return spawn(
    'npm',
    ['run', 'preview', '--', '--host', HOST, '--port', String(PORT), '--strictPort'],
    // На POSIX своя группа процессов, чтобы погасить и npm, и vite одним сигналом
    { shell: true, stdio: 'ignore', detached: !isWindows },
  );
}

function stopPreview(server: ChildProcess): void {
  if (!server.pid || server.exitCode !== null) return;
  try {
    if (isWindows) {
      // npm на Windows запускает vite через cmd, поэтому гасим всё дерево процессов
      execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-server.pid, 'SIGTERM');
    }
  } catch {
    // процесс уже завершился; не подменяем исходную ошибку из run
  }
}

/** Ждёт ответа именно от нашего сервера: если он упал при старте, сразу ошибка. */
async function waitForServer(server: ChildProcess, timeoutMs = 30_000): Promise<void> {
  let exited = false;
  server.once('exit', () => (exited = true));
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (exited) throw new Error(`Preview завершился при старте (порт ${PORT} занят?)`);
    if (await responds()) return;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Preview не ответил за ${timeoutMs / 1000} с: ${PREVIEW_URL}`);
}

/** Поднимает preview, выполняет `run` и гасит сервер даже при ошибке или Ctrl-C. */
export async function withPreview(run: (url: string) => Promise<void>): Promise<void> {
  // Если порт уже отвечает, это чужой или забытый сервер со старой сборкой: проверять его нельзя
  if (await responds()) {
    throw new Error(
      `Порт ${PORT} уже занят другим сервером. Остановите его, иначе проверка пойдёт по старой сборке.`,
    );
  }
  const server = startPreview();
  const onSignal = () => {
    stopPreview(server);
    process.exit(130);
  };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  try {
    await waitForServer(server);
    await run(PREVIEW_URL);
  } finally {
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
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
