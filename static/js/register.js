const username_input = document.querySelector('#username-input');
const password_input = document.querySelector('#password-input');
const confirm_password_input = document.querySelector('#confirm-password-input');
const submit_button = document.querySelector('#submit-button');

const url_params = new URLSearchParams(window.location.search);
const redirect = url_params.get('redirect');

submit_button.addEventListener('click', async () => {
	const login_response = await fetch("/api/register", {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: username_input.value,
			password: password_input.value,
			confirm_password: confirm_password_input.value,
		})
	});

	if (login_response.status == 400) {
		console.log("Bad credentials");
		return;
	}

	const login = await login_response.json();
	const access_token = login.accessToken;

	document.cookie = `token=${access_token}; max-age=${60*60*24}; SameSite=Lax`

	window.location.href = "/";
});