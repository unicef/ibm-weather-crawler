var blob = require('azure-storage');
var blobSvc = blob.createBlobService();

module.exports = function(date, kind, data) {
  return new Promise(function(res, rej) {
    // we need to store it in azure
    blobSvc.createAppendBlobFromText(kind, date, data, function(error, result, response) {
      if (!error) {
        res(
          "Stored in Azure [" +
          process.env.AZURE_STORAGE_ACCOUNT +
          "/" +
          kind + "] - IBM " + kind + " data for " + date
        );
      } else {
        rej(error);
      }
    });
  });
};
