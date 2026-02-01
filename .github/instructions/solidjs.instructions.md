---
applyTo: "**"
description: 'Instructions for GitHub Copilot in SolidJS projects.'
---
## Copilot Instructions — SolidJS

> Instruction guide for GitHub Copilot in this SolidJS project.  
> Assume the model **knows React** but **does not know SolidJS**.

---

### 📘 General Principles

1. **SolidJS is not React**
   - Components **do not re-render** automatically when signals change.
   - JSX is compiled to **static reactive code**, not interpreted at runtime.
   - No virtual DOM or diffing.

2. **Avoid React Mental Models**
   - Do not use React hooks like `useState`, `useEffect`, etc.
   - SolidJS uses **signals (`createSignal`)**, **memos (`createMemo`)**, and **effects (`createEffect`)**.
   - Components are pure functions that run **only once**, not on every update.

---

### ⚠️ Common Mistakes for React Developers

| Mistake | Correct in Solid |
|---------|------------------|
| Destructuring `props` | Use `props.x` directly. |
| Using `useState`, `useEffect` | Use `createSignal`, `createEffect`. |
| Treating signals as values | Signals are **functions**: `count()` |
| Writing `setCount(count + 1)` | Use `setCount(prev => prev + 1)` |
| Mutating arrays/objects | Always create new values. |
| Forgetting cleanup in effects | Use `onCleanup()` inside `createEffect()`. |
| Using `map` in JSX | Use `<For each={list()}>...</For>` |
| Using `list && list.map(...)` | Use `<Show when={list().length}>...</Show>` |

---

### ✅ Best Practices

#### Props
- **Never destructure `props`**:
  ```ts
  function MyComponent({ title }) { ... } // ❌ wrong
  ```
  Correct approach:
  ```ts
  function MyComponent(props) {
    return <h1>{props.title}</h1>;
  }
  ```

#### Signals
- Use `createSignal` for values that can change:
  ```ts
  const [count, setCount] = createSignal(0);
  setCount(count() + 1);
  ```

#### Derived Values
- Use `createMemo` for calculations:
  ```ts
  const double = createMemo(() => count() * 2);
  ```

#### Effects
- Use `createEffect` for side effects:
  ```ts
  createEffect(() => {
    console.log("Count changed:", count());
  });
  ```

#### Cleanup
- Always use `onCleanup` inside effects:
  ```ts
  createEffect(() => {
    const id = setInterval(...);
    onCleanup(() => clearInterval(id));
  });
  ```

#### Reactive Structures
- Use `<For>`, `<Show>`, `<Switch>`, and `<Match>` instead of plain JS expressions:
  ```ts
  <For each={items()}>
    {item => <ItemCard item={item} />}
  </For>

  <Show when={isLoading()} fallback={<p>Done!</p>}>
    <p>Loading...</p>
  </Show>
  ```

#### Events
- Handlers receive native DOM events:
  ```ts
  <button onClick={() => setCount(count() + 1)}>+</button>
  ```

#### Scoped Reactivity
- Reactivity is **fine-grained** — only what depends on a signal is re-run.

---

### 🧩 Recommended Structure

```ts
import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";

export function Counter() {
  const [count, setCount] = createSignal(0);
  const double = () => count() * 2;

  createEffect(() => {
    console.log("Count changed:", count());
  });

  onCleanup(() => console.log("Unmounted"));

  return (
    <div>
      <p>Value: {count()} (Double: {double()})</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

---

### 🧱 Patterns to Follow

- Prefer:
  - `createSignal` over `useState`.
  - `createEffect` over `useEffect`.
  - `createMemo` over `useMemo`.
  - `<For>` over `.map()`.
  - `<Show>` over `&&` or ternaries.
- Always call signals **with parentheses**.
- Avoid destructuring `props`.
- Clean up effects with `onCleanup`.
- Avoid components inside effects.
- Avoid `async` directly in components — use `createResource` or `onMount` for async tasks.

---

### 🧠 Context Tips

- SolidJS components run **only once** — avoid creating signals repeatedly.
- **State is persistent** via signals, not ephemeral like in React.
- Reactivity is **bottom-up**, not **top-down**.

---

### 🚫 Anti-Patterns

```ts
// ❌ Destructuring props
function Card({ title }) { return <h2>{title}</h2>; }

// ❌ Treating signals as values
setCount(count + 1);

// ❌ Effects without cleanup
createEffect(() => {
  window.addEventListener("resize", onResize);
});

// ❌ map in JSX
{list().map(item => <Item {...item} />)}
```

---

### ✅ Correct Patterns

```ts
function Card(props) {
  return <h2>{props.title}</h2>;
}

setCount(prev => prev + 1);

createEffect(() => {
  window.addEventListener("resize", onResize);
  onCleanup(() => window.removeEventListener("resize", onResize));
});

<For each={list()}>
  {item => <Item {...item} />}
</For>
```

---

### 📚 Recommended Reading

- [SolidJS Docs — Reactivity](https://www.solidjs.com/docs/latest#reactivity)
- [Solid Patterns and Anti-Patterns](https://www.solidjs.com/guides/reactivity)
- [From React to Solid — Mindset Shift](https://www.solidjs.com/guides/comparison#react)

---

### 🏗️ Architecture & Code Organization

#### Module Structure
- **Single Responsibility Principle (SRP)**: Each module should have one clear purpose.
  - Components → Rendering and composition only
  - Hooks → State management and interactions
  - Utils → Pure functions (no side effects)
  - Types → TypeScript definitions
  - Constants → Shared configuration values

#### File Organization Pattern
```
feature/
├── index.ts              # Public API (exports)
├── types.ts              # TypeScript definitions
├── constants.ts          # Configuration values
├── Component.tsx         # Main component
├── SubComponent.tsx      # Child components
├── useFeature.ts         # Custom hooks
└── utils/
    ├── featureUtils.ts   # Pure utility functions
    └── calculations.ts   # Business logic
```

#### Best Practices
1. **No Barrel Files**: Import directly from file paths, never use re-export index files.
   ```ts
   // ❌ Avoid
   export * from './components'
   
   // ✅ Correct
   export { SpecificComponent } from './SpecificComponent'
   ```

2. **Modular Extraction**: When a component exceeds ~100 lines:
   - Extract complex logic to utils
   - Split large components into smaller ones
   - Create dedicated hooks for stateful logic
   - Use constants for magic numbers/strings

3. **Pure Functions First**: Extract testable pure functions:
   ```ts
   // ✅ Pure, testable
   export function calculateWidth(element: HTMLElement): number {
     const computed = getComputedStyle(element)
     return parseFloat(computed.width)
   }
   
   // ❌ Side effects, hard to test
   function updateWidth() {
     document.querySelector('.cell')!.style.width = '100px'
   }
   ```

4. **JSDoc Everything**: Document all exported functions, types, and components:
   ```ts
   /**
    * Calculates the optimal column width based on content.
    * @param columnIndex - Zero-based column index
    * @param rows - Array of row data
    * @returns Width in pixels
    */
   export function autoSizeColumn(columnIndex: number, rows: unknown[][]): number {
     // ...
   }
   ```

---

### 🧪 Testability Guidelines

- Extract DOM operations into separate functions
- Use dependency injection for external dependencies
- Keep functions pure when possible
- Avoid inline complex logic in JSX

#### Example: Before and After

```ts
// ❌ Hard to test
<div onDblClick={() => {
  const col = columnIndex()
  const cells = document.querySelectorAll(`[data-col="${col}"]`)
  let maxWidth = 0
  cells.forEach(cell => {
    const width = cell.getBoundingClientRect().width
    if (width > maxWidth) maxWidth = width
  })
  setColWidth(col, maxWidth)
}}>

// ✅ Easy to test
<div onDblClick={() => autoSizeColumn(columnIndex())}>

// In utils/columnUtils.ts
export function autoSizeColumn(columnIndex: number) {
  const maxWidth = calculateMaxWidth(columnIndex)
  setColWidth(columnIndex, maxWidth)
}

export function calculateMaxWidth(columnIndex: number): number {
  const cells = document.querySelectorAll(`[data-col="${columnIndex}"]`)
  return Math.max(...Array.from(cells).map(c => c.getBoundingClientRect().width))
}
```

---

### 🛠️ Code Quality Checklist

Before committing, ensure:

- [ ] No prop destructuring in components
- [ ] All signals called with `()`
- [ ] `createMemo` for derived values
- [ ] `onCleanup` in all effects
- [ ] `<For>` instead of `.map()`
- [ ] `<Show>` instead of `&&` or ternary
- [ ] JSDoc on all exports
- [ ] No barrel files (`export *`)
- [ ] Pure functions in utils
- [ ] Constants extracted from code
- [ ] TypeScript strict mode passing
- [ ] No `any` types (use `unknown` if needed)

### 🚀 Scripts

Use the package scripts in `frontend/package.json`. The canonical single command for CI and local verification is:

  ```bash
  npm run check
  ```

For quick local type-only checks, use:

  ```bash
  npm run type-check
  ```

---

### 🎯 Refactoring Triggers

Refactor when you see:

1. **Component > 150 lines**: Extract sub-components or hooks
2. **Function > 50 lines**: Break into smaller functions
3. **Duplicated code**: Extract to utils
4. **Magic numbers/strings**: Move to constants
5. **Complex inline logic**: Extract to named functions
6. **Tight coupling**: Use dependency injection
7. **Hard to test**: Separate pure logic from side effects

---

### 🧠 Reminder for Copilot

> Generate idiomatic SolidJS code. Avoid React-adapted patterns.
> Prioritize clarity, explicit reactivity, and fine-grained granularity.  
> Avoid complex abstractions, custom hooks, or React-like patterns.  
> When generating code:
> 1. Start with types and constants
> 2. Extract pure functions to utils
> 3. Keep components focused on rendering
> 4. Document everything with JSDoc
> 5. Make code testable by design
