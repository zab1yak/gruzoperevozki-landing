import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './style.css';
import { company } from './content';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `<h1>${company.name}</h1><p class="lead">${company.tagline}</p>`;
}
