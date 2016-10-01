const express = require('express')
const bodyParser = require('body-parser')
const calculateScore = require('./lib/logic')
const db = require('./lib/db')

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 5000)
app.use(express.static('public'))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// "index.html"
app.get('/metrics', function (req, res) {
  const sensor = req.query.device || 0
  const start  = Date.parse(req.query.start) || 0
  const end    = Date.parse(req.query.end) || Date.now()
  db.read({ sensor, start, end})
    .then(function (docs) {
      res.json(docs)
    })
    .catch(function (err) {
      console.log(err)
      res.send(err)
    })
})

// Get the form sending
app.post('/metrics', function (req, res) {
  const answers = {
    'procedence' : req.body['procedence'],
    'noise-disturbance' : req.body['noise-disturbance'],
    'source' : req.body['source'],
    'noisy-area' : req.body['noisy-area'],
    'sleep-quality' : req.body['sleep-quality'],
    'for-working-here' : req.body['for-working-here'],
    'at-home' : req.body['at-home'],
    'continuous' : req.body['continuous'],
    'for-living-here' : req.body['for-living-here'],
    'other-time' : req.body['other-time'],
    'thirty-mins' : req.body['thirty-mins']
  }

  const r = calculateScore(answers)
  const decibels = r.decibels
  const score = r.score

  const result = {
    timestamp: Date.now(),
    sensor: req.body.sensor_id || 0,
    position: {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    },
    answers,
    score,
    decibels
  }

  // Now save "result" in MONGODB
  // And redirect...
  db.write(result)
    .then(function (result) {
      res.redirect('http://liqenproject.org')
    })
    .catch(function (err) {
      res.json(err)
    })
})

app.listen(app.get('port'), function () {
  console.log('Connected to database: ', process.env.MONGODB_URI)
  console.log('Listening to port', app.get('port'))
})
