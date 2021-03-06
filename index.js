require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./models/note')
const config = require('./utils/config')
const logger = require('./utils/logger')

app.use(express.static('build'))
app.use(express.json())


// let notes = [
//   {
//     id: 1,
//     content: "HTML is easy",
//     date: "2020-01-10T17:30:31.098Z",
//     imconfig.portant: true
//   },
//   {
//     id: 2,
//     content: "Browser can execute only Javascript",
//     date: "2020-01-10T18:39:34.091Z",
//     imconfig.portant: false
//   },
//   {
//     id: 3,
//     content: "GET and POST are the most imconfig.portant methods of HTTP protocol",
//     date: "2020-01-10T19:20:14.298Z",
//     imconfig.portant: true
//   }
// ]

app.get('/', (req, res) => {
	res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (req, res) => {
	Note.find({}).then(notes => {
		res.json(notes)
	})
})

// const generateId = () => {
//   const maxId = notes.length > 0
//     ? Math.max(...notes.map(n => n.id))
//     : 0
//   return maxId + 1
// }

app.post('/api/notes', (request, response, next) => {
	const body = request.body

	if (!body.content) {
		return response.status(400).json({
			error: 'content missing'
		})
	}

	const note = new Note({
		content: body.content,
		important: body.important || false,
		date: new Date(),
	})

	// notes = notes.concat(note)
	note
		.save()
		.then(savedNote => savedNote.toJSON())
		.then(savedAndFormattedNote => {
			response.json(savedAndFormattedNote)
		})
		.catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
	const body = request.body

	const note = {
		content: body.content,
		important: body.important,
	}

	Note.findByIdAndUpdate(request.params.id, note, { new: true })
		.then(updatedNote => {
			response.json(updatedNote)
		})
		.catch(error => next(error))
})

app.get('/api/notes/:id', (request, response, next) => {
	// const id = Number(request.params.id)
	// const note = notes.find(note => note.id === id)

	// if (note) {
	//   response.json(note)
	// } else {
	//   response.status(404).end()
	// }

	Note.findById(request.params.id)
		.then(note => {
			if (note) {
				response.json(note)
			} else {
				response.status(404).end()
			}
		})
		.catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
	// const id = Number(request.params.id)
	// notes = notes.filter(note => note.id !== id)

	// response.status(204).end()

	Note.findByIdAndRemove(request.params.id)
		.then(result => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

app.listen(config.PORT, () => {
	logger.info(`Server running on config.port ${config.PORT}`)
})

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)