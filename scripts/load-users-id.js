import { escapeHTML, fetchUsers } from './get-all-users.js';

const selectElements = document.querySelectorAll('.userId');

async function loadUsers() {
  try {
    const users = await fetchUsers();

    selectElements.forEach(selectElement => {
      users.forEach(user => {
        const optionElement = document.createElement('option');
        optionElement.value = user.id;
        optionElement.textContent = `${escapeHTML(user.name)}`;
        selectElement.appendChild(optionElement);
    })
    })
  } catch (error) {
    selectElements.forEach(selectElement => {
      const errorMessage = document.createElement('p');
      errorMessage.innerText = 'Загрузка не удалась.';
      selectElement.replaceWith(errorMessage);
    })
  }
}

loadUsers();