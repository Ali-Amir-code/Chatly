document.addEventListener('DOMContentLoaded', () => {
    const addContactBtn = document.getElementById('addContactBtn');
    const closeModal = document.getElementById('closeModal');
    const modal = document.getElementById('modal');
    const addContact = document.getElementById('addContact');
    let contactsDiv = document.getElementById('contacts');

    // Ensure modal is hidden on page load
    modal.style.display = 'none';

    // Show modal when "Add Contact" button is clicked
    addContactBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Hide modal when close button is clicked
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Add a new contact
    addContact.addEventListener('click', () => {
        const contactName = document.getElementById('contactName').value;
        const contactID = document.getElementById('contactID').value;

        if (contactName && contactID) {
            let contactButton = document.createElement('button');
            contactButton.classList.add('contact');
            contactButton.innerText = contactName;
            contactButton.onclick = () => showMessages(contactID);

            contactsDiv.appendChild(contactButton);

            contacts[contactID] = [];

            document.getElementById('contactName').value = '';
            document.getElementById('contactID').value = '';

            modal.style.display = 'none';
        }
    });

    // Hide modal when clicking outside of it
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});

let contacts = {
    "contact1": ["Hello John!", "How are you?"],
    "contact2": ["Hi Jane!", "Good morning!"]
};

function showMessages(contactID) {
    const userInfo = document.getElementById('userInfo');
    const messageScreen = document.getElementById('messageScreen');

    userInfo.classList.add('hidden');
    messageScreen.classList.remove('hidden');

    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';

    contacts[contactID].forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messagesDiv.appendChild(messageElement);
    });
}
