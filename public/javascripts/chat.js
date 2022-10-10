var origin = window.location.origin;
  
const log = console.log
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const username = 'user'
const room = 'room'
// We can access to this io because we provided the cdn to socket.io in chat.html just before linking this script
const socket = req.io()
// const socket = io.connect(origin); 

// Join chatroom
socket.emit('joinRoom' , {username,room})

// Get room users and room info
socket.on('roomUsers',({ room , users }) => {
    outputRoomName(room)
    outputUsers(users)
})

socket.on('message' , message => {
    log(message)
    outputMessage(message)
    chatMessages.scrollTop = chatMessages.scrollHeight
})

// Adding an event when submiting the form
chatForm.addEventListener('submit' , (e) => {
    e.preventDefault() // This will block the form from submission

    // This will return the text that is typed by the user in the input field that contains the id of msg!
    const msg = e.target.elements.msg.value 

    //Emiting a message to the server
    socket.emit('chatMessage' , msg)
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus( )
})

// outputMessage to DOM
 outputMessage = (message) => {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div)
 }
 // Add roomname to DOM
 outputRoomName = (room) => {
    roomName.innerText = room
 }
 // Add userlist to the DOM
 outputUsers = (users) => {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
 }