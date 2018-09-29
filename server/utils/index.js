const crypto = require('crypto');


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

module.exports = {
  hashObject,
  hashEvent,
};
