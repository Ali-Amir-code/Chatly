const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const addContactModalBtn = document.getElementById('addContact');
const contactIdInput = document.getElementById('contactID');

const infoBox = document.getElementById('infoBox');

const addContactBtn = document.getElementById('addContactBtn');

const userInfo = document.getElementById('userInfo');
const messageScreen = document.getElementById('messageScreen');

const messageInputField = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

const messagesContainer = document.getElementById('messages');

const serverURL = 'http://localhost:3000';

let selectedContactId;

let myData = {
    me: {},
    contacts: []
};

// const electronAPI = {
//     onReceiveData: () => {},
//     onRecieveMessage: () => {},
//     onRecieveNotification: () => {}
// };

electronAPI.onReceiveData(data => {
    myData = data;
    displayInfo(myData.me);
    loadNotifications(myData.me.notifications);
    loadContacts(myData.contacts);
});

electronAPI.onRecieveMessage(message => {
    addMessage(message, false, false);
});

electronAPI.onRecieveNotification(notification => {
    myData.me.notifications.push(notification);
    addNotification(notification);
});

function displayInfo(data) {
    const infoElement = document.getElementById('userInfoContainer');
    const heading = document.createElement('h2');
    const userInfo = document.createElement('div');

    userInfo.classList.add('userInfo');

    heading.innerHTML = `Welcome to Chatly <span class="highlight">${data.name}!`;
    userInfo.innerHTML = `Your ID is <span class="highlight">${data.id}</span> and your username is <span class="highlight">@${data.username}</span> remember this as it will be used by other users to add you as a contact`;

    infoElement.appendChild(heading);
    infoElement.appendChild(userInfo);
}


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

contactIdInput.addEventListener('input', () => {
    const value = contactIdInput.value;

    const contactModalInfoBox = document.getElementById('contactModalInfoBox');

    if (value === '' || (!isNaN(value) && Number.isInteger(Number(value)))) {
        addContactModalBtn.disabled = false;
        contactModalInfoBox.innerHTML = '';
    } else {
        contactModalInfoBox.innerHTML = 'Please enter a valid ID';
        addContactModalBtn.disabled = true;
    }
});

function makeContactElement(contact) {
    console.log(contact);
    const loadingIcon = `<span><svg id="loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="15" height="15"><circle cx="50" cy="50" r="35" stroke="#fff" stroke-width="10" fill="none" stroke-dasharray="220" stroke-dashoffset="0"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite" /><animate attributeName="stroke-dashoffset" values="220;110;220" dur="1s" repeatCount="indefinite" /></circle></svg></span>`;

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
        selectedContactId = contact.id;
        checkStatus(contact.id, (result, color) => {
            status.innerHTML = `Status : ${result}`;
            status.style.color = color;
        });
        messagesContainer.innerText = '';
        showMessages(contact.messages);
    }

    button.appendChild(name);
    button.appendChild(status);
    button.appendChild(username);

    return button;
}

function makeMessageElement(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message.content;
    messageElement.classList.add('message');
    if (message.isFromMe) {
        messageElement.classList.add('right');
    } else {
        messageElement.classList.add('left');
    }
    return messageElement;
}

function loadContacts(contacts) {
    let contactsElement = document.getElementById('contacts');
    contactsElement.innerHTML = '';
    contacts.forEach(contact => {
        contactsElement.appendChild(makeContactElement(contact));
    })
}


function showMessages(messages) {
    userInfo.classList.add('hidden');
    messageScreen.classList.remove('hidden');

    messagesContainer.innerHTML = '';
    messages.forEach(message => {
        messagesContainer.appendChild(makeMessageElement(message));
    });
}

function closeMessageScreen() {
    selectedContactId = null;
    userInfo.classList.remove('hidden');
    messageScreen.classList.add('hidden');
}

function addMessage(data, isFromMe, addToMessageScreen) {
    const message = {
        content: data.content,
        time: data.time,
        isFromMe: isFromMe
    }
    myData.contacts.find(contact => contact.id === selectedContactId).messages.push(message);
    if (addToMessageScreen) {
        messagesContainer.appendChild(makeMessageElement(message));
    }
}

function showInfo(text, color = 'black', time = 5) {
    infoBox.children[0].innerText = text;
    infoBox.style.color = color;
    infoBox.style.animation = 'showInfoBoxAnimation 1s ease-in-out 0s 1 normal both';
    setTimeout(() => {
        infoBox.style.color = 'black';
        infoBox.style.animation = 'hideInfoBoxAnimation 1s ease-in-out 0s 1 normal both';
    }, time * 1000);
}

function addUserToContacts(user) {
    const contacts = document.getElementById('contacts');
}

function makeNotificationElement(notification) {
    const notificationElement = document.createElement('div');
    const notificationHead = document.createElement('h3');
    const notificationBody = document.createElement('div');
    const notificationContent = document.createElement('p');
    const buttons = document.createElement('div');

    notificationElement.classList.add('notification');
    notificationHead.classList.add('notificationHead');
    notificationBody.classList.add('notificationBody');
    notificationContent.classList.add('content');
    buttons.classList.add('buttons');

    notificationHead.innerText = notification.type;

    if (notification.type.toLowerCase() === 'request') {
        notificationContent.innerText = `${notification.sender.name} sent you a friend request`;

        const acceptButton = document.createElement('button');
        const rejectButton = document.createElement('button');

        acceptButton.classList.add('accept');
        rejectButton.classList.add('reject');

        acceptButton.innerText = 'Accept';
        rejectButton.innerText = 'Decline';

        acceptButton.onclick = () => {
            addUserToContacts(notification.sender);
            sendNotification('Response', { id: myData.me.id, name: myData.me.name, username: myData.me.username }, notification.sender.id, 'Accepted');
        }
        rejectButton.onclick = () => {
            sendNotification('Response', { id: myData.me.id, name: myData.me.name, username: myData.me.username }, notification.sender.id, 'Rejected');
        }

        buttons.appendChild(acceptButton);
        buttons.appendChild(rejectButton);

    } else if (notification.type.toLowerCase() === 'response') {
        notificationContent.innerText = `${notification.sender.name} ${notification.status} your friend request`;

        const doneButton = document.createElement('button');

        doneButton.innerText = 'Ok';

        doneButton.classList.add('done');

        if (notification.status.toLowerCase() === 'accepted') {
            addUserToContacts(notification.sender);
        }

        doneButton.onclick = () => {
            const notificationContainer = document.getElementById('notificationContainer');
            notificationContainer.removeChild(notificationElement);
        };

        buttons.appendChild(doneButton);
    }

    notificationBody.appendChild(notificationContent);
    notificationBody.appendChild(buttons);
    notificationElement.appendChild(notificationHead);
    notificationElement.appendChild(notificationBody);

    return notificationElement;
}

function addNotification(notification) {
    const notificationContainer = document.getElementById('notificationContainer');
    notificationContainer.appendChild(makeNotificationElement(notification));
}

function loadNotifications(notifications) {
    notifications.forEach(notification => {
        addNotification(notification);
    })
}

async function sendNotification(type, sender, receiverId, status = undefined) {
    console.log('in sendnotification');
    const notification = {
        type: type,
        sender: sender,
        receiverId: receiverId,
        status: status,
    }
    try {
        const response = await fetch(`${serverURL}/notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notification)
        });
        if (response.ok) {
            try {
                const result = await response.json();
                console.log(result);
                return result;
            } catch (err) {
                console.log("Error making request:", err);
                return false;
            }
        }
        return true;
    } catch (err) {
        console.log("Error making request:", err);
        return false;
    }
}

addContactBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Hide modal when close button is clicked
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});



// Add a new contact
addContactModalBtn.addEventListener('click', async () => {
    const contactID = +document.getElementById('contactID').value;
    const me = {
        id: myData.me.id,
        name: myData.me.name,
        username: myData.me.username,
    }
    if (contactID) {
        modal.style.display = 'none';
        try {
            const isSuccessful = await sendNotification('Request', me, contactID);
            if (!isSuccessful) {
                showInfo('Failed to send request', 'red');
                return;
            }
            showInfo('Your request have been sent', 'green');
        } catch (err) {
            console.log(err);
        }
    }
});

sendMessageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const messageContent = messageInputField.value.trim();
    if (messageContent) {
        const message = {
            content: messageContent,
            time: new Date(),
            to: selectedContactId,
            from: myData.me.id
        }
        addMessage(message, true, true);
        electronAPI.sendMessage(selectedContactId, message);
        messageInputField.value = '';
    }
});

// Hide modal when clicking outside of it
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

window.addEventListener('beforeunload', async () => {
    electronAPI.saveData(myData);
});