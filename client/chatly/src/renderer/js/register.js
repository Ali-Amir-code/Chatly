const registerForm = document.getElementById('registerForm');
const usernameInputField = document.getElementById('username');
const infoElement = document.querySelector('#info p');
const loader = document.getElementById('loader');
const formSubmitButton = document.getElementById('submitButton');

let controller = null;
let isUserAvailable = false;

registerForm.addEventListener('submit', async (e) => {
    console.log("form submitted");
    e.preventDefault();
});

const getSignal = () => {
    if (controller) {
        controller.abort();
    }
    controller = new AbortController();
    return controller.signal;
};

const checkUsernameAvailability = async (username) => {
    const signal = getSignal();
    try {
        const response = await fetch(
            `http://localhost:3000/checkUsernameAvailability?username=${encodeURIComponent(username)}`, 
            { signal }
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result.available;
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('Request aborted');
        } else {
            console.error('Error checking username:', err);
        }
        return undefined;
    }
};

const showLoader = () => {
    loader.style.display = 'inline';
};

const hideLoader = () => {
    loader.style.display = 'none';
};

const showInfo = (text, color) => {
    infoElement.innerText = text;
    infoElement.style.color = color;
};

const hideInfo = () => {
    infoElement.innerText = '';
    infoElement.style.color = '';
};

// Function to validate the username
const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/; // Only alphabets, numbers, and underscores
    return usernameRegex.test(username);
};

usernameInputField.addEventListener('input', async (e) => {
    const username = e.target.value.trim();
    if (!username) {
        hideLoader();
        hideInfo();
        return;
    }

    // Validate username
    if (!isValidUsername(username)) {
        hideLoader();
        showInfo('Username can only contain letters, numbers, and underscores', 'red');
        return;
    }

    showLoader();
    showInfo('Checking Username Availability', 'white');

    const result = await checkUsernameAvailability(username);

    hideLoader();

    // Ensure the input hasn't changed while waiting for the result
    if (username !== e.target.value.trim()) {
        return;
    }

    if (result) {
        isUserAvailable = true;
        showInfo('Username is available', 'lightgreen');
        formSubmitButton.disabled = false;
    } else if (result === false) {
        isUserAvailable = false;
        showInfo('Username is not available', 'red');
        formSubmitButton.disabled = true;
    } else {
        isUserAvailable = false;
        showInfo('Something went wrong', 'orange');
        formSubmitButton.disabled = true;
    }
});