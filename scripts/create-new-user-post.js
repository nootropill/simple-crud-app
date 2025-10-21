import { API_URL, escapeHTML } from './utils.js';

const formElement = document.getElementById('addNewPost');
const serverResponse = document.querySelector('.content-box__server-response');
const addNewPostButtonElement = document.querySelector('.content-box__create-post')
let currentRequest = null;

function fetchPost(newData) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/posts`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.responseType = 'json';
    xhr.timeout = 5000;

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
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
    xhr.send(newData);
  })
}

function parseResponse(response) {
  const header = '<h2 class="new-post-line">Новый пост</h2>'

  const userName = Object.entries(response)
    .find(([key]) => key === 'userId')[1]

  console.log(userName)

  const newPost = Object.entries(response)
    .filter(([key]) => key !== 'id' && key !== 'userId')
    .map(([key, value]) => `<p class="new-post-line">${escapeHTML(key)}: ${value}</p>`)
    .join('')

  return header + `<p class="new-post-line">user: ${document.querySelector(`[value="${userName}"]`).textContent}, ${newPost}</p>`
}

formElement.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (currentRequest) {
    currentRequest.abort();
  }

  addNewPostButtonElement.disabled = true;

  const newData = JSON.stringify(Object.fromEntries(new FormData(formElement)));

  try {
    const response = await fetchPost(newData);
    serverResponse.innerHTML = parseResponse(response);
  } catch (error) {
    serverResponse.innerHTML = `<p>${escapeHTML(error.message)}</p>`;
  }
  finally {
    formElement.reset();
    serverResponse.classList.remove('box-invisible');
    addNewPostButtonElement.disabled = false;
    currentRequest = null;
  }
})