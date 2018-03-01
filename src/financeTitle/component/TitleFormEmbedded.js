import TitleFormEmbeddedController from '../controllers/TitleFormEmbeddedController';
let template = require('../views/form.html');

module.exports = {
    templateUrl: template,
    controller: TitleFormEmbeddedController,
    bindings:{
        typeTitle: '@',
        operation: '@',
        voice: '@',
        onParcelsEmpty: '&',
        onSaveOperationReplecement: '&',
        onBackClick: '&',
        onPayPutSuccess: '&',
        onReceivePutSuccess: '&',
        onSaveOperationRenegotiation: '&',
        entity: '='
    }
};