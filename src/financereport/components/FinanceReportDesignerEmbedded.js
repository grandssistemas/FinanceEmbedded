import template from '../views/designer.html';

const component = {
	template,
	controller: 'DesignerEmbeddedController',
	bindings: {
		backState: '&',
		entity: '=',
		variable: '='
	}
};

export default component;
