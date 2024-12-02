const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const addContact = document.getElementById('addContact');

const addContactBtn = document.getElementById('addContactBtn');

const userInfo = document.getElementById('userInfo');
const messageScreen = document.getElementById('messageScreen');

const serverURL = 'http://localhost:3000';

let contacts = [
    {
        id: 1000,
        name: 'John Doe',
        username: 'johndoe',
        messages: [
            {
                content: 'Hello, John',
                time: '2023-06-01T12:34:56.789Z',
                from: 'me'
            },
            {
                content: 'Hello, Ali',
                time: '2023-06-01T12:37:56.789Z',
                from: 'not-me'
            }
        ]
    },
    {
        id: 1001,
        name: 'Jane Doe',
        username: 'janedoe',
        messages: [
            {
                content: 'Hello, Jane',
                time: '2023-06-01T10:34:56.789Z',
                from: 'me'
            },
            {
                content: 'Hello, Ali',
                time: '2023-06-01T11:34:56.789Z',
                from: 'not-me'
            },
        ]
    }
];

async function checkStatus(id, callback) {
    try {
        const response = await fetch(`${serverURL}/checkStatus?id=${id}`);
        if (!response.ok) {
            callback('Unknown');
            return;
        }
        try {
            const result = await response.json();
            if (result === 'offline') {
                callback('Offline', 'red');
            } else {
                callback('Online', 'green');
            }
        } catch (err) {
            callback('Unknown', 'yellow');
            console.log("Error parsing JSON:", err);
        }
    } catch (err) {
        callback('Unknown', 'yellow');
        console.log("Error making request:", err);
    }
}

function makeContactElement(contact) {
    const loadingIcon = `<span><svg id="loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"       width="15" height="15"><circle cx="50" cy="50" r="35" stroke="#fff" stroke-width="10" fill="none" stroke-dasharray="220" stroke-dashoffset="0"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite" /><animate attributeName="stroke-dashoffset" values="220;110;220" dur="1s" repeatCount="indefinite" /></circle></svg></span>`;

    const name = document.createElement('div');
    name.classList.add('name');
    name.innerText = contact.name;

    const status = document.createElement('div');
    status.classList.add('status');
    checkStatus(contact.id, (result, color) => {
        status.innerHTML = `Status : ${result}`;
        status.style.color = color;
    });
    status.innerHTML = `Status : ${loadingIcon}`;

    const username = document.createElement('div');
    username.classList.add('username');
    username.innerText = contact.username;

    const button = document.createElement('button');
    button.classList.add('contact');
    button.onclick = () => {
        checkStatus(contact.id, (result, color) => {
            status.innerHTML = `Status : ${result}`;
            status.style.color = color;
        })
        showMessages(contact.messages);
    }

    button.appendChild(name);
    button.appendChild(status);
    button.appendChild(username);

    return button;
}

function makeMessageElement(message) {
    const container = document.createElement('div');
    container.innerText = message.content;
    return container;
}

function loadContacts(contacts) {
    let contactsElement = document.getElementById('contacts');
    contactsElement.innerHTML = '';
    contacts.forEach(contact => {
        contactsElement.appendChild(makeContactElement(contact));
    })
}


function showMessages(messages) {

    const messageElement = document.getElementById('messages');

    userInfo.classList.add('hidden');
    messageScreen.classList.remove('hidden');

    messageElement.innerHTML = '';

    messages.forEach(message => {
        messageElement.appendChild(makeMessageElement(message));
    });
}

function closeMessageScreen() {
    userInfo.classList.remove('hidden');
    messageScreen.classList.add('hidden');
}

loadContacts(contacts);

const myData = null;

// electronAPI.onRecieveData(data => {
//     myData = data;
//     loadContacts(myData.contacts);
// });

addContactBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Hide modal when close button is clicked
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Add a new contact
addContact.addEventListener('click', () => {

});

// Hide modal when clicking outside of it
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};