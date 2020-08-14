const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ali.asra.bina@gmail.com',
        pass: '123456789kabul'
    }
})

function sendEmail(fname, lname, email, message) {
return new Promise((resolve, reject) => {
    const mailOption ={
        from: 'ali.asra.bina@gmail.com',
        to: 'ali.asra.bina@gmail.com',
        text:   'Email: ' + email + '\n' + 'From: '+ fname +' '+ lname +'\n' + 'Message:'+ '\n' + message
    }
    transporter.sendMail(mailOption, function (error, info) {
        if(error){
            console.log(error);
            reject(error)
            
        } else {
            console.log(info.response);
            resolve(info.response)
        }
      })
})
    

  }

  module.exports = { sendEmail }