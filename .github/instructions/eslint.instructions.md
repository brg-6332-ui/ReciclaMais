---
applyTo: '**'
description: 'Guidelines for GitHub Copilot to generate code compliant with the project ESLint and Prettier configuration.'
---
## 🧭 Copilot Coding Guidelines (Optimized)

Guidelines for GitHub Copilot to produce **TypeScript + SolidJS** code fully compliant with **ESLint** and **Prettier** settings.

---

## 🧩 Project Context
- Environment: browser-based.  
- Sources: `src/**/*.ts(x)`.  
- `process` and `NodeJS` are readonly globals.  
- Mixed CJS/ESM only allowed in config files.

---

## ⚙️ Prettier Formatting Rules

| Setting | Value |
|----------|--------|
| printWidth | 80 |
| tabWidth | 2 |
| singleQuote | true |
| trailingComma | all |
| arrowParens | always |
| semi | false |
| endOfLine | auto |

**Practical rules**
- Use `'` not `"`.  
- No semicolons.  
- Always include trailing commas.  
- Wrap arrow params:  
  ```ts
  items.map((x) => x.value)
  ```

---

## 🧱 ESLint Compliance

### Must Follow
- **Strict equality:** use `===` / `!==`.  
- **Solid reactivity:** don’t destructure signals; use accessors.  
- **Import sorting:** group + alphabetize via `simple-import-sort`.  
- **Import resolution:** ensure all paths resolve.  
- **Type safety:** avoid `any`; favor explicit types.  
- **Accessibility:** follow `jsx-a11y` rules.

---

## 🧭 Import Example

❌ Bad
```ts
import Button from './Button'
import { createSignal } from 'solid-js'
import React from 'react'
```

✅ Good
```ts
import { createSignal } from 'solid-js'

import Button from './Button'
```

---

## 🚫 Avoid
- Unused imports/variables.  
- Destructuring signals.  
- Implicit `any`.  
- `==` / `!=`.  
- Code outside `src/` (except config).  
- Ignoring Prettier rules.  

---

## 💡 Copilot Behavior
- Generate **readable, reactive, type-safe** SolidJS code.  
- Use `createSignal`, `createEffect`, proper JSX idioms.  
- Keep imports sorted.  
- Output must pass ESLint + Prettier **without autofix**.  
