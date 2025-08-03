import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6 p-6">
    <div class="flex gap-4">
      <a href="https://vite.dev" target="_blank" class="transition hover:scale-105">
        <img src="${viteLogo}" class="logo w-20 h-20 drop-shadow-xl" alt="Vite logo" />
      </a>
      <a href="https://www.typescriptlang.org/" target="_blank" class="transition hover:scale-105">
        <img src="${typescriptLogo}" class="logo vanilla w-20 h-20 drop-shadow-xl" alt="TypeScript logo" />
      </a>
    </div>

    <h1 class="text-5xl font-extrabold text-blue-600 drop-shadow-sm text-center">
      Vite + TypeScript + Tailwind
    </h1>

    <div class="card bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center space-y-4">
      <button
        id="counter"
        type="button"
        class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition duration-300"
      >
        Compteur Tailwind
      </button>
      <p class="text-gray-600 italic">
        Si le bouton a un **dégradé** et un **hover fluide**, Tailwind fonctionne ✔️
      </p>
    </div>

    <p class="text-sm text-gray-500 animate-pulse">
      Tailwind est bien chargé 🎉
    </p>
  </div>
`


setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
