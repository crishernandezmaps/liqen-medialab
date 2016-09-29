const express = require('express')
const bodyParser = require('body-parser')

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
  
  res.json(result)
})

app.listen(app.get('port'), function () {
  console.log('Listening to port', app.get('port'))
})
