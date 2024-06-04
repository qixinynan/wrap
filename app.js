const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const requestIP = require('request-ip')

const app = express()
app.set('trust proxy', false)
app.use(requestIP.mw({ attributeName: 'clientIP' }))
app.set('view engine', 'ejs');
const port = 3000

const db = new sqlite3.Database(
  'data.db',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error(err.message)
    }
    else {
      console.log("Connected to database")
    }
  }
)

db.run(`create table record(url text, ip text, ua text, time TIMESTAMP default (datetime('now', 'localtime')));`, function (err) { })

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/go', (req, res) => {
  if (!req.query.url) {
    res.sendStatus(400)
  }
  const url = req.query.url;
  const clientIp = requestIP.getClientIp(req);
  const ua = req.headers['user-agent'];
  console.log(`Get user from ${clientIp} to ${url} with UA(${ua})`)

  db.run('INSERT INTO record(url, ip, ua) VALUES(?, ?, ?)', [url, clientIp, ua], function (err) {
    if (err) {
      return console.log('insert data error: ', err.message)
    }
  })
  res.location(url)
  res.statusCode = 302;
  res.send("");
})

app.get('/data', (req, res) => {
  db.all('SELECT * FROM record ORDER BY time DESC', function (err, rows) {
    if (err) {
      return console.log('find Alice error: ', err.message)
    }
    res.render('data', { data: rows })
  })
})

app.listen(port, () => {
  console.log(`Warp listening on port ${port}`)
})