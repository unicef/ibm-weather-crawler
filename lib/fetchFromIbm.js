import request from 'request';
import {URL} from './helpers';

module.exports = function(date, kind) {
  return new Promise((res, rej) => {
    console.log('Fetching', URL + date + '&var=' + kind);
    request(URL + date + '&var=' + kind, (error, response, body) => {
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
