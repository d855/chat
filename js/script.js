window.addEventListener('DOMContentLoaded', () => {

    let ws;
    let connected = false;

    const joinBtn = document.querySelector('#joinBtn')
    const leaveBtn = document.querySelector('#leaveBtn')
    const username = document.querySelector('#username')
    const messageInput = document.querySelector('#messageInput')
    const sendBtn = document.querySelector('#sendBtn')
    const chat = document.querySelector('#chat')
    const messagesContainer = document.querySelector('#messages')

    joinBtn.addEventListener('click', (e) => {

        let userName = username.value.trim();

        if(userName.length === 0) {
            return;
        }

        // ws connection -> open
        ws = new WebSocket('ws://localhost:3000');

        ws.onopen = () => {
            connected = true;
            chat.classList.remove('hidden')
            joinBtn.classList.add('hidden')
            leaveBtn.classList.remove('hidden')
            username.classList.add('hidden')
            ws.send(JSON.stringify({ type: 'system', user: userName }))
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            console.log(data)

            if(data.type === 'history') {
                generateHistoryMessages(data.messages)
            } else {
                let isSelf = data.user === userName;

                let messageEl = document.createElement('div')
                let messageText = document.createElement('span')
                messageText.textContent = data.text
                messageEl.appendChild(messageText)

                if (data.type === 'system') {
                    messageEl.classList.add('service-message')
                } else {
                    let messageTime = document.createElement('span')
                    messageTime.textContent = data.time
                    messageEl.appendChild(messageTime)

                    if(isSelf) {
                        messageEl.classList.add('send-message')
                        messageTime.classList.add('send-time')
                    } else {
                        messageEl.classList.add('received-msg')
                        messageTime.classList.add('received-time')
                        messageEl.style.backgroundColor = data.color
                    }
                }

                messagesContainer.appendChild(messageEl)
            }
        }

    });

    username.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') {
            joinBtn.click()
        }
    })

    sendBtn.addEventListener('click', (e) => {
        let msg = messageInput.value.trim();

        if(msg.length === 0) {
            return
        }

        ws.send(JSON.stringify({
            type: 'chat',
            text: msg,
        }))

        messageInput.value = ''
    })

    leaveBtn.addEventListener('click', () => {
        ws.close()
        ws = null
        connected = false;
        chat.classList.add('hidden')
        joinBtn.classList.remove('hidden')
        leaveBtn.classList.add('hidden')
    })

    messageInput.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') {
            sendBtn.click()
        }
    })

    function generateHistoryMessages(messages) {
        messagesContainer.innerHTML = ''

        messages.forEach(message => {

            let messageEl = document.createElement('div')
            let messageText = document.createElement('span')

            messageText.textContent = message.text
            messageEl.appendChild(messageText)

            let messageTime = document.createElement('span')
            messageTime.textContent =  message.time
            messageEl.appendChild(messageTime)

            messageEl.classList.add('received-msg')
            messageTime.classList.add('received-time')
            messageEl.style.backgroundColor = 'lightgray'
            messagesContainer.appendChild(messageEl)

        })
    }
})