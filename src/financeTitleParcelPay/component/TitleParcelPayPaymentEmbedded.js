import template from '../views/pay.html';

const component = {
	template,
	controller: 'PayEmbeddedController',
	bindings: {
		onBackClick: '&'
	}
};

export default component;
