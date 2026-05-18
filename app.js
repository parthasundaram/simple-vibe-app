const STORAGE_KEY = "today-board-tasks";

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const priorityInput = document.querySelector("#priorityInput");
const taskList = document.querySelector("#taskList");
const taskTemplate = document.querySelector("#taskTemplate");
const emptyState = document.querySelector("#emptyState");
const filters = document.querySelectorAll("[data-filter]");
const doneCount = document.querySelector("#doneCount");
const openCount = document.querySelector("#openCount");
const focusCount = document.querySelector("#focusCount");
const todayDate = document.querySelector("#todayDate");

let activeFilter = "all";
let tasks = loadTasks();

todayDate.textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(new Date());

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    priority: priorityInput.value,
    done: false,
  });

  taskInput.value = "";
  priorityInput.value = "focus";
  saveAndRender();
});

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === button));
    renderTasks();
  });
});

function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [
      { id: crypto.randomUUID(), title: "Sketch the first useful version", priority: "focus", done: false },
      { id: crypto.randomUUID(), title: "Clear one small blocker", priority: "soon", done: false },
      { id: crypto.randomUUID(), title: "Wrap up with a clean note", priority: "later", done: true },
    ];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "done") return task.done;
    if (activeFilter === "open") return !task.done;
    if (activeFilter === "focus") return task.priority === "focus";
    return true;
  });

  visibleTasks.forEach((task) => {
    const node = taskTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = node.querySelector("input");
    const title = node.querySelector(".task-title");
    const priority = node.querySelector(".priority-pill");
    const deleteButton = node.querySelector(".delete-btn");

    node.classList.toggle("done", task.done);
    checkbox.checked = task.done;
    title.textContent = task.title;
    priority.textContent = task.priority;
    priority.classList.add(task.priority);

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveAndRender();
    });

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveAndRender();
    });

    taskList.append(node);
  });

  const done = tasks.filter((task) => task.done).length;
  const open = tasks.length - done;
  const focus = tasks.filter((task) => task.priority === "focus" && !task.done).length;

  doneCount.textContent = done;
  openCount.textContent = open;
  focusCount.textContent = focus;
  emptyState.classList.toggle("visible", visibleTasks.length === 0);
}

renderTasks();
