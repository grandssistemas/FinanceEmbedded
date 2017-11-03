require('./components/module');
require('./controllers/module');
require('./services/module');
require('../providers/module');
module.exports = angular.module('finance.stimulsoftembedded', ['finance.stimulsoftembedded.components','finance.stimulsoftembedded.controllers', 'finance.stimulsoftembedded.service','finance.providers']);
