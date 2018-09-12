const crypto = require('crypto');


module.exports = {
  hashObject: (obj) => {
    return crypto.createHash('sha').update(JSON.stringify(obj)).digest('hex');
  },
};
