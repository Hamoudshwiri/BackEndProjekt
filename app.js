// requer the dependencies things
const express = require('express')
const path = require('path')
const emailSender = require('./modules/emailSender')
const fs = require('fs')
const session = require('express-session')
const adminRoute = require('./routs/adminRoute')




// requer the modules
const dataModule = require('./modules/dataModule')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// renderin the Home page
app.get('/', (req, res) => {
    res.render('home');
});
// rendering tutorials page
app.get('/tutorials', (req, res) => {
    res.render('tutorials');
});
// rendering sign up page
app.get('/register', (req, res) => {
    res.render('register');
});
// send data to the server 
app.post('/register', (req, res) => {
    // your post register handler here
    // console.log(req.body)
    // 2 data error
    // 1 user registered successfuly
    // 3 user is exist
    // 4 server error
    const name = req.body.name.trim()
    const email = req.body.email.trim()
    const password = req.body.password
    const repassword = req.body.repassword

    if (name && email && password && password == repassword) {
        dataModule.registerUser(name, email, password).then(() => {
            res.json(1)
        }).catch(error => {
            console.log(error);
            if (error == "exist") {
                res.json(3)
            } else {
                res.json(4)
            }
        })
    } else {
        res.json(2)
    }

});
app.get('/testimonials', (req, res) => {
    res.render('testimonials');
});
app.get('/blog', (req, res) => {
    res.render('blog');
});
app.get('/about', (req, res) => {
    res.render('about');
});
// contact Page rendering and reciving the Emails
app.get('/contact', (req, res) => {
    res.render('contact', { sent: 1 });
});
app.post('/contact', (req, res) => {
    console.log(req.body);
    const fname = req.body.fname
    const lname = req.body.lname
    const email = req.body.email
    const message = req.body.message
    if (fname != "" && lname != "" && fname.length < 100 && email != '') {
        emailSender.sendEmail(fname, lname, email, message).then((ok) => {
            if (ok) {
                //res.sendStatus(200);
                res.render('contact', { sent: 2 })
            } else {
                //res.sendStatus(500);
                res.render('contact', { sent: 3 })
            }
        }).catch(error => {
            res.render('contact', { sent: 3 })
        })
    } else {
        res.render('contact', { sent: 3 })
    }


});





app.get('/tutorial-single', (req, res) => {
    res.render('tutorial-single');
});
app.get('/single', (req, res) => {
    res.render('single');
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});

app.use('/admin',adminRoute.adminRouter())
