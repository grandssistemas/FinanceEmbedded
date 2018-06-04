import template from '../views/viewer.html';

const component = {
	template,
	controller: 'ViewerEmbeddedController',
	bindings: {
		entity: '=',
		variable: '=',
		filters: '=',
		backState: '&'
	}
};

export default component;
