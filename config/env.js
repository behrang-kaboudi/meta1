// config/env.js
const dotenv = require('dotenv');
dotenv.config();
const ENV = process.env.NODE_ENV || 'development';
const prefix = ENV === 'production' ? 'PROD_' : 'DEV_';

const user = process.env[`${prefix}MONGO_USER`];
const pass = process.env[`${prefix}MONGO_PASS`];
const host = process.env[`${prefix}MONGO_HOST`];
const port = process.env[`${prefix}MONGO_PORT`];
const db = process.env[`${prefix}MONGO_DB`];
const auth = user && pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
const MONGO_URI = `mongodb://${auth}${host}:${port}/${db}`;
// const MONGO_URI = `mongodb://${auth}${host}:${port}/${db}${query}`;
//   const params = process.env[`${prefix}PARAMS`] || process.env.MONGO_PARAMS || '';

module.exports = { MONGO_URI, ENV };
