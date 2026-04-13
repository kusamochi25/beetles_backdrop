import { createApp } from 'vue';
import App from './AppLocaleShell.vue';
import './styles.css';

const pageDataElement = document.getElementById('page-data');

if (!pageDataElement?.textContent) {
    throw new Error('Page data was not found.');
}

const pageData = JSON.parse(pageDataElement.textContent) as Record<string, unknown>;

createApp(App, { pageData }).mount('#app');
