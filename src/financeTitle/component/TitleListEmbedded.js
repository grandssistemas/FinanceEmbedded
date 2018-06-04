import template from '../views/list.html';

const component = {
	template,
	controller: 'TitleListEmbeddedController',
	bindings: {
		titleType: '@',
		onNewTitle: '&',
		onEditTitle: '&',
		onReplacement: '&'
	}
};

export default component;
