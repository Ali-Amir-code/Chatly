const loginForm = document.getElementById('loginForm');
const usernameInputField = document.getElementById('username');
const passwordInputField = document.getElementById('password');

loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = usernameInputField.value.trim();
    const password = passwordInputField.value;
    electronAPI.login(username,password);
});