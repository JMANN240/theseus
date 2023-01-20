const block_button = document.querySelector('#block-button');
const single_button = document.querySelector('#single-button');
const text_button = document.querySelector('#text-button');

block_button.addEventListener('click', () => {
    window.location.href = "/block";
});

single_button.addEventListener('click', () => {
    window.location.href = "/single";
});

text_button.addEventListener('click', () => {
    window.location.href = "/text";
});