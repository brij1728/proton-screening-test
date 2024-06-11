import nodemailer from 'nodemailer'
import dotenv from 'dotenv';

dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     // host:"smtp.gmail.com",
//     auth: {
//         user: process.env.MAIL_EMAIL,
//         pass: process.env.MAIL_SECRET
//     }
// })

const transporter = nodemailer.createTransport({
    host: "mailhog",
    port: 1025,
});

export default ({ to, subject, html }) => {
    const options = {
        from: `GE CoPilot™ <${process.env.MAIL_EMAIL}>`,
        to,
        subject,
        html
    }

    transporter.sendMail(options, (err, done) =>{
        if (err) {
            console.error('Failed to send email:',err);
        } else {
            console.log('Email sent: ', done?.response);
        }
    });
}