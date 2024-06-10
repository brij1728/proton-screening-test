import ChatRoute from './routes/chat.js'
import UserRoute from './routes/user.js'
import { connectDB } from './db/connection.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotnet from 'dotenv'
import express from 'express'
import path from 'path'
dotnet.config()

let app = express()
let port = process.env.PORT

// for production copy paste react js product build files in dist folder
app.use(express.static('dist'))

app.use(cors({ credentials: true, origin: process.env.SITE_URL ,  optionsSuccessStatus: 200}))
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))

// api route
app.use('/api/chat/', ChatRoute)
app.use('/api/user/', UserRoute)

// front end react route
// app.get('/*',(req,res)=>{
//     res.sendFile(path.join(`${path.resolve(path.dirname(''))}/dist/index.html`))
// })

connectDB((err) => {
    if (err) return console.log("MongoDB Connect Failed : ", err)

    console.log("MongoDB Connected")

    app.listen(port, () => {
        console.log("server started")
    })
})

