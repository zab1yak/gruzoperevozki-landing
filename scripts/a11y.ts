/**
 * Проверка доступности для агента a11y-auditor.
 * 1. Контраст каждой пары «текст / фон» и «граница / фон» по WCAG 2.2 (коэффициент считается сам).
 * 2. Кегли текста меньше 16px.
 * 3. Нарушения axe-core (фокус, alt, семантика, ARIA).
 * Пишет screenshots/a11y-report.json и screenshots/a11y-report.md.
 * Запуск: npm run a11y (сборка делается перед запуском).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium, type Page } from 'playwright';
import { withPreview } from './preview.ts';

const WIDTHS = [390, 1440];
const OUT_DIR = resolve(import.meta.dirname, '..', 'screenshots');

type Row = {
  kind: 'text' | 'border';
  selector: string;
  sample: string;
  fg: string;
  bg: string;
  ratio: number | null;
  fontSize: number;
  large: boolean;
  needed: number;
  pass: boolean | null;
  note: string;
  /** Метка элемента, у которого фон нужно замерить по пикселям (под ним фото). */
  probe?: string;
};

type AxeRow = { id: string; impact: string; help: string; targets: string[] };

type Report = { width: number; rows: Row[]; smallText: Row[]; axe: AxeRow[] };

/** Выполняется в браузере: собирает пары цветов и считает контраст. */
function collect(): Row[] {
  type RGBA = [number, number, number, number];

  const parse = (value: string): RGBA | null => {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    return [parts[0], parts[1], parts[2], parts[3] ?? 1];
  };

  // Верхний слой поверх нижнего (альфа-композиция)
  const over = (top: RGBA, bottom: RGBA): RGBA => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    const mix = (i: number) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a;
    return [mix(0), mix(1), mix(2), a];
  };

  const lum = ([r, g, b]: RGBA) => {
    const ch = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
  };

  const ratio = (a: RGBA, b: RGBA) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
  };

  const hex = ([r, g, b]: RGBA) =>
    '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

  const describe = (el: Element) => {
    const cls = Array.from(el.classList).slice(0, 2).join('.');
    return el.tagName.toLowerCase() + (cls ? `.${cls}` : '');
  };

  /** Фон под точкой: идём по стеку отрисовки вниз от элемента. */
  const backdrop = (el: Element, x: number, y: number): { bg: RGBA; note: string } => {
    let stack = document.elementsFromPoint(x, y);
    let start = stack.indexOf(el);
    if (start < 0) {
      // Элемент вне экрана (например, skip-link): берём фон предков
      stack = [];
      for (let node: Element | null = el; node; node = node.parentElement) stack.push(node);
      start = 0;
    }
    const layers: RGBA[] = [];
    let note = '';
    for (const node of stack.slice(Math.max(start, 0))) {
      const cs = getComputedStyle(node);
      if (node instanceof SVGElement && node.tagName !== 'svg') {
        const fill = parse(cs.fill);
        if (fill && fill[3] > 0)
          layers.push([fill[0], fill[1], fill[2], fill[3] * Number(cs.fillOpacity)]);
      } else {
        const before = getComputedStyle(node, '::before');
        if (before.content !== 'none' && before.position === 'absolute') {
          const b = parse(before.backgroundColor);
          if (b && b[3] > 0) layers.push(b);
          if (before.backgroundImage !== 'none') note = 'под текстом картинка или градиент';
        }
        const bg = parse(cs.backgroundColor);
        if (bg && bg[3] > 0) layers.push(bg);
        if (cs.backgroundImage !== 'none' || node.tagName === 'IMG') {
          note = 'под текстом картинка или градиент';
        }
      }
      if (layers.some((l) => l[3] >= 1)) break;
    }
    let result: RGBA = [255, 255, 255, 1];
    for (const layer of layers.reverse()) result = over(layer, result);
    return { bg: result, note };
  };

  const visible = (el: Element) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return (
      r.width > 1 &&
      r.height > 1 &&
      cs.visibility !== 'hidden' &&
      Number(cs.opacity) > 0 &&
      cs.clipPath !== 'inset(50%)' &&
      !el.closest('[hidden]')
    );
  };

  const rows: Row[] = [];
  const seen = new Set<string>();
  const push = (row: Row) => {
    const key = `${row.kind}|${row.selector}|${row.fg}|${row.bg}|${row.fontSize}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push(row);
  };

  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    el.scrollIntoView({ block: 'center' });
    const rect = el.getBoundingClientRect();
    const x = rect.left + Math.min(rect.width / 2, 12);
    const y = rect.top + rect.height / 2;

    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? '')
      .join('')
      .trim();
    if (text) {
      const fontSize = parseFloat(cs.fontSize);
      const weight = Number(cs.fontWeight);
      const large = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700);
      // Символы внутри role="img" (звёзды рейтинга) — графика, для неё порог 3:1
      const graphic = Boolean(el.closest('[role="img"]'));
      const needed = large || graphic ? 3 : 4.5;
      const { bg, note } = backdrop(el, x, y);
      const fgRaw = parse(cs.color) ?? [0, 0, 0, 1];
      const fg = over(fgRaw, bg);
      const r = ratio(fg, bg);
      let probe: string | undefined;
      if (note) {
        probe = `p${rows.length}`;
        el.setAttribute('data-a11y-probe', probe);
      }
      push({
        kind: 'text',
        probe,
        selector: describe(el),
        sample: text.slice(0, 40),
        fg: hex(fg),
        bg: hex(bg),
        ratio: note ? null : r,
        fontSize,
        large,
        needed,
        pass: note ? null : r >= needed,
        note: note || `по расчёту ${r}:1`,
      });
    }

    // Границы интерактивных элементов: нужен контраст 3:1 к фону вокруг
    const interactive = el.matches('a.btn, button, input, .faq__icon, .tag');
    const border = parseFloat(cs.borderTopWidth);
    if (interactive && border > 0) {
      const line = parse(cs.borderTopColor);
      if (line && line[3] > 0) {
        const parent = el.parentElement ?? document.body;
        const { bg, note } = backdrop(parent, rect.left - 2 < 0 ? x : rect.left - 2, y);
        const fg = over(line, bg);
        const r = ratio(fg, bg);
        const fill = parse(cs.backgroundColor);
        // Залитая кнопка видна по заливке, рамка у неё не обязательна
        const filled = fill && fill[3] >= 1 && ratio(fill, bg) >= 3;
        if (!filled) {
          push({
            kind: 'border',
            selector: describe(el),
            sample:
              (el.textContent ?? '').trim().slice(0, 40) || el.getAttribute('aria-label') || '',
            fg: hex(fg),
            bg: hex(bg),
            ratio: note ? null : r,
            fontSize: parseFloat(cs.fontSize),
            large: false,
            needed: 3,
            pass: note ? null : r >= 3,
            note: note || 'рамка интерактивного элемента',
          });
        }
      }
    }
  }
  window.scrollTo(0, 0);
  return rows;
}

const luminance = (hexColor: string): number => {
  const ch = (i: number) => {
    const s = parseInt(hexColor.slice(i, i + 2), 16) / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(1) + 0.7152 * ch(3) + 0.0722 * ch(5);
};

const contrast = (a: string, b: string): number => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
};

/**
 * Фон под текстом на фото: прячем текст, снимаем его область и берём худший пиксель.
 * Для светлого текста худший — самый светлый (98-й перцентиль, чтобы не ловить шум JPEG),
 * для тёмного — самый тёмный.
 */
async function measureOverImage(page: Page, row: Row): Promise<void> {
  const sel = `[data-a11y-probe="${row.probe}"]`;
  const box = await page.evaluate((s) => {
    const el = document.querySelector<HTMLElement>(s);
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    el.style.setProperty('color', 'transparent', 'important');
    // Прямоугольник самих букв, без рамки и внутренних отступов элемента
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  }, sel);
  if (!box) return;
  const png = await page.screenshot({ clip: box });
  await page.evaluate(
    (s) => document.querySelector<HTMLElement>(s)?.style.removeProperty('color'),
    sel,
  );
  const lightText = luminance(row.fg) > 0.18;
  const worst = await page.evaluate(
    async ({ data, light }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, img.width, img.height).data;
      const list: [number, number, number, number][] = [];
      for (let i = 0; i < px.length; i += 4) {
        const [r, g, b] = [px[i], px[i + 1], px[i + 2]];
        list.push([0.2126 * r + 0.7152 * g + 0.0722 * b, r, g, b]);
      }
      list.sort((a, b) => a[0] - b[0]);
      const pick = list[Math.floor((light ? 0.98 : 0.02) * (list.length - 1))];
      return (
        '#' +
        pick
          .slice(1)
          .map((v) => v.toString(16).padStart(2, '0'))
          .join('')
      );
    },
    { data: png.toString('base64'), light: lightText },
  );
  if (!worst) return;
  row.bg = worst;
  row.ratio = contrast(row.fg, worst);
  row.pass = row.ratio >= row.needed;
  row.note = `текст на фото, худший пиксель фона ${worst}`;
}

async function audit(page: Page, width: number): Promise<Report> {
  const rows = await page.evaluate(collect);
  for (const row of rows.filter((r) => r.probe)) await measureOverImage(page, row);
  const smallText = rows.filter((r) => r.kind === 'text' && r.fontSize < 16);
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  return {
    width,
    rows,
    smallText,
    axe: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? 'n/a',
      help: v.help,
      targets: v.nodes.map((n) => n.target.join(' ')),
    })),
  };
}

const cell = (value: string) => value.replace(/\|/g, '/').replace(/\n/g, ' ');

function toMarkdown(reports: Report[]): string {
  const out: string[] = ['# Отчёт a11y (сгенерирован scripts/a11y.ts)', ''];
  for (const rep of reports) {
    const fails = rep.rows.filter((r) => r.pass === false);
    const unknown = rep.rows.filter((r) => r.pass === null);
    out.push(`## Ширина ${rep.width}px`, '');
    out.push(
      `Пар всего: ${rep.rows.length} / не прошли: ${fails.length} / проверить глазами: ${unknown.length} / текст меньше 16px: ${rep.smallText.length} / нарушений axe: ${rep.axe.length}`,
      '',
    );
    out.push('| Тип | Элемент | Пример | Текст | Фон | Коэфф. | Нужно | Кегль | Итог |');
    out.push('|---|---|---|---|---|---|---|---|---|');
    for (const r of rep.rows) {
      const verdict = r.pass === null ? `проверить: ${r.note}` : r.pass ? 'ок' : 'НЕТ';
      out.push(
        `| ${r.kind === 'text' ? 'текст' : 'рамка'} | \`${r.selector}\` | ${cell(r.sample)} | ${r.fg} | ${r.bg} | ${r.ratio ?? '—'} | ${r.needed} | ${r.fontSize}px | ${verdict} |`,
      );
    }
    out.push('', '### axe-core', '');
    if (!rep.axe.length) out.push('Нарушений нет.');
    for (const v of rep.axe) {
      out.push(
        `- **${v.id}** (${v.impact}): ${v.help}. Элементы: ${v.targets.slice(0, 5).join(', ')}`,
      );
    }
    out.push('');
  }
  return out.join('\n');
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const reports: Report[] = [];
  await withPreview(async (url) => {
    const browser = await chromium.launch();
    try {
      for (const width of WIDTHS) {
        // reducedMotion отключает анимации появления, блоки видны сразу
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion: 'reduce',
        });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        reports.push(await audit(page, width));
        await context.close();
      }
    } finally {
      await browser.close();
    }
  });

  await writeFile(resolve(OUT_DIR, 'a11y-report.json'), JSON.stringify(reports, null, 2));
  await writeFile(resolve(OUT_DIR, 'a11y-report.md'), toMarkdown(reports));
  for (const rep of reports) {
    const fails = rep.rows.filter((r) => r.pass === false).length;
    console.log(
      `${rep.width}px: пар ${rep.rows.length}, не прошли ${fails}, мелкий текст ${rep.smallText.length}, axe ${rep.axe.length}`,
    );
  }
  console.log('Отчёт: screenshots/a11y-report.md');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
