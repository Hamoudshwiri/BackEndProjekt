const express = require('express')
const dataModule = require('../modules/dataModule')
const session = require('express-session')


function teacherRouter() {
    const teacherRouter = express.Router()
    // build a middlware to check the session for all routes in /admin, /admin/blalba .....
    teacherRouter.use((req, res, next) => {
        if (req.session.user) {
            next()
        } else {
            res.redirect('/login')
        }
        // next()
    })

    teacherRouter.get('/', (req, res) => {
        // console.log(req.session.user);
        if (req.session.user.role === 'teacher') {
            console.log(req.session.user);
            let courses
            dataModule.getTeacherCourse(req.session.user._id).then(obj => {
                courses = obj
                res.render('teacher',{teacherName: req.session.user.name, courses: courses})
            }).catch(error => {
                console.log(error)
            })
        } else {
            res.redirect('/login')
        }
    })

    teacherRouter.post('/', (req, res) => {
        // responses map
        // 1 course saved successfuly
        // 2 data error
        //console.log(Object.keys( req.files));
        console.log('body '+req.body);
        console.log('files '+req.files);

        if (req.files) {
            const courseTitle = req.body.courseTitle
            const courseDuration = req.body.courseDuration
            const courseLevel = req.body.courseLevel
            const courseDate = req.body.courseDate
            const coursePrice = req.body.coursePrice
            const courseDescription = req.body.courseDescription
            const courseImg = req.files.courseImg
            const coursePdf = req.files.coursePdf

            if (courseTitle && courseDuration && courseLevel && courseDate && coursePrice && courseDescription && courseImg && coursePdf) {
                dataModule.addCourse(courseTitle, courseDescription, coursePdf, courseImg, courseDuration, courseLevel, courseDate, coursePrice, req.session.user._id, req.session.user.name).then(() => {
                    res.json(1)
                }).catch(error => {
                    if (error.code == 11000) {
                        res.json(3)
                    }
                })

            } else {
                res.json(2)
            }
        } else {
            res.json(2)
        }

    })

    teacherRouter.post('/deleteCourse', (req, res) => {
        let deletedtitle = req.body.deletedtitle
        dataModule.DeletCourse(deletedtitle).then(user=>{
            res.json(1)
        }).catch(error=>{
            res.json(2)
        })
    })

    return teacherRouter
}


module.exports = {
    teacherRouter
}