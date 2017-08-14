import templateTitlePayList from './titlePayListLayout.html'
import templateTitlePayForm from './titlePayFormLayout.html'

const titlePay = () => {
    return {
        restrict: 'E',
        template: `<div ng-switch on="selection">
                        <div ng-switch-when="list">
                            <div ng-include="titlePayList.layout" ng-dynamic-controller="titlePayList.controller"></div>
                        </div>
                        <div ng-switch-when="form">
                            <div ng-include="titlePayForm.layout" ng-dynamic-controller="titlePayForm.controller"></div>
                        </div>
                      </div>`,
        link: function (scope, el, attr) {
            scope.selection = 'form';
            scope.titlePayList = {
                layout: templateTitlePayList,
                controller: 'TitlePayListController'
            }

            scope.titlePayForm = {
                layout: templateTitlePayForm,
                controller: 'TitlePayFormController'
            }

            scope.$on('changeTitlePay', (event, data) => {
                scope.selection = data
                console.log(event)
                console.log(data)
            });


        }
    }
}
titlePay.$inject = [];

module.exports = titlePay;