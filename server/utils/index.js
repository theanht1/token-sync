const crypto = require('crypto');
const util = require('ethereumjs-util');


const hashObject = (obj) => {
  return crypto.createHash('sha').update(JSON.stringify(obj)).digest('hex');
};

const hashEvent = (event) => {
  return hashObject({
    blockHash: event.blockHash,
    transactionHash: event.transactionHash,
    logIndex: event.logIndex,
    event: event.event,
  });
};

const buyRequestHash = ({ id, to, value }) => {
  return util.sha3([id, to, value]);
};

module.exports = {
  hashObject,
  hashEvent,
  buyRequestHash,
};
