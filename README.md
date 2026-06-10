<div align="center">
    <h1>FSA Toolkit</h1>
    <p><strong>A browser-based editor and simulator for Finite State Automata.</strong></p>
</div>

<p align="center">
    <a href="https://fsa-toolkit.jacopocalvi.com">
        <img src="https://img.shields.io/badge/available_here-blueviolet?logo=netlify" alt="Website" />
    </a>
    <a href="https://apiwatch.eu/status/6fb0f36e-42be-446c-b995-80dd03cf4c02">
        <img src="https://img.shields.io/website?url=http%3A//fsa-toolkit.jacopocalvi.com&label=status&up_message=online&up_color=brightgreen&down_message=offline&down_color=red" alt="Status" />
    </a>
    <a href="LICENSE">
        <img src="https://img.shields.io/badge/license-GPL--3.0-blue.svg" alt="License" />
    </a>
</p>

![Small demo of the editor](readme-app-demo.avif)

## Features

- **Four automaton types supported** — DFA, NFA, PDA, and DPDA.
- **Step-by-step simulation** — compute an input, then select a path from a list of accepting and rejecting paths to see a step-by-step visualisation of how the input is processed by the automaton.
- **FSA operations** — NFA to DFA, DFA minimisation, FSA to Regex.
- **Transition table** — view the corresponding transition table.
- **Export to various formats** — SVG, LaTeX, save/load to/from disk as `.fsa` file.
- **Persistence between sessions** — the application state is auto-saved to localStorage, persisting windows layout and automaton between sessions.
- **Light and dark themes** — adjusted according to your browser settings.

## Try it out yourself!

**Live app:** [fsa-toolkit.jacopocalvi.com](https://fsa-toolkit.jacopocalvi.com)

**Manual:** [fsa-toolkit.jacopocalvi.com/manual](https://fsa-toolkit.jacopocalvi.com/manual)

## About

I built this as my university final year project. The main objective was to create a helpful tool to support students learning automata theory, providing an interactive environment for designing automata, testing inputs, and visualising how inputs are processed by the automaton.

This is heavily inspired by two projects:

- **[Excalidraw](https://excalidraw.com/)** — my go-to for wireframing, sketching and pretty much anything involving drawing. I absolutely love its UI and UX, so I was very influenced by its design.
- **[FSM Designer](https://madebyevan.com/fsm/)** — my favorite automaton editor, which helped me greatly when I was learning about automata. I very much appreciate its simplicity and ease of use. I wanted to provide a similar drawing experience.

The project is far from perfect: there are many quirks I am aware of, there are always more features to add, and the codebase, well, I tried my best! That said, I am overall very happy and proud with how it turned out. I'd be delighted to know if anyone out there finds this useful, please don't hesitate to reach out if you have any questions or suggestions!

## Built with

- [SvelteKit](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Anime.js](https://animejs.com/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)

## How to run locally

### Requirements

- [Node.js](https://nodejs.org/) (v22 or higher)

### Commands

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

## Codebase overview

> Beware: parts of the codebase are messier than I'd like and could use a refactor. I tried my best, but this was very much a learn as you go experience for me.

### Main components

- `src/lib/stores/app.svelte.ts` — Singleton app store, grouping main app state in one place.
- `src/lib/automata-models/` — Core components of the automaton, handling their data and state.
- `src/lib/graph-rendering/` — Logic and components to display the automaton on screen.
- `src/lib/editor/` — The bulk of the logic of the app (commands, state management, etc.).
- `src/lib/simulation/` — Logic for computing an input and animating the automaton.
- `src/lib/fsa-operations/` — Important operations such as converting to and from regex.

### Pages

- `src/routes/(app)` — The main application interface. Accessible at `/`.
- `src/routes/manual` — The user manual.
