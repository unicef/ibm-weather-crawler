var config = require('./config/config');
var request = require('request');
var url = config.url;

// function fetch(date, kind) {
//   return new Promise(function(resolve, reject) {
//     console.log('Fetching', url + date + '&var=' + kind);
//     request(url + date + '&var=' + kind, function(error, response, body) {
//       blobSvc.createAppendBlobFromText(kind, date, body, function(error, result, response) {
//         if (!error) {
//           resolve();
//         } else {
//           console.log(error);
//           return reject(error);
//         }
//       });
//     });
//   });
// }

module.exports = function(date, kind) {
  return new Promise(function(res, rej) {
    console.log('Fetching', url + date + '&var=' + kind);
    request(url + date + '&var=' + kind, function(error, response, body) {
      if (error) {
        rej(error);
        return;
      }

      if (!body) {
        rej({message: "body is empty"});
        return;
      }

      res(body);
    });
  });
};
