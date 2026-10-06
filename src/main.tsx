import { render } from 'preact';
import { App } from './ui/App';

document.body.style.margin = '0';
render(<App />, document.getElementById('app')!);
