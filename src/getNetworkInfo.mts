import { execSync } from 'child_process';
import { fromPairs } from 'ramda';

interface NetworkInfo {
  [key: string]: {
    inet: string;
  };
}

const getNetworkInfo = (): NetworkInfo => {
  const NETWORK_REGEX = /^(?<networkInterface>\w+): .+\n(?:.+\n){0,10}\s+inet\s(?<inetAddress>[\d\.]+)/;

  const stdout = execSync('ifconfig').toString();
  const sections = stdout.split(/\n{2,3}(?=\S)/g);
  const networkInfoArray = sections
    .filter(s => NETWORK_REGEX.test(s))
    .map(section => {
      const match = section.match(NETWORK_REGEX)
      if (!match || !match.groups) {
        throw new Error(`Invalid network section: ${section}`);
      }
      const { groups: { networkInterface, inetAddress } } = match;
      return [networkInterface, { inet: inetAddress }] as const;
    });

  return fromPairs(networkInfoArray);
};

export default getNetworkInfo;
