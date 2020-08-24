// requer the dependencies things
const express = require('express')
const path = require('path')
const fileupload = require('express-fileupload')
const emailSender = require('./modules/emailSender')
const fs = require('fs')
const session = require('express-session')
const adminRoute = require('./routs/adminRoute')
const teacherRoute = require('./routs/teacherRoute')

// get port from server
const port = process.env.PORT || 3000
// requer the modules
const dataModule = require('./modules/dataModule')

// Making express constanten
const app = express()
// make the Public folder
app.use(express.static(path.join(__dirname, 'public')))
// set the View engine Option
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
// set the Option for the sending data
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
// set the session Option
const sessionOptions = {
    secret: 'tutorials',
    cookie: {}
}
app.use(session(sessionOptions))

app.use(fileupload({
    limits: { fileSize: 50 * 1024 * 1024 }
}))


// renderin the Home page
app.get('/', (req, res) => {
    res.render('home');
});
let courses
// rendering tutorials page
app.get('/tutorials', (req, res) => {
    console.log('req.session.user   ' + req.session.user);

    let courses
    dataModule.getAllCourses().then(obj => {
        courses = obj
        res.render('tutorials', { courses: courses });
    }).catch(error => {
        console.log(error);
    })
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
        dataModule.registerUser(name, email, password, 'student').then(() => {
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

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password

    if (email.trim() != "" && password != "") {
        dataModule.checkUser(email, password).then((user) => {
            req.session.user = user
            // console.log(user);
            switch (user.role) {
                case 'admin':
                    res.redirect('/adminPanel')
                    break;
                case 'teacher':
                    res.redirect('/teacher')
                    break;
                case 'student':
                    res.render('student')
                    console.log('req.session.user   ' + req.session.user);

                    break;
                default:
                    res.render('error', { error: 'could not find the user With this ' })
                    break;
            }
        }).catch(error => {
            console.log(error);
            res.render('error', { error: 'could not find this user' })
        })
    }

})
// rendering the error
app.get('/error', (req, res) => {
    res.render('error', { error });
});

// rendering the student
// app.get('/student', (req, res) => {
//     if (req.session.user) {
//         res.render('student');
//     }
// });

// const dirPath = path.join(__dirname, "public/uploadedfiles");
// const files = fs.readdirSync(dirPath).map(name => {
//     return {
//       name: path.basename(name, ".pdf"),
//       url: `/pdfs/${name}`
//     };
//   });




// const files = fs.readdirSync('./public/uploadedfiles').map(name => {
//     console.log(name);
//     // if (name == course[0].title+'.pdf') {
//         return { 
//             name: path.basename(name, ".pdf"),
//             url:course[0].pdfUrl
//         // }
//     };
//   });


app.get('/course/:title', (req, res) => {
    // res.send(req.params.id);
    dataModule.getCourse(req.params.title).then(course => {
        res.render('course', { course: course })
    }).catch(error => {
        res.render('error', { error: '404, book could not be found  \n <br>  ' + error })
    })
});

app.get('/studentCourses', (req, res) => {
    let courses
    dataModule.getAllCourses().then(obj => {
        courses = obj
        res.render('tutorials', { courses: courses });
        // res.render('studentCourses', { course: course })
    }).catch(error => {
        console.log(error);
        res.render('error', { error: '404, book could not be found....  \n <br>  ' + error })
    })

})
app.get('/addCoursesToUser/:courseTitle', (req, res) => {
    if (req.session.user) {
        
        let user = req.session.user
        console.log(user);
        dataModule.getCourseArr(user.email).then(coursesArr => {
            let courseTitle = req.params.courseTitle
            let newCoursesArr = coursesArr.push(courseTitle)
    
            dataModule.addCourseArr(user.email, newCoursesArr).then(user => {
                let courses
                dataModule.getAllCourses().then(obj => {
                    courses = obj
                    res.render('tutorials', { courses: courses });
                }).catch(error => {
                    res.render('error', { error: '404, book could not be found....  \n   ' + error })
                })
            }).catch(error => {
                res.render('error', { error: '404, book could not be found....  \n   ' + error })
            })
        }).catch(error => {
            res.render('error', { error: '404, book could not be found....  \n   ' + error })
        })

    } else {
            res.render('error', { error: '!! You Have To LogIn First....  \n   '  })
    }
})


// rendering the teacher
app.use('/teacher', teacherRoute.teacherRouter())

// rendering the admin
app.use('/adminpanel', adminRoute.adminRouter())






app.listen(port, () => {
    console.log('App listening on port ' + port);
});

