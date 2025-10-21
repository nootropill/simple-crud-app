import { API_URL, escapeHTML } from './utils.js';

const getSpecificUserButtonElement = document.querySelector('.content-box__specific-users-button');
const specificUserBoxElement = document.querySelector('.content-box__server-response');
const formElement = document.getElementById('findUserById')
let currentRequest = null;

function fetchSpecificUser() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_URL}/users/${formElement.userId.value}`);
    xhr.responseType = 'json';
    xhr.timeout = 5000;

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      }
      else if (xhr.status === 404) {
        reject(new Error(`Пользователь с id: ${formElement.id.value} не найден.`));
      }
      else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Server connection failed.'));
    })

    xhr.addEventListener('timeout', () => {
      reject(new Error('Waiting time exceeded.'));
    })

    currentRequest = xhr;
    xhr.send();
  })
}

function renderUser(user) {
  const header = `<h2>Пользователь с id: ${formElement.userId.value}</h2>`;
  const desiredUserString = Object.entries(user)
    .filter(([key]) => key !== 'id')
    .map(([key, value]) => `${escapeHTML(key)}: ${escapeHTML(value)}`)
    .join(', ');

  return header + `<p>${desiredUserString}</p>`  
}
 
formElement.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (currentRequest) {
    currentRequest.abort();
  }

  getSpecificUserButtonElement.disabled = true;

  try {
    const users = await fetchSpecificUser();
    specificUserBoxElement.innerHTML = renderUser(users);
    formElement.reset();
  } catch (error) {
    specificUserBoxElement.innerHTML = `<p>${escapeHTML(error.message)}</p>`;
  } finally {
    specificUserBoxElement.classList.remove('box-invisible');
    getSpecificUserButtonElement.disabled = false;
    currentRequest = null;
  }
})
