import dotenv from 'dotenv';
dotenv.load();

// AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY env vars must be configured.
const {AZURE_STORAGE_ACCOUNT = null, AZURE_STORAGE_ACCESS_KEY = null} = process.env;

if (!AZURE_STORAGE_ACCOUNT || !AZURE_STORAGE_ACCESS_KEY) {
  console.log('ENV variables must has AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY');
  process.exit(5); // exit with fatal error
}

const {ingestor} = require('./lib/ingestor');

// run the ingestor
ingestor();
