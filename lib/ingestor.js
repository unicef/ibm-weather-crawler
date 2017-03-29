import blob from 'azure-storage';
import moment from 'moment';
import fetchFromIbm from './fetchFromIbm';
import uploadTextToBlob from './uploadTextToBlob';
import {WEATHER_KINDS} from './helpers';

const blobSvc = blob.createBlobService();
const date = process.argv[2] || moment().format('YYYY-MM-DD');

var insureContainers = WEATHER_KINDS.map(function(kind) {
  return new Promise(function(res, rej) {
    blobSvc.createContainerIfNotExists(kind, {
    }, (error, result, response) => {
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

/**
 * [fetchTodaysWeather description]
 */
export function fetchTodaysWeather() {
  WEATHER_KINDS.forEach(kind => {
    fetchFromIbm(date, kind)
    .then(data => uploadTextToBlob(date, kind, data))
    .then(console.log)
    .catch(error => console.error('ERROR', error));
  });
}

/**
 * [run description]
 * @return {[promise]} [description]
 */
export function ingestor() {
  return Promise.all(insureContainers).then(fetchTodaysWeather);
}
