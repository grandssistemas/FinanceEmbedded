require('./style.css');

angular.module('mbCheck', [])
    .component('mbCheck', {
        bindings: {
            'ngModel': '=',
            'onChange': '&?'
        },
        controller: ['$timeout', function ($timeout) {
            const $ctrl = this;

            $ctrl.toogle = (evt) => {
                evt.stopPropagation();
                $ctrl.ngModel = !$ctrl.ngModel;
                $timeout(() => {
                    if ($ctrl.onChange) {
                        $ctrl.onChange();
                    }
                });
            }

        }],
        template: `
            <div class="check-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        version="1.1"
                        x="0px"
                        y="0px"
                        viewBox="0 0 100 100"
                        ng-show="!$ctrl.ngModel"
                        ng-click="$ctrl.toogle($event)"
                        class="unchecked"
                        xml:space="preserve">
                    <g>
                        <g>
                            <path d="M50,22.5c-15.2,0-27.5,12.3-27.5,27.5S34.8,77.5,50,77.5S77.5,65.2,77.5,50S65.2,22.5,50,22.5z M50,72.5    c-12.4,0-22.5-10.1-22.5-22.5S37.6,27.5,50,27.5S72.5,37.6,72.5,50S62.4,72.5,50,72.5z"
                            />
                            <path d="M58.2,41.6L46.7,53.1l-4.9-4.9c-1-1-2.6-1-3.5,0c-1,1-1,2.6,0,3.5l6.7,6.7c0.5,0.5,1.1,0.7,1.8,0.7s1.3-0.2,1.8-0.7    l13.3-13.3c1-1,1-2.6,0-3.5C60.8,40.6,59.2,40.6,58.2,41.6z"
                            />
                        </g>
                    </g>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        version="1.1"
                        x="0px"
                        y="0px"
                        viewBox="0 0 66 66"
                        ng-show="$ctrl.ngModel"
                        ng-click="$ctrl.toogle($event)"
                        class="checked"
                        xml:space="preserve">
                    <g>
                        <path d="M33,60.3C48.1,60.3,60.3,48,60.3,33C60.3,17.9,48.1,5.7,33,5.7C17.9,5.7,5.7,17.9,5.7,33C5.7,48,17.9,60.3,33,60.3z    M21.7,30.9l7,7l15.6-15.6l3.6,3.6l-0.3,0.3L28.7,45L18.1,34.4L21.7,30.9z"
                        />
                    </g>
                </svg>
            </div>
        `
    });