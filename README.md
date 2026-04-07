# FSA Toolkit

Welcome to my humble project, built using:

- [SvelteKit](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Anime.js](https://animejs.com/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)

## Requirements

- [Node.js](https://nodejs.org/) (v22 or higher)

## How to Use

Here are some useful commands:

```sh
# install dependencies
npm install

# start a development server
npm run dev

# run tests (via Vitest, with hot-reloading)
npm run test

# make production build
npm run build

# run a preview of the build (useful for local testing of production build)
npm run preview
```

## Core Components

- `src/lib/stores/app.svelte.ts`: Singleton app store, grouping main app state in one place.
- `src/lib/automata-models/`: Core components of the automaton, handling their data and state.
- `src/lib/graph-rendering/`: Logic and components to display the automaton on screen.
- `src/lib/editor/`: The bulk of the logic of the app (commands, state management, etc.).
- `src/lib/simulation/`: Logic for computing an input and animating the automaton.
- `src/lib/fsa-operations/`: Important operations such as converting to and from regex.

## Pages

- `src/routes/(app)`: The main application interface (contains the editor and everything else automaton-related). The part inside the parentheses is ignored by the router, so this page is just accessible as root path (`/`).
- `src/routes/manual`: The manual for the app.
