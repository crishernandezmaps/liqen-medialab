const express = require('express')
const bodyParser = require('body-parser')
const mongodb = require('mongodb');

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 5000)
app.use(express.static('public'))

// "index.html"
app.get('/', function (req, res) {
  const options = {
    root: __dirname + '/public/'
  }
  res.sendFile('index.html', options)
})

// Get the form sending
app.post('/', function (req, res) {
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

  const baremo = {
    'procedence': {
      'home': 1,
      'transit': 3,
      'other': 2
    },

    'noise-disturbance' : {
      0: 0,
      1: 3,
      2: 4
    },

    'source' : {
      'motor' : 2,
      'work': 2,
      'leisure': 2,
      'unknown': 1
    },

    'noisy-area' : {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 5
    },

    'sleep-quality' : {
      0: 1,
      1: 3,
      2: 5
    },

    'for-working-here' : {
      'yes': 0,
      'no': 3
    },

    'at-home' : {
      'better': 0,
      'same': 1,
      'worse': 2
    },

    'continuous' : {
      'yes': 0,
      'no': 0
    },

    'for-living-here' : {
      'yes': 0,
      'no': 3
    },

    'other-time' : {
      'better': 0,
      'same': 1,
      'worse': 2
    },

    'thirty-mins' : {
      'better': 0,
      'same': 1,
      'worse': 3
    },
  }

  // Range: 7 - 28
  let score = 0
  for (let key in answers) {
    const answer = answers[key]
    score += baremo[key][answer] || 0
  }

  let decibels = 30

  // Reference points:
  // 7 ~ 30
  // 14 ~ 55
  // 28 ~ 100

  if (score > 7 && score < 14) {
    decibels = 30 + (55 - 30) * (score-7) / (14-7)
  } else if (score < 28) {
    decibels = 55 + (100 - 55) * (score-14) / (28-14)
  }

  const result = {
    timestamp: Date.now(),
    sensor: req.body.sensor_id,
    position: {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    },
    answers,
    score,
    decibels
  }

  // Now save "result" in MONGODB
  console.log(result)
  res.json(result)

  mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
    if (err) throw err;
    // Note that the insert method can take either an array or a dict.
    
    // Select "table" (collection)
    const metrics = db.collection('metrics');

    metrics.insert([result], function(err, result) {
    })

  })
})

app.listen(app.get('port'), function () {
  console.log('Connected to database: ', process.env.MONGODB_URI)
  console.log('Listening to port', app.get('port'))
})
