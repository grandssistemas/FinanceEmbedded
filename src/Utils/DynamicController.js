const ngDynamicController = ($compile, $parse) => {
    return {
        restrict: 'A',
        terminal: true,
        priority: 100000,
        link: function (scope, elem) {
            const name = $parse(elem.attr('ng-dynamic-controller'))(scope);
            elem.removeAttr('ng-dynamic-controller');
            elem.attr('ng-controller', name);
            $compile(elem)(scope);
        }
    };
};

ngDynamicController.$inject = ['$compile', '$parse'];
export default ngDynamicController