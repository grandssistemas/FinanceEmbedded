import TitleFormEmbeddedController from '../controllers/TitleFormEmbeddedController';
import template from '../views/form.html';

const component = {
	template,
	controller: TitleFormEmbeddedController,
	bindings: {
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

export default component;
