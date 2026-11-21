function getToken()      { return localStorage.getItem('token'); }
function getUsername()   { return localStorage.getItem('username'); }
function isLoggedIn()    { return !!getToken(); }

function setToken(token, username) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
}

function clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
}

async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    if (options.body && typeof options.body === 'object') {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    const res = await fetch(path, { ...options, headers });

    if ((res.status === 401 || res.status === 403) && !path.startsWith('/api/auth/')) {
        clearToken();
        window.location.href = '/index.html';
        throw new Error('Unauthorized');
    }

    if (!res.ok) {
        const text = await res.text();
        let message = text;
        try {
            const parsed = JSON.parse(text);
            message = parsed.message || parsed.error || text;
        } catch (_) {}
        throw new Error(message || ('HTTP ' + res.status));
    }

    if (res.status === 204) return null;
    return res.json();
}