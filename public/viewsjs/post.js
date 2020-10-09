
var trash = document.getElementsByClassName("fa-trash");

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        // let userName = document.getElementById("userName")
        let comments = this.getAttribute('name');
        console.log(comments,'comment')
        fetch('/deleteComment', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // 'user': userName,
            'comments': comments
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});

