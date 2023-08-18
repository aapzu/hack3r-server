import path from 'path';
import fs from 'fs';
import { fromPairs, mapValues } from 'lodash';
const getAndValidatePayloadValue = (relativePath) => {
    const absolutePath = path.resolve(__dirname, '..', relativePath);
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) {
        throw new Error(`Payload ${relativePath} is not a file`);
    }
    return absolutePath;
};
const getPayloadObject = (payload) => {
    if (!payload) {
        return undefined;
    }
    if (typeof payload === 'string') {
        return { [path.basename(payload)]: getAndValidatePayloadValue(payload) };
    }
    if (Array.isArray(payload)) {
        return fromPairs(payload.map(value => [path.basename(value), getAndValidatePayloadValue(value)]));
    }
    if (typeof payload === 'object') {
        return mapValues(payload, value => getAndValidatePayloadValue(value));
    }
    throw new Error(`Invalid payload, type: ${typeof payload}, value: ${JSON.stringify(payload)}`);
};
export default getPayloadObject;
//# sourceMappingURL=payload.mjs.map