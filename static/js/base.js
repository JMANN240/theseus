const block_button = document.querySelector('#block-button');
const single_button = document.querySelector('#single-button');

block_button.addEventListener('click', () => {
    window.location.href = "/block";
});

single_button.addEventListener('click', () => {
    window.location.href = "/single";
});