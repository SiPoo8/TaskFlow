if (!isLoggedIn()) {
    window.location.href = '/index.html';
}

document.getElementById('user-name-text').textContent = getUsername() || '';

function showError(msg) {
    const el = document.getElementById('error');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add('hidden'), 5000);
}

document.getElementById('logout-btn').addEventListener('click', function () {
    clearToken();
    window.location.href = '/index.html';
});

async function loadTasks() {
    try {
        const tasks = await apiFetch('/api/tasks');
        renderTasks(tasks);
    } catch (err) {
        document.getElementById('loading').classList.add('hidden');
        showError('Failed to load tasks: ' + err.message);
    }
}

function renderTasks(tasks) {
    document.getElementById('loading').classList.add('hidden');

    const list  = document.getElementById('task-list');
    const empty = document.getElementById('empty-state');
    list.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');
    tasks.forEach(t => list.appendChild(createTaskElement(t)));
}

// ============ SVG icon helper ============
function svgIcon(path, extraClass = '') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    if (extraClass) svg.setAttribute('class', extraClass);

    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);
    svg.appendChild(p);
    return svg;
}

// ============ ტასკის ელემენტი (view mode) ============
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'group flex items-center gap-3 p-4 rounded-2xl border transition cursor-pointer select-none ' +
        (task.completed
            ? 'bg-emerald-500/15 border-emerald-500/50 hover:bg-emerald-500/20'
            : 'bg-navy-900/70 border-navy-800 hover:border-blue-500/40');
    li.title = task.completed ? 'Double-click to mark as not done' : 'Double-click to mark as done';

    li.addEventListener('dblclick', (e) => {
        if (e.target.closest('button')) return;
        toggleTask(task.id, !task.completed);
    });

    const content = document.createElement('div');
    content.className = 'flex-1 min-w-0 pointer-events-none';

    const title = document.createElement('h3');
    title.className = 'font-semibold break-words flex items-center gap-2 ' +
        (task.completed ? 'line-through text-emerald-200/70' : 'text-white');
    title.textContent = task.title;

    if (task.completed) {
        const check = svgIcon('M20 6 9 17l-5-5', 'shrink-0 w-4 h-4 text-emerald-400');
        title.prepend(check);
    }
    content.appendChild(title);

    if (task.description) {
        const desc = document.createElement('p');
        desc.className = 'text-sm mt-0.5 break-words ' +
            (task.completed ? 'text-emerald-200/50' : 'text-slate-400');
        desc.textContent = task.description;
        content.appendChild(desc);
    }

    li.appendChild(content);

    // ✏️ Edit
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.title = 'Edit task';
    edit.className = 'shrink-0 w-9 h-9 rounded-lg bg-navy-950/80 border border-navy-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-navy-950 transition flex items-center justify-center cursor-pointer';
    edit.appendChild(svgIcon('M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'));
    edit.addEventListener('click', (e) => {
        e.stopPropagation();
        enterEditMode(li, task);
    });
    li.appendChild(edit);

    // 🗑 Delete
    const del = document.createElement('button');
    del.type = 'button';
    del.title = 'Delete task';
    del.className = 'shrink-0 w-9 h-9 rounded-lg bg-navy-950/80 border border-navy-800 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-navy-950 transition flex items-center justify-center cursor-pointer';
    del.appendChild(svgIcon('M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6'));
    del.addEventListener('click', (e) => {
        e.stopPropagation();
        openDeleteModal(task);
    });
    li.appendChild(del);

    return li;
}

// ============ Edit mode — inline ============
function enterEditMode(li, task) {
    li.className = 'p-4 rounded-2xl border bg-navy-900/70 border-blue-500/50 transition';
    li.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'space-y-3';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = task.title || '';
    titleInput.placeholder = 'Task title';
    titleInput.className = 'w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm font-semibold';
    wrapper.appendChild(titleInput);

    const descInput = document.createElement('textarea');
    descInput.value = task.description || '';
    descInput.placeholder = 'Description (optional)';
    descInput.rows = 2;
    descInput.className = 'w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm resize-none';
    wrapper.appendChild(descInput);

    const btnRow = document.createElement('div');
    btnRow.className = 'flex gap-2 justify-end';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'px-4 py-2 rounded-lg bg-navy-950 border border-navy-700 text-slate-300 text-xs font-semibold hover:text-white transition cursor-pointer';
    cancelBtn.addEventListener('click', () => {
        const newLi = createTaskElement(task);
        li.replaceWith(newLi);
    });

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save';
    saveBtn.className = 'px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer';
    saveBtn.addEventListener('click', async () => {
        const newTitle = titleInput.value.trim();
        if (!newTitle) {
            showError('Title cannot be empty');
            return;
        }
        try {
            await apiFetch('/api/tasks/' + task.id, {
                method: 'PUT',
                body: {
                    title: newTitle,
                    description: descInput.value.trim()
                }
            });
            await loadTasks();
        } catch (err) {
            showError('Update failed: ' + err.message);
        }
    });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    wrapper.appendChild(btnRow);

    li.appendChild(wrapper);
    titleInput.focus();
    titleInput.select();
}

// ============ 🗑 DELETE MODAL ============
const deleteModal        = document.getElementById('delete-modal');
const deleteTaskTitleEl  = document.getElementById('delete-task-title');
const deleteCancelBtn    = document.getElementById('delete-cancel');
const deleteConfirmBtn   = document.getElementById('delete-confirm');

let pendingDeleteTaskId = null;

function openDeleteModal(task) {
    pendingDeleteTaskId = task.id;
    deleteTaskTitleEl.textContent = task.title || 'this task';

    deleteModal.classList.remove('hidden');
    deleteModal.classList.add('flex');
    // მცირე delay — focus რომ სწორად დაჯდეს
    setTimeout(() => deleteConfirmBtn.focus(), 50);
}

function closeDeleteModal() {
    pendingDeleteTaskId = null;
    deleteModal.classList.add('hidden');
    deleteModal.classList.remove('flex');
}

deleteCancelBtn.addEventListener('click', closeDeleteModal);

deleteConfirmBtn.addEventListener('click', async () => {
    if (pendingDeleteTaskId == null) return;
    const id = pendingDeleteTaskId;
    closeDeleteModal();
    try {
        await apiFetch('/api/tasks/' + id, { method: 'DELETE' });
        await loadTasks();
    } catch (err) {
        showError('Delete failed: ' + err.message);
    }
});

// Backdrop-ზე დაკლიკება → დახურვა
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
});

// ESC → დახურვა
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !deleteModal.classList.contains('hidden')) {
        closeDeleteModal();
    }
});

// ============ Add form ============
document.getElementById('add-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const title       = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    if (!title) return;

    try {
        await apiFetch('/api/tasks', {
            method: 'POST',
            body: { title, description }
        });
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        await loadTasks();
    } catch (err) {
        showError('Failed to add task: ' + err.message);
    }
});

// ============ Toggle ============
async function toggleTask(taskId, completed) {
    try {
        await apiFetch('/api/tasks/' + taskId, {
            method: 'PUT',
            body: { completed }
        });
        await loadTasks();
    } catch (err) {
        showError('Update failed: ' + err.message);
    }
}

loadTasks();