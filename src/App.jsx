import { useMemo, useState } from "react";

const STORAGE_KEY = "today-board-tasks";
const filters = ["all", "focus", "open", "done"];

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function defaultTasks() {
  return [
    { id: createId(), title: "Sketch the first useful version", priority: "focus", done: false },
    { id: createId(), title: "Clear one small blocker", priority: "soon", done: false },
    { id: createId(), title: "Wrap up with a clean note", priority: "later", done: true },
  ];
}

function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return defaultTasks();
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [activeFilter, setActiveFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("focus");

  const todayDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "done") return task.done;
    if (activeFilter === "open") return !task.done;
    if (activeFilter === "focus") return task.priority === "focus";
    return true;
  });

  const doneCount = tasks.filter((task) => task.done).length;
  const openCount = tasks.length - doneCount;
  const focusCount = tasks.filter((task) => task.priority === "focus" && !task.done).length;

  function updateTasks(nextTasks) {
    setTasks(nextTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
  }

  function addTask(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    updateTasks([
      {
        id: createId(),
        title: trimmedTitle,
        priority,
        done: false,
      },
      ...tasks,
    ]);

    setTitle("");
    setPriority("focus");
  }

  function toggleTask(id, done) {
    updateTasks(tasks.map((task) => (task.id === id ? { ...task, done } : task)));
  }

  function deleteTask(id) {
    updateTasks(tasks.filter((task) => task.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="Today Board">
        <header className="topbar">
          <div>
            <p className="eyebrow">Daily planner</p>
            <h1>Today Board</h1>
          </div>
          <div className="date-chip">{todayDate}</div>
        </header>

        <section className="stats" aria-label="Task summary">
          <Stat value={doneCount} label="Done" />
          <Stat value={openCount} label="Open" />
          <Stat value={focusCount} label="Focus" />
        </section>

        <form className="task-form" onSubmit={addTask}>
          <label className="sr-only" htmlFor="taskInput">
            New task
          </label>
          <input
            id="taskInput"
            type="text"
            placeholder="Add something worth doing..."
            autoComplete="off"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <select
            aria-label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="focus">Focus</option>
            <option value="soon">Soon</option>
            <option value="later">Later</option>
          </select>
          <button type="submit">Add</button>
        </form>

        <nav className="filters" aria-label="Task filters">
          {filters.map((filter) => (
            <button
              className={activeFilter === filter ? "active" : ""}
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </nav>

        <ul className="task-list" aria-live="polite">
          {visibleTasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))}
        </ul>

        <p className={`empty-state ${visibleTasks.length === 0 ? "visible" : ""}`}>
          Your board is clear. Add a task to begin.
        </p>
      </section>
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

function Task({ task, onToggle, onDelete }) {
  return (
    <li className={`task-card ${task.done ? "done" : ""}`}>
      <label>
        <input
          type="checkbox"
          checked={task.done}
          onChange={(event) => onToggle(task.id, event.target.checked)}
        />
        <span className="task-title">{task.title}</span>
      </label>
      <span className={`priority-pill ${task.priority}`}>{task.priority}</span>
      <button className="delete-btn" type="button" aria-label="Delete task" onClick={() => onDelete(task.id)}>
        ×
      </button>
    </li>
  );
}
