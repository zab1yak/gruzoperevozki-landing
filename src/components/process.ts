import { eyebrows, process } from '../content';
import { sectionHead } from './ui';

export function renderProcess(): string {
  const steps = process.steps
    .map(
      (step, index) => `
        <li class="step">
          <span class="stat-value step__num">${String(index + 1).padStart(2, '0')}</span>
          <h3>${step.title}</h3>
          <p class="step__text">${step.text}</p>
        </li>`,
    )
    .join('');
  return `
    <section class="section" id="process" aria-labelledby="process-title">
      <div class="container">
        ${sectionHead(eyebrows.process, process.title, 'process-title')}
        <ol class="steps">${steps}</ol>
      </div>
    </section>`;
}
