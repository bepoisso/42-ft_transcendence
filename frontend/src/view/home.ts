export function renderHome() {
  document.getElementById("app")!.innerHTML = `
    <video autoplay muted loop playsinline class="fixed top-0 left-0 w-screen h-screen object-cover z-[-1]">
      <source src="../assets/background.mp4" type="video/mp4" />
    </video>

	<div class="z-10 flex flex-col items-center space-y-10 relative h-screen justify-center">
	  <h1 class="md:text-[6rem] text-[4rem] font-[400] pointer-events-none drop-shadow-md text-white">
		PONG
	  </h1>
  <div class="flex gap-6">
    <a
      href="/login"
      data-link
      class="bg-white bg-opacity-10 hover:bg-opacity-30 !text-black no-underline visited:!text-black hover:!text-black border border-white px-6 py-3 rounded-md transition-all duration-200"
    >
      Sign In
    </a>
    <a
      href="/register"
      data-link
      class="bg-white bg-opacity-10 hover:bg-opacity-30 !text-black no-underline visited:!text-black hover:!text-black border border-white px-6 py-3 rounded-md transition-all duration-200"
    >
      Register
    </a>
  </div>
</div>
  `;
}

