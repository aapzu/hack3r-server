import fs from 'node:fs'
import path from 'node:path'
import { fromPairs, map, mapObjIndexed } from 'ramda'
import { z } from 'zod'

const getAndValidatePayloadValue = (relativePath: string): string => {
  const absolutePath = path.resolve(__dirname, '..', relativePath)
  const stat = fs.statSync(absolutePath)
  if (!stat.isFile()) {
    throw new Error(`Payload ${relativePath} is not a file`)
  }
  return absolutePath
}

const getStringPayload = (payloadFileName: string): Record<string, string> => ({
  [path.basename(payloadFileName)]: getAndValidatePayloadValue(payloadFileName),
})

const getArrayPayload = (payloadFileNames: string[]): Record<string, string> =>
  fromPairs(
    map(
      (value) => [path.basename(value), getAndValidatePayloadValue(value)],
      payloadFileNames
    )
  )

const getObjectPayload = (
  payload: Record<string, string>
): Record<string, string> =>
  mapObjIndexed((value) => getAndValidatePayloadValue(value), payload)

const stringPayloadSchema = z.string().transform(getStringPayload)
const arrayPayloadSchema = z.array(z.string()).transform(getArrayPayload)
const objectPayloadSchema = z.record(z.string()).transform(getObjectPayload)
const payloadSchema = z.union([
  stringPayloadSchema,
  arrayPayloadSchema,
  objectPayloadSchema,
])

const getPayloadObject = (
  payload: string | string[] | Record<string, string> | unknown
): Record<string, string> => {
  return payloadSchema.parse(payload)
}

export default getPayloadObject
