const block_button = document.querySelector('#block-button');
const single_button = document.querySelector('#single-button');
const texts_button = document.querySelector('#texts-button');
const login_button = document.querySelector('#login-button');
const register_button = document.querySelector('#register-button');
const logout_button = document.querySelector('#logout-button');

block_button.addEventListener('click', () => {
    window.location.href = "/block";
});

single_button.addEventListener('click', () => {
    window.location.href = "/single";
});

texts_button.addEventListener('click', () => {
    window.location.href = "/texts";
});

login_button?.addEventListener('click', () => {
    window.location.href = "/login";
});

register_button?.addEventListener('click', () => {
    window.location.href = "/register";
});

logout_button?.addEventListener('click', () => {
    window.location.href = "/logout";
});