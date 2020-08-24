const passwordHash = require('password-hash')
// const {MongoClient, ObjectID} = require('mongodb')
const mongoose = require('mongoose')
const fs = require('fs')
const { stringify } = require('querystring')
const { Int32 } = require('mongodb')


// create a connection string for mongoose 
const connectionString = 'mongodb+srv://tutorAdmin:12341234@cluster0.vq1nt.mongodb.net/backendProjeckt?retryWrites=true&w=majority'
// create users schema 
const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    coursesArr: {
        type: Array
    },
    role: {
        type: String,
        required: true,
    },
})
const Users = mongoose.model('users', usersSchema)



function connect() {
    return new Promise((resolve, reject) => {
        if (mongoose.connection.readyState !== 1) {
            mongoose.connect(connectionString, {
                useUnifiedTopology: true,
                useCreateIndex: true,
                useNewUrlParser: true
            }).then(() => {
                resolve()
            }).catch(error => {
                reject()
            })
        } else {
            resolve()
        }
    })

}

function registerUser(name, email, password, role) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            // creat new user
            const newUser = new Users({
                name: name,
                email: email,
                password: passwordHash.generate(password),
                role: role
            })
            // save the newUser in the database
            newUser.save().then(result => {
                console.log(result);
                resolve()
            }).catch(error => {
                console.log(error.code);
                if (error.code === 11000) {
                    reject('exist')
                } else {
                    reject(error)
                }
            })
        }).catch(error => {
            reject(error)
        })
    })
}
function checkUser(email, password) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Users.findOne({ email: email }).then(user => {
                if (user) {
                    if (passwordHash.verify(password, user.password)) {
                        resolve(user)
                    } else {
                        reject(3)
                    }
                } else {
                    reject(3)
                }
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}
function checkAdmin(email, password) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Users.findOne({ email: email }).then(user => {
                if (user) {
                    if ((passwordHash.verify(password, user.password)) && user.role === 'admin') {
                        resolve(user)
                    } else {
                        reject(3)
                    }
                } else {
                    reject(3)
                }
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}
function editAdmin (email, newEmail, newPassword) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            
            Users.updateOne({ email: email }, {
                email: newEmail,
                password: passwordHash.generate(newPassword)
            }).then(result => {
                console.log('this is the result from edit admin'+result);
                resolve()
            }).catch(error => {
                console.log(error.code);
                reject()
            })
        }).catch(error => {
            reject(error)
        })
    })
}
function getUser(role) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Users.find({ role: role }).then(teacher => {
                resolve(teacher)
                // if (teacher) {
                //     resolve(teacher)
                // } else {
                //     reject(3)
                // }
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}
function getUserEmail(email) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Users.find({ email: email }).then(user => {
                resolve(user)
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}
function getCourseArr(email) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Users.findOne({ email: email }).then(user => {
                resolve(user.coursesArr)
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}
function addCourseArr(email, courseArr) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Users.updateOne({ email: email }, {
                coursesArr : courseArr
            }).then(user => {
                resolve(user)
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}
function DeletUser(deletedEmail) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Users.deleteOne({ email: deletedEmail }).then(user => {
                resolve(user)
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}

///////////////////////////////////////////////////////////////////

// start dealling with Courses 

// create Courses schema 
const coursesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    pdfUrl: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true,
    },
    duration: {
        type: String
    },
    level: {
        type: String,
    },
    date: {
        type: String
    },
    price: {
        type: String,
    },
    teacherName: {
        type: String,
        required: true
    },
    teacher_id: {
        type: String,
        required: true
    },
})
const Courses = mongoose.model('courses', coursesSchema)

function addCourse(title, description, bookPdf, imgUrl, duration, level, date, price, teacher_id, teacherName) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
                        // get file extension
                          let ext = imgUrl.name.substr(imgUrl.name.lastIndexOf('.'))
                          // set the new image name
                          let newImgName = title.trim().replace(/ /g, '_') + ext
                          imgUrl.mv('./public/uploadedfiles/' + newImgName)
                    // set a new pdf file name
                      let pdfName = title.trim().replace(/ /g, '_') + '_' + '.pdf'
                  // move the pdf file with the new name to uploadedfiles folder
                      bookPdf.mv('./public/uploadedfiles/' + pdfName)
                  // set the pdf url that gonna be saved in the json file
                      let pdfNewUrl = '/uploadedfiles/' + pdfName
                      const newCourse = new Courses({
                          title: title,
                          description: description,
                          pdfUrl: pdfNewUrl,
                          imgUrl: '/uploadedfiles/' + newImgName,
                          duration:duration,
                          level: level,
                          date: date,
                          price: price,
                          teacher_id: teacher_id,
                          teacherName: teacherName
                      })
                      newCourse.save().then(() => {
                          resolve()
                      }).catch(error => {
                          reject(error)
                      })
                
            }).catch(error => {
              reject(error)
            })
       
    })
}
function getTeacherCourse(id) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Courses.find({ teacher_id: id }).then(course => {
                resolve(course)
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}function getCourse(title1) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            let title = title1
            title = title.replace(/_/g, ' ')
            Courses.findOne({title: title}).then(courses => {
                resolve(courses)
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}
function getAllCourses() {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Courses.find().then(courses => {
                resolve(courses)
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}
function DeletCourse(deletedTitle) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Courses.deleteOne({ title: deletedTitle }).then(course => {
                console.log(course);
                if (fs.existsSync('./public'+course.imgUrl)){
                    fs.unlinkSync('./public'+course.imgUrl)
                }
                if (fs.existsSync('./public' + course.pdfUrl)) {
                    fs.unlinkSync('./public' + course.pdfUrl)
                }
                resolve(course)
            }).catch(error => {
            console.log(error);
            reject()
        })
    }).catch(error => {
        reject(error)
    })
})
}

// function checkUser(email, password) {
//     return new Promise((resolve, reject) => {
//         connect().then(() => {
//             Users.findOne({ email: email }).then(user => {
//                 if (user) {
//                     if (passwordHash.verify(password, user.password)) {
//                         resolve(user)
//                     } else {
//                         reject(3)
//                     }
//                 } else {
//                     reject(3)
//                 }
//             })
//         }).catch(error => {
//             reject(error)
//         })
//     })
// }

// function addBook(bookTitle, bookDescription, bookPdf, bookImgs, userid) {
//     return new Promise((resolve, reject) => {
//         connect().then(() => {
//             // delete const db = client.db('test1')
//             Books.findOne({ title: bookTitle, userid: userid }).then(findBook => {
//                 if (findBook) {
//                     // delete client.close()
//                     reject(3)
//                 } else {
//                     // create images array to be saved in database
//                     const imgsArr = []
//                     bookImgs.forEach((img, idx) => {
//                         // get file extension
//                         let ext = img.name.substr(img.name.lastIndexOf('.'))
//                             // set the new image name
//                         let newName = bookTitle.trim().replace(/ /g, '_') + '_' + userid + '_' + idx + ext
//                         img.mv('./public/uploadedfiles/' + newName)
//                         imgsArr.push('/uploadedfiles/' + newName)
//                     });
//                     // set a new pdf file name
//                     let pdfName = bookTitle.trim().replace(/ /g, '_') + '_' + userid + '.pdf'
//                         // move the pdf file with the new name to uploadedfiles folder
//                     bookPdf.mv('./public/uploadedfiles/' + pdfName)
//                         // set the pdf url that gonna be saved in the json file
//                     let pdfNewUrl = '/uploadedfiles/' + pdfName
//                     const newBook = new Books({
//                         title: bookTitle,
//                         description: bookDescription,
//                         pdfUrl: pdfNewUrl,
//                         imgs: imgsArr,
//                         userid: userid
//                     })
//                     newBook.save().then(() => {
//                         // delete client.close()
//                         resolve()
//                     }).catch(error => {
//                         reject(error)
//                     })
//                 }
//             }).catch(error => {
//                 // delete client.close()
//                 reject(error)
//             })
//         }).catch(error => {
//             reject(error)
//         })
//     })
// }

// function getAllBooks() {
//     return new Promise((resolve, reject) => {
//         connect().then(() => {
//             // delete const db = client.db('test1')
//             Books.find().then(books => {
//                 // add id property to each book instead of _id
//                 // becausethis how it used in ejs
//                 books.forEach(book => {
//                         // book.id = book._id
//                         book['id'] = book['_id']
//                     })
//                     // delete client.close()
//                 resolve(books)
//             }).catch(error => {
//                 // delete client.close()
//                 reject(error)
//             })
//         }).catch(error => {
//             reject(error)
//         })
//     })
// }

// function getBook(id) {
//     return new Promise((resolve, reject) => {
//         connect().then(() => {
//             // delete const db = client.db('test1')
//             Books.findOne({ _id: id }).then(book => {
//                 // delete client.close()
//                 if (book) {
//                     book.id = book._id
//                     resolve(book)
//                 } else {
//                     reject(new Error('can not find a book with this id : ' + id))
//                 }
//             }).catch(error => {
//                 //delete client.close()
//                 reject(error)
//             })
//         }).catch(error => {
//             reject(error)
//         })
//     })
// }

// function userBooks(userid) {
//     return new Promise((resolve, reject) => {
//         connect().then(() => {
//             // delete const db = client.db('test1')
//             Books.find({ userid: userid }).then(books => {
//                 // add id property to each book instead of _id
//                 // becausethis how it used in ejs
//                 books.forEach(book => {
//                         // book.id = book._id
//                         book['id'] = book['_id']
//                     })
//                     // delete client.close()
//                 resolve(books)
//             }).catch(error => {
//                 // delete client.close()
//                 reject(error)
//             })
//         }).catch(error => {
//             reject(error)
//         })
//     })
// }

// function updateBook(bookid, newBookTitle, oldImgsUrls, bookDescription, newPdfBook, newImgs, userid) {
//     return new Promise((resolve, reject) => {
//         try {


//             (async() => {
//                 let oldBookData = await getBook(bookid)
//                 const deletedImgs = []
//                 const keepImgs = []
//                     // get update version number
//                     // let updateNum = 1
//                     // if(oldBookData.update){
//                     //     updateNum = oldBookData.update +1
//                     // }

//                 // check which images user wants to keep and which to delete
//                 oldBookData.imgs.forEach(img => {
//                         if (oldImgsUrls.indexOf(img) >= 0) {
//                             keepImgs.push(img)
//                         } else {
//                             deletedImgs.push(img)
//                         }
//                     })
//                     // save new images to file system and to array to be saved to db
//                 const newImgsUrlsArr = []
//                 newImgs.forEach((img, idx) => {
//                         const imgExt = img.name.substr(img.name.lastIndexOf('.'))
//                         const newImgName = newBookTitle.trim().replace(/ /g, '_') + '_' + userid + '_' + idx + '_' + (oldBookData.__v + 1) + imgExt
//                         newImgsUrlsArr.push('/uploadedfiles/' + newImgName)
//                         img.mv('./public/uploadedfiles/' + newImgName)
//                     })
//                     // delete the deleted images files from the system
//                 deletedImgs.forEach(file => {
//                         // first check file is exist
//                         if (fs.existsSync('./public' + file)) {
//                             fs.unlinkSync('./public' + file)
//                         }
//                     })
//                     // check if user upload a new pdf file and move it to the same place of the old one so it will OVERWRITE it
//                 if (newPdfBook) {
//                     newPdfBook.mv('./public' + oldBookData.pdfUrl)
//                 }
//                 // await connect()
//                 // delete const db = client.db('test1')
//                 await Books.updateOne({ _id: bookid }, {

//                         title: newBookTitle,
//                         description: bookDescription,
//                         imgs: [...keepImgs, ...newImgsUrlsArr],
//                         //delete update: updateNum,
//                         $inc: { __v: 1 }

//                     })
//                     // delete client.close()
//                 resolve()

//             })()
//         } catch (error) {
//             reject(error)
//         }
//     })
// }

// function deleteBook(bookid, userid) {
//     return new Promise((resolve, reject) => {
//         getBook(bookid).then(book => {
//             // check if the book belong to the current login user
//             if (book.userid === userid) {
//                 // delete book images
//                 book.imgs.forEach(img => {
//                         //check the img file is exist then delete it
//                         if (fs.existsSync('./public' + img)) {
//                             fs.unlinkSync('./public' + img)
//                         }
//                     })
//                     // delete pdf file
//                     // check if pdf file is exist then delete it
//                 if (fs.existsSync('./public' + book.pdfUrl)) {
//                     fs.unlinkSync('./public' + book.pdfUrl)
//                 }
//                 // connect().then(client => {
//                 // const db = client.db('test1')
//                 Books.deleteOne({ _id: bookid }).then(() => {
//                         // client.close()
//                         resolve()
//                     }).catch(error => {
//                         // client.close()
//                         reject(error)
//                     })
//                     // }).catch(error => {
//                     //     reject(error)
//                     // })
//             } else {
//                 reject(new Error('hacking try. not this time'))
//             }
//         }).catch(error => {
//             reject(error)
//         })
//     })

// }
module.exports = {
    registerUser,
    editAdmin,
    checkUser,
    checkAdmin,
    getUser,
    DeletUser,
    addCourse,
    getTeacherCourse,
    getCourse,
    getAllCourses,
    DeletCourse,
    getUserEmail,
    addCourseArr,
    getCourseArr,
    // getBook,
    // userBooks,
    // updateBook,
    // deleteBook
}