// DOM 元素
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const historyList = document.getElementById('history-todo-list');
const taskCount = document.getElementById('task-count');
const clearAllBtn = document.getElementById('clear-all');
const clearHistoryBtn = document.getElementById('clear-history');
const currentTimeElement = document.createElement('span');
const currentDateElement = document.getElementById('current-date');
const emptyStateTodo = document.getElementById('empty-state-todo');
const emptyStateHistory = document.getElementById('empty-state-history');

// 从localStorage获取任务列表，如果没有则初始化为空数组
let tasks = [];
let historyTasks = [];

try {
  const storedTasks = localStorage.getItem('tasks');
  const storedHistoryTasks = localStorage.getItem('historyTasks');
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
  historyTasks = storedHistoryTasks ? JSON.parse(storedHistoryTasks) : [];
} catch (error) {
  console.error('Error reading localStorage:', error);
}

// 初始化任务计数
updateTaskCount();

// 每秒更新一次时间
setInterval(() => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  currentTimeElement.textContent = ` ${hours}:${minutes}:${seconds}`;
  const timeSpan = document.getElementById('current-time');
  if (!currentTimeElement.isConnected) {
    timeSpan.appendChild(currentTimeElement);
  }
}, 1000);

// 获取当前日期并更新日期元素内容
const nowDate = new Date();
const year = nowDate.getFullYear();
const month = (nowDate.getMonth() + 1).toString().padStart(2, '0');
const day = nowDate.getDate().toString().padStart(2, '0');
currentDateElement.textContent = `${year}-${month}-${day}`;

// 渲染任务列表
renderTasks();
renderHistoryTasks();

// 表单提交事件
form.addEventListener('submit', function (event) {
  event.preventDefault();
  const task = input.value.trim();
  if (task) {
    const newTask = {
      id: Date.now(),
      text: task,
      completed: false,
      completedDate: null
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    input.value = '';
    input.focus();
  }
});

// 切换任务完成状态
function toggleTaskStatus(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      task.completed = !task.completed;
      if (task.completed) {
        task.completedDate = new Date();
        // 将完成的任务移动到历史任务列表
        const index = tasks.indexOf(task);
        const completedTask = tasks.splice(index, 1)[0];
        historyTasks.push(completedTask);
      } else {
        // 如果任务被重新标记为未完成，从历史中移除
        const index = historyTasks.findIndex(t => t.id === id);
        if (index !== -1) {
          historyTasks.splice(index, 1);
        }
      }
    }
    return task;
  });
  saveTasks();
  saveHistoryTasks();
  renderTasks();
  renderHistoryTasks();
}

// 删除任务
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  // 确保历史记录中也删除
  historyTasks = historyTasks.filter(task => task.id !== id);
  saveTasks();
  saveHistoryTasks();
  renderTasks();
  renderHistoryTasks();
}

// 清除所有任务
clearAllBtn.addEventListener('click', function () {
  if (tasks.length > 0) {
    if (confirm('确定要删除所有当前任务吗？')) {
      tasks = [];
      saveTasks();
      renderTasks();
    }
  }
});

// 清除历史任务
clearHistoryBtn.addEventListener('click', function () {
  if (historyTasks.length > 0) {
    if (confirm('确定要清空历史记录吗？')) {
      historyTasks = [];
      saveHistoryTasks();
      renderHistoryTasks();
    }
  }
});

// 更新任务计数
function updateTaskCount() {
  const count = list.children.length;
  taskCount.textContent = `${count} task${count !== 1 ? 's' : ''}`;
}

// 保存任务列表到localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 保存历史任务列表到localStorage
function saveHistoryTasks() {
  localStorage.setItem('historyTasks', JSON.stringify(historyTasks));
}

// 渲染任务列表
function renderTasks() {
  list.innerHTML = '';

  // 显示或隐藏空状态
  if (tasks.length === 0) {
    emptyStateTodo.style.display = 'block';
  } else {
    emptyStateTodo.style.display = 'none';
  }

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.dataset.id = task.id;

    // 创建任务内容容器
    const contentContainer = document.createElement('div');

    // 创建复选框
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));

    // 创建任务文本
    const taskSpan = document.createElement('span');
    taskSpan.textContent = task.text;
    if (task.completed) {
      taskSpan.classList.add('task-complete');
    }

    // 创建删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fa fa-times"></i>';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    contentContainer.appendChild(checkbox);
    contentContainer.appendChild(taskSpan);
    li.appendChild(contentContainer);
    li.appendChild(deleteBtn);

    list.appendChild(li);

    // 添加动画延迟
    li.style.animationDelay = `${tasks.indexOf(task) * 50}ms`;
  });
  updateTaskCount();
}

// 渲染历史任务列表
function renderHistoryTasks() {
  historyList.innerHTML = '';

  // 显示或隐藏空状态
  if (historyTasks.length === 0) {
    emptyStateHistory.style.display = 'block';
  } else {
    emptyStateHistory.style.display = 'none';
  }

  // 按完成时间排序，最新的在前
  const sortedHistory = [...historyTasks].sort((a, b) => {
    return new Date(b.completedDate) - new Date(a.completedDate);
  });

  sortedHistory.forEach(task => {
    const li = document.createElement('li');

    // 创建任务内容容器
    const contentContainer = document.createElement('div');

    // 创建任务文本
    const taskSpan = document.createElement('span');
    taskSpan.textContent = task.text;
    taskSpan.classList.add('task-complete');

    // 创建完成日期文本
    const dateSpan = document.createElement('span');
    dateSpan.className = 'history-date';
    if (task.completedDate) {
      const completedDate = new Date(task.completedDate);
      const year = completedDate.getFullYear();
      const month = (completedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = completedDate.getDate().toString().padStart(2, '0');
      const hours = completedDate.getHours().toString().padStart(2, '0');
      const minutes = completedDate.getMinutes().toString().padStart(2, '0');
      dateSpan.textContent = `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // 创建恢复按钮
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'delete-btn';
    restoreBtn.innerHTML = '<i class="fa fa-undo"></i>';
    restoreBtn.addEventListener('click', () => {
      // 将任务从历史中恢复到当前任务
      const index = historyTasks.indexOf(task);
      if (index !== -1) {
        const restoredTask = historyTasks.splice(index, 1)[0];
        restoredTask.completed = false;
        restoredTask.completedDate = null;
        tasks.push(restoredTask);
        saveTasks();
        saveHistoryTasks();
        renderTasks();
        renderHistoryTasks();
      }
    });

    contentContainer.appendChild(taskSpan);
    contentContainer.appendChild(dateSpan);
    li.appendChild(contentContainer);
    li.appendChild(restoreBtn);

    historyList.appendChild(li);
  });
}

// 标签页切换函数
function openTab(evt, tabName) {
  const tabcontent = document.querySelectorAll('.tabcontent');
  const tablinks = document.querySelectorAll('.tablinks');

  tabcontent.forEach(tab => {
    tab.style.display = 'none';
  });

  tablinks.forEach(link => {
    link.classList.remove('active');
  });

  document.getElementById(tabName).style.display = 'block';
  evt.currentTarget.classList.add('active');
}

// 监听storage事件，实现标签页之间的通信
window.addEventListener('storage', function (event) {
  if (event.key === 'tasks') {
    tasks = JSON.parse(event.newValue);
    renderTasks();
  }
  if (event.key === 'historyTasks') {
    historyTasks = JSON.parse(event.newValue);
    renderHistoryTasks();
  }
});