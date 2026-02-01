---
applyTo: '**'
description: 'solid-motionone — LLM summary'
---
## solid-motionone — LLM Summary

**solid-motionone** is a lightweight (~5.8kb) library for SolidJS that adapts **Motion One** for smooth, reactive animations. It exposes `Motion` and `Presence` components, leveraging SolidJS’s reactivity and Motion One’s high-performance animation primitives.

---

### Installation

- **npm**: `npm install solid-motionone`
- **pnpm**: `pnpm add solid-motionone`
- **yarn**: `yarn add solid-motionone`

---

### Core Concepts & API

#### `Motion` Component
- **Default**: Renders a `div`, but can be customized (e.g. `Motion.button`).
- **Props**:
  - `animate`: CSS/transform properties or signals (e.g., `backgroundColor: bg()`).
  - `initial`: Initial state; set to `false` to disable enter animation.
  - `exit`: Defines exit animation (used with `Presence`).
  - `transition`: Global or per-property transition settings.
  - `tag`: Custom HTML tag for the component.

#### `Presence` Component
- Animates elements on exit when removed from the DOM (works with `<Show>`).
  - **Props**: `exitBeforeEnter` (ensures exit animation runs before entry).

---

### Behavior Notes

- **Keyframes**: Use arrays in `animate` for keyframe sequences; control timing with `transition.<prop>.offset`.
- **Reactivity**: Use concrete values or signals in `animate`. Example: `animate={{ backgroundColor: bg() }}`.
- **Enter Animations**: By default, elements animate to `animate` values on creation. Set `initial={false}` to disable.
- **Exit Animations**: Provide `exit` values in `Motion`, wrap with `Presence` and Solid’s `<Show>`.

---

### Minimal Examples

1. **Basic Animating `div` (Fade In)**:
   ```ts
   import { Motion } from 'solid-motionone'

   function Example() {
     return <Motion.div animate={{ opacity: [0, 1] }} transition={{ duration: 0.8 }} />
   }
   ```

2. **Reactive Animation (Signal)**:
   ```ts
   import { createSignal } from 'solid-js'
   import { Motion } from 'solid-motionone'

   function ReactiveExample() {
     const [bg, setBg] = createSignal('red')
     return (
       <Motion.button onClick={() => setBg('blue')} animate={{ backgroundColor: bg() }} transition={{ duration: 0.5 }}>
         Click me
       </Motion.button>
     )
   }
   ```

3. **Keyframes with Offsets**:
   ```ts
   <Motion animate={{ x: [0, 100, 50] }} transition={{ x: { offset: [0, 0.25, 1] } }} />
   ```

4. **Presence & Exit Example**:
   ```ts
   import { createSignal, Show } from 'solid-js'
   import { Motion, Presence } from 'solid-motionone'

   function App() {
     const [isShown, setShow] = createSignal(true)
     return (
       <div>
         <Presence exitBeforeEnter>
           <Show when={isShown()}>
             <Motion
               initial={{ opacity: 0, scale: 0.6 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.6 }}
               transition={{ duration: 0.3 }}
             />
           </Show>
         </Presence>
         <button onClick={() => setShow((p) => !p)}>Toggle</button>
       </div>
     )
   }
   ```

---

### Notes / Gotchas

- `animate` does not accept accessor functions directly. Always call signals (e.g., `animate={{ x: pos() }}`).
- No global CSS required. MotionOne uses the Web Animations API where supported, falling back gracefully.
- Size: ~5.8kb, minimal integration layer, delegates complex tasks to Motion One.

---

### Links

- [GitHub Repo](https://github.com/solidjs-community/solid-motionone)
- [NPM Package](https://www.npmjs.com/package/solid-motionone)
- [Motion One (upstream)](https://motion.dev/)

---

### License

MIT
