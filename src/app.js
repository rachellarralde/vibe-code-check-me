/**
 * App entry point — imports styles, initializes flow controller.
 */

import './styles/base.css';
import './styles/terminal.css';
import './styles/components.css';
import { initTerminal } from './terminal.js';

document.addEventListener('DOMContentLoaded', () => {
  initTerminal();
});
