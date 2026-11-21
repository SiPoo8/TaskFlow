// თუ უკვე შესულია — tasks-ზე
if (isLoggedIn()) {
    window.location.href = '/tasks.html';
}

const loginForm    = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const errorEl      = document.getElementById('error');

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
}

function hideError() {
    errorEl.classList.add('hidden');
}

document.getElementById('show-register-link').addEventListener('click', function (e) {
    e.preventDefault();
    hideError();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

document.getElementById('show-login-link').addEventListener('click', function (e) {
    e.preventDefault();
    hideError();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

document.getElementById('login-form-el').addEventListener('submit', async function (e) {
    e.preventDefault();
    hideError();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: { username, password }
        });
        setToken(data.token, data.username);
        window.location.href = '/tasks.html';
    } catch (err) {
        showError('Sign in failed: ' + err.message);
    }
});

document.getElementById('register-form-el').addEventListener('submit', async function (e) {
    e.preventDefault();
    hideError();

    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    try {
        const data = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: { username, password }
        });
        setToken(data.token, data.username);
        window.location.href = '/tasks.html';
    } catch (err) {
        showError('Registration failed: ' + err.message);
    }
});