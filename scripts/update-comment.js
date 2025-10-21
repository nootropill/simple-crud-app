import { API_URL, escapeHTML } from './utils.js';

const getUpdateCommentButton = document.querySelector('.content-box__update-comment');
const formElement = document.getElementById('updateComment');
const serverResponseElement = document.querySelector('.content-box__server-response');
let currentRequestGet = null;
let currentRequestPatch = null;

function getComment() {
  return new Promise((resolve, reject) => {
    const xhrGet = new XMLHttpRequest();
    xhrGet.open('GET', `${API_URL}/comments/${formElement.commentId.value}`);
    xhrGet.responseType = 'json';
    xhrGet.timeout = 5000;

    xhrGet.addEventListener('load', () => {
      if (xhrGet.status >= 200 && xhrGet.status < 300) {
        resolve(xhrGet.response);
      } else if (xhrGet.status === 404) {
        reject(new Error(`Комментарий с id: ${formElement.commentId.value} не найден.`))
      } else {
        reject(new Error(`HTTP ${xhrGet.status}: ${xhrGet.statusText}`))
      }
    })

    xhrGet.addEventListener('error', () => {
      reject(new Error('Server connection failed.'));
    })

    xhrGet.addEventListener('timeout', () => {
      reject(new Error('Waiting time exceeded.'));
    })

    currentRequestGet = xhrGet;
    xhrGet.send();
  })
}

function patchComment(updatedComment) {
  return new Promise((resolve, reject) => {
    const xhrPatch = new XMLHttpRequest();
    xhrPatch.open('PATCH', `${API_URL}/comments/${formElement.commentId.value}`);
    xhrPatch.setRequestHeader('Content-type', 'application/json');
    xhrPatch.responseType = 'json';
    xhrPatch.timeout = 5000;

    xhrPatch.addEventListener('load', () => {
      if (xhrPatch.status >= 200 && xhrPatch.status < 300) {
        resolve(xhrPatch.response);
      }
      else {
        reject(new Error(`HTTP ${xhrPatch.status}: ${xhrPatch.statusText}`));
      }      
    })

    xhrPatch.addEventListener('error', () => {
      reject(new Error('Server connection failed.'));
    })

    xhrPatch.addEventListener('timeout', () => {
      reject(new Error('Waiting time exceeded.'));
    })

    currentRequestPatch = xhrPatch;
    xhrPatch.send(updatedComment);
  })
}

function renderComment(comment, response) {
  const header = `<h2>Предыдущая версия коммента:</h2>`;
  const oldComment = Object.entries(comment)
    .filter(([key]) => key !== 'id' && key !== 'postId')
    .map(([key, value]) => `${escapeHTML(key)}: ${escapeHTML(value)}`)
    .join(', ');

  const secondHeader = `<h2>Новая версия коммента:</h2>`;
  const newComment = Object.entries(response)
    .filter(([key]) => key !== 'id' && key !== 'postId') 
    .map(([key, value]) => `${escapeHTML(key)}: ${escapeHTML(value)}`)
    .join(', ');

  return header + `<p>${oldComment}</p>`  + secondHeader + `<p>${newComment}</p>` 
}

formElement.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (currentRequestGet) {
    currentRequestGet.abort();
  }
  getUpdateCommentButton.disabled = true;

  try {
    const comment = await getComment();
    const response = await patchComment(JSON.stringify(Object.fromEntries(new FormData(formElement))));

    serverResponseElement.innerHTML = renderComment(comment, response);
    formElement.reset();
  } catch (error) {
    serverResponseElement.innerHTML = `<p>${escapeHTML(error.message)}</p>`;
  } finally {
    serverResponseElement.classList.remove('box-invisible');
    getUpdateCommentButton.disabled = false;
    currentRequestGet = null;
    currentRequestPatch = null;
  }

})