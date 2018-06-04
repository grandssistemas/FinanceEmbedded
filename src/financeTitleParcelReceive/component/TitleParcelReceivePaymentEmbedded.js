import template from '../views/pay.html';

const component = {
	template,
	controller: 'PayReceiveEmbeddedController',
	bindings: {
		onMakePayment: '&'
	}
};

export default component;
