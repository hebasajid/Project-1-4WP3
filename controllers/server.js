const express = require('express');
const app = express();
const mustacheExpress = require('mustache-express');
const db = require('../models/model.js'); // setting up dependencies and importing the db