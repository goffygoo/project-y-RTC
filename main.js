const express = require('express')
const http = require('http')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

const server = http.createServer(app)
const io = require('socket.io')(server, {
	cors: {
		origin: ['http://localhost:3000', 'http://localhost:4500', 'https://gaffar.vercel.app', 'https://discode-app.vercel.app'],
		methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH", "CONNECT", "OPTIONS", "TRACE", "PATCH"]
	}
});

app.use(cors())
app.use(bodyParser.json())

app.get('/', (_req, res) => {
	res.send({ "some data": "for you" })
})

let connections = []
let names = {}
let timeOnline = {}

io.on('connection', (socket) => {
	console.log(socket.id + " connected")

	socket.on('join-call', (name) => {
		connections.push(socket.id)
		names[socket.id] = name

		timeOnline[socket.id] = new Date()

		for (let a = 0; a < connections.length; ++a) {
			io.to(connections[a]).emit("user-joined", socket.id, connections, names)
		}
	})

	socket.on('signal', (toId, message) => {
		io.to(toId).emit('signal', socket.id, message)
	})

	socket.on('disconnect', () => {
		var diffTime = Math.abs(timeOnline[socket.id] - new Date())

		console.log(socket.id, connections)

		for (let a = 0; a < connections.length; ++a) {
			if (connections[a] === socket.id) {
				for (let a = 0; a < connections.length; ++a) {
					io.to(connections[a]).emit("user-left", socket.id)
				}

				var index = connections.indexOf(socket.id)
				connections.splice(index, 1)

				console.log(connections)

				console.log(socket.id, Math.ceil(diffTime / 1000))
			}
		}

		console.log("final", connections)
	})
})

server.listen(process.env.PORT || 5001, () => {
	console.log("Server Running...")
})