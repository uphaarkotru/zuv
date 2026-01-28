require('dotenv').config() // to use .env variables
const express = require('express')
const app = express()
app.use(express.json()) // needed to attach JSON data to POST body property
var nodemailer = require('nodemailer'); // middleware to send e-mails
const cors = require('cors') // Cross-origin resource sharing (CORS) middleware is required to allow requests from other origins
const bcrypt = require("bcrypt") // For password hashing and comparing
const session = require('express-session'); // for session management
const multer = require('multer') // for image upload and storage
const fs = require('fs'); // for base64 conversion of images
const path = require('path')

// Validate required environment variables at startup
const requiredEnvVars = ['SESSION_SECRET', 'EMAIL_ADDRESS', 'EMAIL_PASSWORD', 'CLIENT_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
	console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
	process.exit(1);
}

// CORS configuration - restrict origins to CLIENT_URL
app.use(cors({
	origin: process.env.CLIENT_URL,
	credentials: true
}))
app.use(express.static('build')) // express checks if the 'build' directory contains the requested file
app.use('/images', express.static('./images')) // to serve static files to path /images, from images folder

// Session configuration with secure cookie settings
app.use(session({
	secret: process.env.SESSION_SECRET,
	saveUninitialized: true,
	resave: true,
	cookie: {
		httpOnly: true,
		sameSite: 'strict',
		maxAge: 24 * 60 * 60 * 1000,
		secure: process.env.NODE_ENV === 'production'
	}
}));
const http = require('http').Server(app)

// Socket.IO configuration with restricted CORS
const socketIO = require('socket.io')(http, {
	cors: {
		origin: process.env.CLIENT_URL,
		credentials: true
	}
});

const { Pool } = require('pg')
const pool = new Pool({
	user: 'matcha',
	host: 'postgres-db',
	database: 'matcha',
	password: 'root',
	port: 5432,
})

const connectToDatabase = () => {
	pool.connect((err, client, release) => {
		if (err) {
			console.log('Error acquiring client', err.stack)
			console.log('Retrying in 5 seconds...')
			setTimeout(connectToDatabase, 5000)
		} else {
			console.log('Connected to database')
		}
	})
}
connectToDatabase()

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	}
});

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images/')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
	},
})
const upload = multer({ storage: storage })

require('./routes/signup.js')(app, pool, bcrypt, transporter);
require('./routes/login_logout.js')(app, pool, bcrypt)
require('./routes/resetpassword.js')(app, pool, bcrypt, transporter)
require('./routes/profile.js')(app, pool, upload, fs, path, bcrypt)
require('./routes/browsing.js')(app, pool, transporter, socketIO)
require('./routes/chat.js')(pool, socketIO)
require('./routes/chat_api.js')(app, pool)

const PORT = process.env.PORT || 3001

http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`)
})
