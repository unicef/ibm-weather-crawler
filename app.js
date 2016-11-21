var config = require('./config/config');
var blob = require('azure-storage');
var bluebird = require('bluebird');
var blob_key = config.blob.key1;
var request = require('request');
var storage_account = config.blob.storage_account;
var url = config.url;

var blobSvc = blob.createBlobService(storage_account, blob_key);
var container = require('./container/create_container.js');
var weather_kinds = config.kinds;

function init() {
  bluebird.map(weather_kinds, function(kind, i) {
    return create_container_and_fetch(kind);
  }, {concurrency: 1}).then(function() {
    process.exit();
  });
}

init();

function create_container_and_fetch(kind) {
  return new Promise(function(resolve, reject) {
    container.create_storage_container(kind)
    .catch(err => {
      console.log(err);
    }).then(function() {
      var start_date = new Date(config.start_date);
      var dates = getDates(start_date, new Date());
      var formatted_dates = dates.map(function(d) {
        return formatDate(d);
      });

      get_dates_already_stored(kind, formatted_dates)
      .then(function(filtered_dates) {
        bluebird.map(filtered_dates, function(date, i) {
          return fetch(date, kind);
        }, {concurrency: 1}).then(function() {
          resolve();
        });
      });
    });
  });
}

function get_dates_already_stored(kind, formatted_dates) {
  return new Promise(function(resolve, reject) {
    blobSvc.listBlobsSegmented(kind, null, function(error, result, response) {
      if (!error) {
        var stored_dates = result.entries.map(function(e) {
          return e.name;
        });
        var dates_to_fetch = formatted_dates.filter(function(e) {
          return stored_dates.indexOf(e) === -1;
        });
        resolve(dates_to_fetch);
      }
    });
  });
}

function fetch(date, kind) {
  return new Promise(function(resolve, reject) {
    console.log('Fetching', url + date + '&var=' + kind);
    request(url + date + '&var=' + kind, function(error, response, body) {
      blobSvc.createAppendBlobFromText(kind, date, body, function(error, result, response) {
        if (!error) {
          resolve();
        } else {
          console.log(error);
          return reject(error);
        }
      });
    });
  });
}

function getDates( d1, d2 ) {
  var oneDay = 24 * 3600 * 1000;
  var d = [];
  for (var ms = Number(d1) * 1, last = Number(d2) * 1; ms < last; ms += oneDay) {
    d.push(new Date(ms));
  }
  return d;
}

function formatDate(date) {
  var d = new Date(date);
  var month = String(d.getMonth() + 1);
  var day = String(d.getDate());
  var year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}
