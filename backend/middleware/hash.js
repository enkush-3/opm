
import Hashids from 'hashids';

const hashids = new Hashids('oNote_secret_salt', 20);

export const encodeId = (mongoId) => {
    const hex = mongoId.toString();
    return hashids.encodeHex(hex);
};

export const decodeId = (encodedId) => {
    return hashids.decodeHex(encodedId);
};