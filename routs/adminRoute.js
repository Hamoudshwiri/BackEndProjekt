const express = require('express')
const dataModule = require('../modules/dataModule')


function adminRouter() {
    const adminRoute = express.Router()
    // build a middlware to check the session for all routes in /admin, /admin/blalba .....
    adminRoute.use((req, res, next) => {
        // if (req.session.user){
        //     next()
        // } else {
        //     res.redirect('/')
        // }
        next()
    })

    adminRoute.get('/', (req, res) => {
        // console.log(req.session.user);
        // if(req.session.user){
        //     res.render('admin')
        // } else {
        //     res.redirect('/login')
        // }
        res.render('adminLogin')
    })

    adminRoute.get('/editAdmin', (req, res) => {
        // console.log(req.session.user);
        // if(req.session.user){
        //     res.render('admin')
        // } else {
        //     res.redirect('/login')
        // }
        res.render('adminPanel')
    })

    adminRoute.post('/', (req, res) => {
        console.log(req.body);
        const email = req.body.email
        const password = req.body.password
       
        if (email.trim() != "" && password != "" ) {
            dataModule.checkAdmin(email, password).then((email)=>{
                req.user = {
                    email
                };
                res.redirect('/admin/editAdmin')
            }).catch(error=>{
                res.send('The password or email is not right')
            })
        }
        
    })
    
    adminRoute.post('/editAdmin', (req, res) => {
        console.log(req.body);
        const email = req.body.oldEmail;
        const password = req.body.oldPassword;
        const newEmail = req.body.email
        const newPassword = req.body.password

        if (email.trim() != "" && password != "" ) {
            dataModule.checkAdmin(email, password).then((email)=>{

                if (newEmail.trim() != "" && newPassword != "" ) {
                    dataModule.editAdmin(email, newEmail, newPassword).then(()=>{
                        res.render('adminPanel')
                    }).catch(error=>{
                        res.send("could not change the password")
                    })
                }
            }).catch(error=>{
                res.send('The password or email is not right')
            })
        }

        
        
    })


//     adminRoute.get('/addmeal', (req, res) => {
//         // const jsonText = fs.readFileSync(__dirname + '/meals.json')
//         // const myMeals = JSON.parse(jsonText)
//         res.render('adminAddMeal', {
//             meals: myMeals,
//             check: true
//         })
//     });

//     adminRoute.get('/deletmeal', (req, res) => {
//         res.render('adminDeletMeal', {
//             meals: myMeals
//         })
//     });

//     adminRoute.post('/deletmeal', (req, res) => {
//         //console.log(req.body.mealid)
//         const idx = req.body.mealid
//         try {
//           fs.unlinkSync("./public" + myMeals[idx].imgUrl)  
//         } catch (error) {
//             console.log(error)
//         }
        
//         myMeals.splice(idx, 1)
//         fs.writeFileSync('./meals.json', JSON.stringify(myMeals))


//         res.sendStatus(200)
//     })
//     adminRoute.get('/editmeal', (req, res) => {
//         res.render('adminEditMeal', {
//             meals: myMeals
//         })
//     })
//     adminRoute.post('/editmeal', (req, res) => {
//         //console.log(req.body)
//         //console.log(req.files)
//         myMeals[req.body.mealid].title = req.body.mealTitle
//         myMeals[req.body.mealid].description = req.body.mealDescription
//         myMeals[req.body.mealid].price = req.body.mealPrice
        
//         if (req.files) {
//             //console.log(req.files)
//             const mealImg = req.files.imgFile
//             // delete the old image file
//             try {
//                 fs.unlinkSync("./public" + myMeals[req.body.mealid].imgUrl)
//             } catch (error) {
//                 console.log(error);
                
//             }
            
//             // get image extenstion
//             let ext = mealImg.name.substr(mealImg.name.lastIndexOf('.'))

//             // move the new image to uploaded folder
//             mealImg.mv('./public/uploadedfiles/' + req.body.mealTitle.replace(/ /g, '_') + (req.body.mealid ) + ext).then(() => {
//                 myMeals[req.body.mealid].imgUrl ="/uploadedfiles/" + req.body.mealTitle.replace(/ /g, '_') + (req.body.mealid ) + ext
//                 fs.writeFileSync('./meals.json', JSON.stringify(myMeals))
//                 //res.sendStatus(200)
//                 res.json(myMeals[req.body.mealid].imgUrl)
//             }).catch(error => {
//                 res.sendStatus(500)
//             })
//         } else {
//             fs.writeFileSync('./meals.json', JSON.stringify(myMeals))
//             //res.sendStatus(200)
//             res.json(myMeals[req.body.mealid].imgUrl)
//         }
//     })

//     adminRoute.post('/addmeal', (req, res) => {
//         const mealTitle = req.body.mealTitle
//         const mealPrice = req.body.mealPrice
//         const mealDescription = req.body.mealDescription
//         const mealDetails = req.body.mealDetails

//         // chees burger 
//         // chees_burger_1.jpeg
//         // false cases
//         // number 0
//         // string empty string
//         // object undefined
//         // datatype null 

        

//         if (mealTitle && mealPrice && mealDescription && req.files) {

//             //check if mealtitle is exist
//         const foundMachMeal = myMeals.find(meal => meal.title == mealTitle )
//         if(foundMachMeal) {
//             res.render('adminAddMeal', {
//                 meals: myMeals,
//                 check: false
//             });
//         } else {
//             const mealImg = req.files.mealimg
//             //mealImg.name // blabla.jpeg
//             // get image extenstion
//             let ext = mealImg.name.substr(mealImg.name.lastIndexOf('.'))
//             mealImg.mv('./public/uploadedfiles/' + mealTitle.replace(/ /g, '_') + myMeals.length + ext).then(() => {
//                 let obj = {
//                     title: mealTitle,
//                     description: mealDescription,
//                     imgUrl: '/uploadedfiles/' + mealTitle.replace(/ /g, '_') + myMeals.length + ext,
//                     price: mealPrice,
//                     details: mealDetails
//                 }
//                 myMeals.push(obj)
//                 fs.writeFileSync('./meals.json', JSON.stringify(myMeals))
//                 //res.render('adminAddMeal', {meals: meals})
//                 // you need to write the full path on res.redirect
//                 res.redirect('/admin/addmeal')
//             }).catch(error => {
//                 res.send(error.message);
//             })
//         }

            

//         } else {
//             res.send("meal data is not complete");
//         }

//     });

//     adminRoute.post('/checkmealname', (req, res) => {
//         console.log(req.body)
//         const foundedMeal = myMeals.find(meal => meal.title == req.body.mealtitle)
//         if (foundedMeal){
//             res.json('exist')
//         }else{
//             res.json('notexist')
//         }
//     })

     return adminRoute
}


module.exports = {
    adminRouter
}