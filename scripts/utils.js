export const API_URL = 'http://localhost:3000';

export function escapeHTML(str) {
  const div = document.createElement('div');
  div.innerText = str;

  return div.innerHTML;
}

