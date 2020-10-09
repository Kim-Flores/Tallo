
let acceptFriend = document.getElementById('acceptFriend')
let denyFriend = document.getElementById('denyFriend')
// let removeFriend = document.getElementById('removeFriend')
// let removeFriend2 = document.getElementById('removeFriend')
if(acceptFriend){
      acceptFriend.addEventListener('click',(event) =>{
        event.preventDefault()
        let senderId = event.target.dataset.id
        console.log(senderId)
        fetch('/acceptfriend', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              senderId
            })
          }).then(res => window.location.reload(true))
          })
        }
        if(denyFriend){
      denyFriend.addEventListener('click',(event) =>{
        event.preventDefault()
        let friendId = event.target.dataset.id
        console.log(friendId)
            fetch('/deletefriend', {
                method: 'delete',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  friendId
                })
              }).then(res => window.location.reload(true))
              })
            }