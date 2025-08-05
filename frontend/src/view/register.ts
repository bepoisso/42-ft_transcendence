export function renderRegister() {
  document.getElementById("app")!.innerHTML = `

<body class="m-0 p-0 h-screen overflow-hidden relative flex items-center justify-center">
  <!-- Vidéo en arrière-plan -->
  <video autoplay muted loop playsinline class="absolute top-0 left-0 w-full h-full object-cover z-[-1]">
    <source src="../assets/background.mp4" type="video/mp4" />
  </video>

  <!-- Section centrée -->
<div class="z-10 flex flex-col items-center space-y-10">
  <div class="border-2 border-dashed border-gray-400 rounded-lg p-4 w-full max-w-md mx-auto mt-4">
    <h2 class="mb-8 text-xl font-bold text-white">New Player</h2>

    <form id="new-player-form" class="flex flex-col">
      <div class="flex flex-col mb-6">
        <label class="mb-1 font-semibold text-white" for="name">Name:</label>
        <input id="name" class="px-2 py-1 rounded bg-gray-800 text-white" type="text" placeholder="Name" />
      </div>

      <div class="flex flex-col mb-6">
        <label class="mb-1 font-semibold text-white" for="firstName">First name:</label>
        <input id="firstName" class="px-2 py-1 rounded bg-gray-800 text-white" type="text" placeholder="First name" />
      </div>

      <div class="flex flex-col mb-6">
        <label class="mb-1 font-semibold text-white" for="pseudo">Pseudo:</label>
        <input id="pseudo" class="px-2 py-1 rounded bg-gray-800 text-white" type="text" placeholder="Spike" />
      </div>

      <div class="flex flex-col mb-6">
        <label class="mb-1 font-semibold text-white" for="email">Email:</label>
        <input id="email" class="px-2 py-1 rounded bg-gray-800 text-white" type="email" placeholder="exemple@exemple.com" />
      </div>

      <div class="flex flex-col mb-6">
        <label class="mb-1 font-semibold text-white" for="password">Password:</label>
        <input id="password" class="px-2 py-1 rounded bg-gray-800 text-white" type="password" placeholder="pass123" />
      </div>

      <p id="error-message" class="text-red-500 mt-2"></p>

      <button type="submit" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Register
      </button>
    </form>

    <script type="module" src="../dist/main.js"></script>

  </div>
</div>

`;
}
