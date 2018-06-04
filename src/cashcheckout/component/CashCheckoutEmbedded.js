import template from '../views/form.html';

const component = {
	template,
	controller: 'CashCheckoutEmbeddedFormController',
	bindings: {
		entity: '=',
		onGoHome: '&'
	}
};

export default component;
