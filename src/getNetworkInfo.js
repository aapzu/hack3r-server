const { execSync } = require('node:child_process');
const { fromPairs } = require("lodash")

const getNetworkInfo = () => {
  const NETWORK_REGEX = /^(?<networkInterface>\w+): .+\n(?:.+\n){0,10}\s+inet\s(?<inetAddress>[\d\.]+)/

  const stdout = execSync('ifconfig').toString()
  const sections = stdout.split(/\n{2,3}(?=\S)/g)
  const a = sections
    .filter(s => NETWORK_REGEX.test(s))
    .map(section => {
      const { groups: { networkInterface, inetAddress } } = section.match(NETWORK_REGEX)
      return [networkInterface, { inet: inetAddress }]
    })
  return fromPairs(a)
}

module.exports = getNetworkInfo