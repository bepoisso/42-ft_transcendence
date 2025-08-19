import QRCode from "qrcode";
import { Router } from "../router";

export function render2fa() {
  document.getElementById("app")!.innerHTML = `
    <div class="z-10 flex flex-col items-center space-y-10 relative h-screen justify-center">

      <h1 class="md:text-[4rem] text-[3rem] font-[400] drop-shadow-md text-white">
        Two-Factor Authentication
      </h1>

      <!-- QR Code -->
      <canvas id="qrcode" class="bg-white p-4 rounded-lg shadow-md hidden"></canvas>

      <!-- Champ pour entrer le code -->
      <form id="verify-2fa-form" class="flex flex-col items-center space-y-4 w-full max-w-sm">
        <label for="auth-code" class="text-white font-semibold">Enter your 6-digit code:</label>
        <input
          id="code"
          type="text"
          maxlength="6"
          placeholder="123456"
          class="px-3 py-2 text-center rounded bg-gray-800 text-white tracking-widest text-lg"
        />

        <button
          type="submit" id="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Verify
        </button>
      </form>

      <p id="error-message" class="text-red-500 mt-2"></p>
    </div>
  `;
}


async function generateURI():
Promise <{
	statusCode: number,
	data: {
		qr: string,
		secret: string,
		uri: string,
	}
}>
{
	const response = await fetch("/api/auth/2fa/generate", {
		method: "POST"
	});

	const data = await response.json();

	return data;
}


async function verify2fa(input: string): Promise <{statusCode: number, message: string}>
{
	const response = await fetch("/api/auth/2fa/verify", {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify({input}),
	});

	const data = await response.json();

	return data;
}


async function checkNewUser(): Promise <{statusCode: number, message: string, value:{ twofa_enable: number}}> {
	const response = await fetch("/api/auth/2fa/check", {
		method: "GET"
	});

	const data = await response.json();
	return data;
}

export async function logic2fa(router: Router)
{
	const isNew = await checkNewUser();
	console.log("ldhrgld");
	if (isNew.statusCode === 200) {
		if (isNew.value.twofa_enable === 0)
		{
			console.log("value est bon");
			const data = await generateURI();
			console.log(data);

			const qrCodeContainer = document.getElementById("qrcode");
			if (qrCodeContainer) {
				qrCodeContainer.classList.remove("hidden");
				await QRCode.toCanvas(qrCodeContainer, data.data.qr, { width: 200 });
			}
		}
	} else {
		const errorMessage = document.getElementById("error-message");
			if (errorMessage) {
				errorMessage.textContent = isNew.message;
				return;
		 }
	}

	const submit = document.getElementById("submit");
	submit?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		const code = (document.getElementById("code") as HTMLInputElement).value;
		if (!code) {
			const errorMessage = document.getElementById("error-message");
			if (errorMessage)
				errorMessage.textContent = "You must enter the 2FA code";
				return;
		}
		try {
			const verify = await verify2fa(code);
			console.log(verify);
			if (verify.statusCode === 200) {
				router.navigate("/dashboard");
			}
			else {
				const errorMessage = document.getElementById("error-message");
				if (errorMessage)
					errorMessage.textContent = "Wrong code";
				return;
			}
		} catch (err) {
				console.error("Error 2fa : ", err);
				return;
		}
	});
}

