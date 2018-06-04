import template from '../views/form.html';

const component = {
	template,
	controller: 'CashCheckinEmbeddedFormController',
	bindings: {
		employee: '=',
		disableOpening: '=',
		onGoHome: '&'
	}
};

export default component;
