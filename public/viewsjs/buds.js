
let acceptFriend = document.getElementsByClassName('acceptBud')
let denyFriend = document.getElementsByClassName('delBud')

if(acceptFriend){
  Array.from(acceptFriend).forEach(function(element) {
      element.addEventListener('click',(event) =>{
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
        });
      }
        if(denyFriend){
      Array.from(denyFriend).forEach(function(element) {
      element.addEventListener('click',(event) =>{
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
            });
        };