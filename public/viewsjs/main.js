
var trash = document.getElementsByClassName("fa-trash");

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        let userName = document.getElementById("userName").innerText;
        let postId = this.getAttribute('name');
        console.log(postId,'postid')
        console.log(userName,'username')
        fetch('/deletePost', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'user': userName,
            'postId': postId
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});

