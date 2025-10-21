import { API_URL, escapeHTML } from "./utils.js";

const requiredUserIdForm = document.querySelector('.content-box__get-posts-by-userId');
const postsBoxElement = document.querySelector('.content-box__server-response');
const selectElement = document.getElementById('userPostId');
const REQUEST_TIMEOUT = 5000;
let currentController = null;
let currentControllerDeletePost = null;

async function fetchPosts(userId) {
  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();
  
  const combinedSignal = AbortSignal.any([
    currentController.signal, 
    AbortSignal.timeout(REQUEST_TIMEOUT)
  ]);

  try {
    const response = await fetch(`${API_URL}/posts?userId=${userId}`,
      { signal: combinedSignal }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Предыдущий запрос отменён');
      return null
    }

    if (error.name === 'TimeoutError') {
      throw new Error('Превышено время ожидания запроса.');
    }

    throw error;
  } finally {
    currentController = null;
  }
}

function renderPost(post) {
  const fields = Object.entries(post)
    .filter(([key]) => key !== 'id')
    .map(([key, value]) => 
      `<p class="post-pair">
        <strong>${escapeHTML(key)}:</strong> ${escapeHTML(String(value))}
      </p>`
    )
    .join('');

    return `
    <article class="post-form" data-post-id="${post.id}">
      <div class="post-content">${fields}</div>
      <button 
        class="button button--delete"
        type="button"
        data-post-id="${post.id}"
        aria-label="Удалить пост ${post.id}"
      >
        Удалить
      </button>
    </article>
    `
}

function renderPosts(posts, userId) {
  const header = `<h2>Посты пользователя ${document.querySelector(`[value="${userId}"]`).textContent}</h2>`;
  
  if (!posts.length) {
    return header + '<p class="empty-state">Постов не найдено</p>'
  }

  // вызов renderPost для каждого элемента массива
  const postsHTML = posts.map(renderPost).join('');
  return header + postsHTML;
}

async function deletePost(postToDeleteId) {

  if (currentControllerDeletePost) {
    currentControllerDeletePost.abort();
  }
  
  currentControllerDeletePost = new AbortController();

  const combinedControllers = AbortSignal.any([
    currentControllerDeletePost.signal,
    AbortSignal.timeout(REQUEST_TIMEOUT)
  ])

  try {
    const response = await fetch(`${API_URL}/posts/${postToDeleteId}`, {
      method: 'DELETE',
      signal: combinedControllers,
    });

    if (!response.ok) {
      throw new Error(`Не удалось удалить ресурс. HTTP: ${response.status}`);
    }

    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Предыдущий запрос отменён');
      return null;
    }
    if (error.name === 'TimeoutError') {
      throw new Error('Превышено время ожидания запроса.')
    }

    throw error;
  } finally {
    currentControllerDeletePost = null;
  }
}

requiredUserIdForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const userId = Number(selectElement.value);

  try {
    const userPosts = await fetchPosts(userId);
    postsBoxElement.innerHTML = renderPosts(userPosts, userId);
  } catch (error) {
    postsBoxElement.innerHTML = `<p>${escapeHTML(error.message)}</p>`;
  } finally {
    postsBoxElement.classList.remove('box-invisible');
  }
})

postsBoxElement.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('.button--delete');
  const postToDeleteId = deleteButton.dataset.postId;

  try {
    await deletePost(postToDeleteId);
    const article = deleteButton.closest('.post-form');
    article.remove();

    const remainingPosts = postsBoxElement.querySelectorAll('.post-form');
    if (remainingPosts.length === 0) {
      postsBoxElement.insertAdjacentHTML('beforeend', '<p>Постов нет.</p>');
    }
  }
  catch (error) {
    alert(`Ошибка удаления. ${error.message}`);
  }
})