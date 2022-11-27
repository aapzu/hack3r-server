const path = require("node:path")
const fs = require("node:fs")
const { fromPairs, mapValues } = require('lodash')

const getAndValidatePayloadValue = (relativePath) => {
  const absolutePath = path.resolve(__dirname, relativePath)
  const stat = fs.statSync(absolutePath)
  if (!stat.isFile()) {
    throw new Error(`Payload ${relativePath} is not a file`)
  }
  return absolutePath
}

const getPayloadObject = (payload) => {
  if (!payload) {
    return undefined
  }
  if (typeof payload === 'string') {
    return { [path.basename(payload)]: getAndValidatePayloadValue(payload) }
  }
  if (typeof payload === 'object') {
    if (Array.isArray(payload)) {
      return fromPairs(payload.map((value) =>
        [path.basename(value), getAndValidatePayloadValue(value)]
      ))
    }
    return mapValues(payload, getAndValidatePayloadValue)
  }
  throw new Error(`Invalid payload, type: ${typeof payload}, value: ${JSON.stringify(payload)}`)
}

module.exports = getPayloadObject