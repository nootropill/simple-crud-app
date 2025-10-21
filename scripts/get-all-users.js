import { API_URL, escapeHTML } from './utils.js';

const getAllUsersButtonElement = document.querySelector('.content-box__users-button')
const allUsersBoxElement = document.querySelector('.content-box__server-response')
let currentRequest = null

function fetchUsers() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', `${API_URL}/users`)
    xhr.responseType = 'json'
    xhr.timeout = 5000 

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response)
      }
      else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Server connection failed.'))
    })

    xhr.addEventListener('timeout', () => {
      reject(new Error('Waiting time exceeded.'))
    })

    currentRequest = xhr
    xhr.send()
  })
}

function renderUsers(users) {
  const header = '<h2>Данные пользователей</h2>'
  const userItems = users.map(user => {
    const fields = Object.entries(user)
      .filter(([key]) => key !== 'id')
      .map(([key, value]) => `${escapeHTML(key)}: ${escapeHTML(String(value))}`)
      .join(', ')
    return `<p>${fields}</p>`
  }).join('')

  return header + userItems
}

getAllUsersButtonElement.addEventListener('click', async () => {
  if (currentRequest) {
    currentRequest.abort()
  }

  getAllUsersButtonElement.disabled = true

  try {
    const users = await fetchUsers()
    allUsersBoxElement.innerHTML = renderUsers(users)
  } catch (error) {
    allUsersBoxElement.innerHTML = `<p>${escapeHTML(error.message)}</p>`
  } finally {
    allUsersBoxElement.classList.remove('box-invisible')
    getAllUsersButtonElement.disabled = false
    currentRequest = null
  }
})

export { escapeHTML, fetchUsers };