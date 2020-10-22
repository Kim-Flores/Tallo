module.exports = function(app, passport, db, multer, ObjectId, fetch) {

// Image Upload Code =========================================================================
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
});
var upload = multer({storage: storage});


// normal routes ===============================================================

// show the home page (will also have our login links)
app.get('/', function(req, res) {
    res.render('index.ejs');
});

// PROFILE SECTION =========================
app.get('/profile', isLoggedIn, function(req, res) {
    let uId = ObjectId(req.session.passport.user)
    db.collection('posts').find({'posterId': uId}).toArray((err, result) => {
      db.collection('friends').find({$or:[{'sender': uId}, {'receiver': uId}]}).toArray((err, friends) => {
        console.log(friends)
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user : req.user,
        posts: result,
        friends: friends
      })
    })
  })
});

// PUBLIC PROFILE SECTION =========================
app.get('/profile/:posterId', isLoggedIn, function(req, res) {
    let uId = ObjectId(req.params.posterId)
    db.collection('posts').find({'posterId': uId}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('publicProfile.ejs', {
        user : req.user,
        posts: result
      })
    })
});

// ABOUT US PAGE ===============================================================

app.get('/about',function(req, res) {
  db.collection('posts').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('about.ejs', {
      user : req.user,
      messages: result
    })
  })
});

// CONTACT ===============================================================

app.get('/contact',function(req, res) {
  db.collection('posts').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('contact.ejs', {
      user : req.user,
      messages: result
    })
  })
});

// FEED PAGE =========================
app.get('/feed', function(req, res) {
    db.collection('posts').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('feed.ejs', {
        user : req.user,
        posts: result
      })
    })
});

//========================= FRIENDS FEED =========================
app.get('/buds', isLoggedIn, function(req, res) {
  let uId = ObjectId(req.session.passport.user)
  db.collection('friends').find({$or:[{'sender': uId}, {'receiver': uId}]}).toArray((err, friends)  => {
    console.log(friends,'friends: just my friends')
    let friendsList = friends.map(element => {
      let friend = element.receiverUsername == req.user.local.username ? element.senderUsername : element.receiverUsername
      return friend
    })
    console.log(friends,'friends')
      db.collection('posts').find().toArray((err, friendsFeed)  => {
        console.log(friendsFeed,'friendsFeed')
        let friendsPost = friendsFeed.filter(feed => {
          if(friendsList.includes(feed.posterUserName)){
            return true;
          }else{
            false;
          }
        })
        console.log(friendsPost, 'friendsPost:friends only')
        console.log(friendsList, 'friends list')
        if (err) return console.log(err)
        res.render('buds.ejs', {
        user : req.user,
        friends: friends,
        posts: friendsPost
  })

      })
      })
})


// API SEARCH PAGE =========================
app.get('/search', function(req, res) {
  db.collection('posts').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('search.ejs', {
      user : req.user,
      posts: result
    })
  })
});

// API SEARCH Results =========================
app.post('/searchResult', function(req, res) {
  let keyword= req.body.keyword
  if (keyword.length < 1)res.send({status:'failure'})
  console.log(keyword)
  const url = `https://api.inaturalist.org/v1/search?q=${keyword}&per_page=100`;
  const getData = async url => {
    try {
      const response = await fetch(url);
      const json = await response.json();
      res.send(json)
    } catch (error) {
      console.log(error);
    }
  };
  getData(url);
});


// INDIVIDUAL POST PAGE =========================
// app.get('/post/:zebra', function(req, res) {
//     let postId = ObjectId(req.params.zebra)
//     console.log(postId);
//     db.collection('posts').find({_id: postId}).toArray((err, result) => {
//       if (err) return console.log(err)
//       res.render('post.ejs', {
//         posts: result
//       })
//     })
// });
//

app.get('/post/:zebra', function(req, res) {
    let postId = ObjectId(req.params.zebra)
    // console.log(postId);
    db.collection('posts').find({
      _id: postId,  
    }).toArray((err, result) => {

      if (err) return console.log(err)
      db.collection('comments').find({
        posterId:postId,
      }).toArray((err,result2) =>{
        res.render('post.ejs',{    
          user:req.user,
          posts:result,
          comments:result2
        })
      })
    })
});


// creating a route handle that handle the post request and save it to the database
app.post('/comment/:cat',(req,res) =>{
  // console.log(result);
  let postId=ObjectId(req.params.cat)
  db.collection('comments').save({
    user:req.user.local.email,
    username:req.user.local.username,
    posterId:postId,
    comments:req.body.comment
  },(err,result)=>{
    console.log(result);
    if (err) return console.log(err)
   console.log("saved to database");
   res.redirect(`/post/${postId}`)
 })
});

//  ========= ADD FRIENDS ============
app.put('/addfriend', (req, res) => {
  let receiver = ObjectId (req.body.receiver)
  let sender =  req.user._id
  let receiverUsername = req.body.username
  db.collection('friends')
  .findOneAndUpdate({receiver: receiver, sender: sender}, {
    $set: {
      receiver: receiver,
      sender: sender,
      accepted: false,
      pending: true,
      receiverUsername: receiverUsername,
      senderUsername: req.user.local.username
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    // if (err) return res.send(err)
    // res.send(result)
  })
})
// ========== ACCEPT FRIEND =========

app.put('/acceptfriend', (req, res) => {
  let receiver = req.user._id
  console.log(typeof receiver)
  let senderId = ObjectId(req.body.senderId)
  console.log(typeof senderId)
  db.collection('friends')
  .findOneAndUpdate({$and:[{receiver: receiver}, {sender: senderId}]}, {
    $set: {
      accepted: true,
    }
  }, {
    sort: {_id: -1},
  }, (err, result) => {
    // if (err) return res.send(err)
    // res.send(result)
    res.send('success')
  })
})
  //================= DELETE FRIENDS==================
  // {$or:[{'sender': uId}, {'receiver': uId}]}
app.delete('/deletefriend', (req, res) => {
  db.collection('friends').findOneAndDelete({
   $or:[
     {$and: [
       {sender: req.user._id},
       {receiver: ObjectId(req.body.friendId)}
      ]},
      {$and: [
        {sender: ObjectId(req.body.friendId)},
        {receiver: req.user._id}
       ]}]
      
  }, (err, result) => {
    if (err) return res.send(500, err)
    res.send('success')
  })
})

//================================= CREATE POST ================================
app.post('/qpPost', upload.single('file-to-upload'), (req, res, next) => {
  let uId = ObjectId(req.session.passport.user)
  let word = req.body.caption
  let posterUserName = req.user.local.username
  let posterImg = req.user.profileImg
  console.log(req.user.local.username)
  word = word.split(' ');
  let hashtags = [];
  for(let i = 0; i < word.length; i++){
    console.log(word);
    if(word[i][0] === "#"){
      console.log(word[i].length)
      if(word[i].length < 2){
        continue
      } else{
      hashtags.push(word[i]);
      word[i] = `<a href="/hash/${word[i].slice(1)}">${word[i]}</a>`
      console.log(`${word[i]}`)
      }
    }
  }
  word = word.join(' ')
  console.log(word)
  
  db.collection('posts').save({hashtags: hashtags, posterImg: posterImg, posterUserName: posterUserName, posterId: uId, caption: `<p>${word}</p>`, likes: 0, imgPath: 'images/uploads/' + req.file.filename, user:req.user.local.email}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/profile')
  })
});

app.get('/hash/:hashtag', (req, res) => {
let hashtag = "#" + req.params.hashtag
console.log(hashtag)
db.collection('posts').find({hashtags: [hashtag]}).toArray((err, result) => {
  console.log(result)
  if (err) return console.log(err)
  res.render('hash.ejs', {
  posts: result
  })
})
})
// app.get('/post/:postObject_id', function(req, res) {
// var uId = ObjectId(req.params.postObject_id.toString())
// db.collection('post').find({'_id': uId}).toArray((err, result) => {
//   console.log(result)
//   if (err) return console.log(err)
//   res.render('post.ejs', {
//     messages: result
//   })
// })
// });

app.delete('/deleteComment', (req, res) => {
  db.collection('comments').findOneAndDelete({
    // user: req.body.user,
    comments: req.body.comments
  }, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})

app.delete('/deletePost', (req, res) => {
  db.collection('posts').findOneAndDelete({
    posterUserName: req.body.user,
    _id: ObjectId(req.body.postId)
  }, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Post deleted!')
  })
})

// LOGOUT ==============================
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
