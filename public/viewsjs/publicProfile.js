let friendBtn = document.getElementById('friendBtn');
let friendId = document.getElementById('friendId');
let profileUser = document.getElementById('profileUser');

friendBtn.addEventListener('click',(event) =>{
    event.preventDefault()
    console.log(friendId.dataset.id)
    let receiver = friendId.dataset.id
    let username = profileUser.dataset.name
    console.log(receiver, 'receiver')
    console.log(username)
    fetch('/addfriend', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          receiver,
          username
        })
      })
      })

   