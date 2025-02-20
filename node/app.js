const http = require('http')
const express = require('express')
const app = express()
const PORT = 5000
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')







const server = http.createServer(app)
app.use((req, res, next) => {
    const allowedOrigins = ['*', 'http://localhost:4200', 'http://localhost:5000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    console.log("req.original url", req.originalUrl)

    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors({ origin: '*' }))
app.use('/uploads', express.static(path.join(__dirname, '/uploads'), { maxAge: 7 * 86400000 }));

require('./Routes/items')(app)
mongoose.connect('mongodb://localhost:27017/itemDb')


server.listen(PORT, (err) => {
    if (err) {
        console.error("error found in creating server", err)
    } else {
        console.log("Server created Successfully at port", PORT)
    }


})