var dotenv = require('dotenv');
dotenv.load();

// var config = require('./config/config');
var blob = require('azure-storage');
// var bluebird = require('bluebird');
// var blob_key = config.blob.key1;
// var request = require('request');
var fetchFromIbm = require('./fetchFromIbm');
var uploadTextToBlob = require('./uploadTextToBlob');
var moment = require('moment');
// Loading env variables from .env file.

// AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY env vars must be configured.
if (!process.env.AZURE_STORAGE_ACCOUNT || !process.env.AZURE_STORAGE_ACCESS_KEY) {
  console.log('ENV variables must has AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY');
  process.exit(5); // exit with fatal error
}

// var url = 'http://unicefdata.mybluemix.net/get_data?date=';

var blobSvc = blob.createBlobService();
// var container = require('./container/create_container.js');
var weather_kinds = ['temperature', 'humidity', 'precipitation'];

var date = moment().format('YYYY-MM-DD');

// weather_kinds.forEach(function(kind) {
  // blobSvc.createContainerIfNotExists(kind, {
  // }, function(error, result, response) {
  //   if (!error) {
  //     resolve(); // if result = false, container already existed.
  //   } else {
  //     console.log(error);
  //     return reject(error);
  //   }
  // });
// });
//
var insureContainers = weather_kinds.map(function(kind) {
  return new Promise(function(res, rej) {
    blobSvc.createContainerIfNotExists(kind, {
    }, function(error, result, response) {
      if (!error) {
        if (result) {
          console.log(kind + " container exist");
        } else {
          console.log(kind + " container created");
        }
        res(); // if result = false, container already existed.
      } else {
        console.log(error);
        return rej(error);
      }
    });
  });
});

Promise.all(insureContainers).then(fetchTodaysWeather);

function fetchTodaysWeather() {
  weather_kinds.forEach(function(kind) {
    fetchFromIbm(date, kind)
    .then(function(data) {
      return uploadTextToBlob(date, kind, data);
    })
    .then(console.log)
    .catch(function(error) {
      console.error('ERROR', error);
    });
  });
}

// function init() {
//   bluebird.map(weather_kinds, function(kind, i) {
//     return create_container_and_fetch(kind);
//  }, {concurrency: 1}).then(function() {
//     process.exit();
//   });
// }
//
// init();
//
// function create_container_and_fetch(kind) {
//   return new Promise(function(resolve, reject) {
//     container.create_storage_container(kind)
//     .catch(err => {
//       console.log(err);
//     }).then(function() {
//       var start_date = new Date(config.start_date);
//       var dates = getDates(start_date, new Date());
//       var formatted_dates = dates.map(function(d) {
//         return formatDate(d);
//       });
//
//       get_dates_already_stored(kind, formatted_dates)
//       .then(function(filtered_dates) {
//         bluebird.map(filtered_dates, function(date, i) {
//           return fetch(date, kind);
//         }, {concurrency: 1}).then(function() {
//           resolve();
//         });
//       });
//     });
//   });
// }
//
// function get_dates_already_stored(kind, formatted_dates) {
//   return new Promise(function(resolve, reject) {
//     blobSvc.listBlobsSegmented(kind, null, function(error, result, response) {
//       if (!error) {
//         var stored_dates = result.entries.map(function(e) {
//           return e.name;
//         });
//         var dates_to_fetch = formatted_dates.filter(function(e) {
//           return stored_dates.indexOf(e) === -1;
//         });
//         resolve(dates_to_fetch);
//       }
//     });
//   });
// }
//
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
//
// function getDates( d1, d2 ) {
//   var oneDay = 24 * 3600 * 1000;
//   var d = [];
//   for (var ms = Number(d1) * 1, last = Number(d2) * 1; ms < last; ms += oneDay) {
//     d.push(new Date(ms));
//   }
//   return d;
// }
//
// function formatDate(date) {
//   var d = new Date(date);
//   var month = String(d.getMonth() + 1);
//   var day = String(d.getDate());
//   var year = d.getFullYear();
//
//   if (month.length < 2) month = '0' + month;
//   if (day.length < 2) day = '0' + day;
//   return [year, month, day].join('-');
// }
