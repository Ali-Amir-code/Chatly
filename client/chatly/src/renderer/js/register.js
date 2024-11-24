const usernameInputField = document.getElementById('username');
const infoElement = document.querySelector('#info p');
const loader = document.getElementById('loader');

let controller = null;

let checkUsernameAvailability = async (username) => {
    if(controller){
        controller.abort();
    }

    controller = new AbortController();
    const signal = controller.signal;

    try{
        const response = await fetch(`http://localhost:3000/checkUsernameAvailability?username=${username}`, {signal});

        if(!response.ok){
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        return result.available;
    } catch(err){

    }
}

usernameInputField.addEventListener('input', async (e) => {
    if(!e.target.value){
        infoElement.innerText = '';
        return;
    }
    infoElement.innerText = '';
    loader.style.display = 'block';
    let username = e.target.value.trim();
    checkUsernameAvailability(username).then((result) => {
        loader.style.display = 'none';
        if(result){
            infoElement.innerText = 'Username is available';
        }else{
            infoElement.innerText = 'Username is not available';
        }
    });


});

