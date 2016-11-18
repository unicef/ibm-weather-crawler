var azure = require('azure-storage');
var config = require('../config/config');
var azure_key = config.blob.key1;
var storage_account = config.blob.storage_account;
var blobSvc = azure.createBlobService(storage_account, azure_key);

exports.create_storage_container = function(name) {
  console.log('Create container for', name);
  return new Promise(function(resolve, reject) {
    blobSvc.createContainerIfNotExists(name, {
    }, function(error, result, response) {
      if (!error) {
        resolve(); // if result = false, container already existed.
      } else {
        console.log(error);
        return reject(error);
      }
    });
  });
};
