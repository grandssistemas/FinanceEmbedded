(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var template = '\n  <div class="alert gmd gmd-alert-popup alert-ALERT_TYPE alert-dismissible" role="alert">\n    <button type="button" class="close" aria-label="Close"><span aria-hidden="true">\xD7</span></button>\n    <strong>ALERT_TITLE</strong> ALERT_MESSAGE\n    <a class="action" style="display: none;">Desfazer</a>\n  </div>\n';

var Provider = function Provider() {

  String.prototype.toDOM = String.prototype.toDOM || function () {
    var el = document.createElement('div');
    el.innerHTML = this;
    var frag = document.createDocumentFragment();
    return frag.appendChild(el.removeChild(el.firstChild));
  };

  var getTemplate = function getTemplate(type, title, message) {
    var toReturn = template.trim().replace('ALERT_TYPE', type);
    toReturn = toReturn.trim().replace('ALERT_TITLE', title);
    toReturn = toReturn.trim().replace('ALERT_MESSAGE', message);
    return toReturn;
  };

  var getElementBody = function getElementBody() {
    return angular.element('body')[0];
  };

  var success = function success(title, message, time) {
    return createAlert(getTemplate('success', title || '', message || ''), time);
  };

  var error = function error(title, message, time) {
    return createAlert(getTemplate('danger', title || '', message || ''), time);
  };

  var warning = function warning(title, message, time) {
    return createAlert(getTemplate('warning', title, message), time);
  };

  var info = function info(title, message, time) {
    return createAlert(getTemplate('info', title, message), time);
  };

  var closeAlert = function closeAlert(elm) {
    angular.element(elm).css({
      transform: 'scale(0.3)'
    });
    setTimeout(function () {
      var body = getElementBody();
      if (body.contains(elm)) {
        body.removeChild(elm);
      }
    }, 100);
  };

  var bottomLeft = function bottomLeft(elm) {
    var bottom = 15;
    angular.forEach(angular.element(getElementBody()).find('div.gmd-alert-popup'), function (popup) {
      angular.equals(elm[0], popup) ? angular.noop() : bottom += angular.element(popup).height() * 3;
    });
    elm.css({
      bottom: bottom + 'px',
      left: '15px',
      top: null,
      right: null
    });
  };

  var createAlert = function createAlert(template, time) {
    var _onDismiss = void 0,
        _onRollback = void 0,
        elm = angular.element(template.toDOM());
    getElementBody().appendChild(elm[0]);

    bottomLeft(elm);

    elm.find('button[class="close"]').click(function (evt) {
      closeAlert(elm[0]);
      _onDismiss ? _onDismiss(evt) : angular.noop();
    });

    elm.find('a[class="action"]').click(function (evt) {
      return _onRollback ? _onRollback(evt) : angular.noop();
    });

    time ? setTimeout(function () {
      closeAlert(elm[0]);
      _onDismiss ? _onDismiss() : angular.noop();
    }, time) : angular.noop();

    return {
      position: function position(_position) {},
      onDismiss: function onDismiss(callback) {
        _onDismiss = callback;
        return this;
      },
      onRollback: function onRollback(callback) {
        elm.find('a[class="action"]').css({ display: 'block' });
        _onRollback = callback;
        return this;
      },
      close: function close() {
        closeAlert(elm[0]);
      }
    };
  };

  return {
    $get: function $get() {
      return {
        success: success,
        error: error,
        warning: warning,
        info: info
      };
    }
  };
};

Provider.$inject = [];

exports.default = Provider;

},{}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function isDOMAttrModifiedSupported() {
	var p = document.createElement('p');
	var flag = false;

	if (p.addEventListener) {
		p.addEventListener('DOMAttrModified', function () {
			flag = true;
		}, false);
	} else if (p.attachEvent) {
		p.attachEvent('onDOMAttrModified', function () {
			flag = true;
		});
	} else {
		return false;
	}
	p.setAttribute('id', 'target');
	return flag;
}

function checkAttributes(chkAttr, e) {
	if (chkAttr) {
		var attributes = this.data('attr-old-value');

		if (e.attributeName.indexOf('style') >= 0) {
			if (!attributes['style']) attributes['style'] = {}; //initialize
			var keys = e.attributeName.split('.');
			e.attributeName = keys[0];
			e.oldValue = attributes['style'][keys[1]]; //old value
			e.newValue = keys[1] + ':' + this.prop("style")[$.camelCase(keys[1])]; //new value
			attributes['style'][keys[1]] = e.newValue;
		} else {
			e.oldValue = attributes[e.attributeName];
			e.newValue = this.attr(e.attributeName);
			attributes[e.attributeName] = e.newValue;
		}

		this.data('attr-old-value', attributes); //update the old value object
	}
}

//initialize Mutation Observer
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

angular.element.fn.attrchange = function (a, b) {
	if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) == 'object') {
		//core
		var cfg = {
			trackValues: false,
			callback: $.noop
		};
		//backward compatibility
		if (typeof a === "function") {
			cfg.callback = a;
		} else {
			$.extend(cfg, a);
		}

		if (cfg.trackValues) {
			//get attributes old value
			this.each(function (i, el) {
				var attributes = {};
				for (var attr, i = 0, attrs = el.attributes, l = attrs.length; i < l; i++) {
					attr = attrs.item(i);
					attributes[attr.nodeName] = attr.value;
				}
				$(this).data('attr-old-value', attributes);
			});
		}

		if (MutationObserver) {
			//Modern Browsers supporting MutationObserver
			var mOptions = {
				subtree: false,
				attributes: true,
				attributeOldValue: cfg.trackValues
			};
			var observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (e) {
					var _this = e.target;
					//get new value if trackValues is true
					if (cfg.trackValues) {
						e.newValue = $(_this).attr(e.attributeName);
					}
					if ($(_this).data('attrchange-status') === 'connected') {
						//execute if connected
						cfg.callback.call(_this, e);
					}
				});
			});

			return this.data('attrchange-method', 'Mutation Observer').data('attrchange-status', 'connected').data('attrchange-obs', observer).each(function () {
				observer.observe(this, mOptions);
			});
		} else if (isDOMAttrModifiedSupported()) {
			//Opera
			//Good old Mutation Events
			return this.data('attrchange-method', 'DOMAttrModified').data('attrchange-status', 'connected').on('DOMAttrModified', function (event) {
				if (event.originalEvent) {
					event = event.originalEvent;
				} //jQuery normalization is not required
				event.attributeName = event.attrName; //property names to be consistent with MutationObserver
				event.oldValue = event.prevValue; //property names to be consistent with MutationObserver
				if ($(this).data('attrchange-status') === 'connected') {
					//disconnected logically
					cfg.callback.call(this, event);
				}
			});
		} else if ('onpropertychange' in document.body) {
			//works only in IE
			return this.data('attrchange-method', 'propertychange').data('attrchange-status', 'connected').on('propertychange', function (e) {
				e.attributeName = window.event.propertyName;
				//to set the attr old value
				checkAttributes.call($(this), cfg.trackValues, e);
				if ($(this).data('attrchange-status') === 'connected') {
					//disconnected logically
					cfg.callback.call(this, e);
				}
			});
		}
		return this;
	} else if (typeof a == 'string' && $.fn.attrchange.hasOwnProperty('extensions') && angular.element.fn.attrchange['extensions'].hasOwnProperty(a)) {
		//extensions/options
		return $.fn.attrchange['extensions'][a].call(this, b);
	}
};

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Component = {
  transclude: true,
  bindings: {
    forceClick: '=?',
    opened: '=?'
  },
  template: '<ng-transclude></ng-transclude>',
  controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', function ($scope, $element, $attrs, $timeout, $parse) {
    var ctrl = this;

    var handlingOptions = function handlingOptions(elements) {
      $timeout(function () {
        angular.forEach(elements, function (option) {
          angular.element(option).css({ left: (measureText(angular.element(option).text(), '14', option.style).width + 30) * -1 });
        });
      });
    };

    function measureText(pText, pFontSize, pStyle) {
      var lDiv = document.createElement('div');
      document.body.appendChild(lDiv);

      if (pStyle != null) {
        lDiv.style = pStyle;
      }

      lDiv.style.fontSize = "" + pFontSize + "px";
      lDiv.style.position = "absolute";
      lDiv.style.left = -1000;
      lDiv.style.top = -1000;

      lDiv.innerHTML = pText;

      var lResult = {
        width: lDiv.clientWidth,
        height: lDiv.clientHeight
      };

      document.body.removeChild(lDiv);

      lDiv = null;

      return lResult;
    }

    var withFocus = function withFocus(ul) {
      $element.on('mouseenter', function () {
        if (ctrl.opened) {
          return;
        }
        angular.forEach($element.find('ul'), function (ul) {
          verifyPosition(angular.element(ul));
          handlingOptions(angular.element(ul).find('li > span'));
        });
        open(ul);
      });
      $element.on('mouseleave', function () {
        if (ctrl.opened) {
          return;
        }
        verifyPosition(angular.element(ul));
        close(ul);
      });
    };

    var close = function close(ul) {
      if (ul[0].hasAttribute('left')) {
        ul.find('li').css({ transform: 'rotate(90deg) scale(0.3)' });
      } else {
        ul.find('li').css({ transform: 'scale(0.3)' });
      }
      ul.find('li > span').css({ opacity: '0', position: 'absolute' });
      ul.css({ visibility: "hidden", opacity: '0' });
      ul.removeClass('open');
      // if(ctrl.opened){
      //   ctrl.opened = false;
      //   $scope.$digest();
      // }
    };

    var open = function open(ul) {
      if (ul[0].hasAttribute('left')) {
        ul.find('li').css({ transform: 'rotate(90deg) scale(1)' });
      } else {
        ul.find('li').css({ transform: 'rotate(0deg) scale(1)' });
      }
      ul.find('li > span').hover(function () {
        angular.element(this).css({ opacity: '1', position: 'absolute' });
      });
      ul.css({ visibility: "visible", opacity: '1' });
      ul.addClass('open');
      // if(!ctrl.opened){
      //   ctrl.opened = true;
      //   $scope.$digest();
      // }
    };

    var withClick = function withClick(ul) {
      $element.find('button').first().on('click', function () {
        if (ul.hasClass('open')) {
          close(ul);
        } else {
          open(ul);
        }
      });
    };

    var verifyPosition = function verifyPosition(ul) {
      $element.css({ display: "inline-block" });
      if (ul[0].hasAttribute('left')) {
        var width = 0,
            lis = ul.find('li');
        angular.forEach(lis, function (li) {
          return width += angular.element(li)[0].offsetWidth;
        });
        var size = (width + 10 * lis.length) * -1;
        ul.css({ left: size });
      } else {
        var _size = ul.height();
        ul.css({ top: _size * -1 });
      }
    };

    $scope.$watch('$ctrl.opened', function (value) {
      angular.forEach($element.find('ul'), function (ul) {
        verifyPosition(angular.element(ul));
        handlingOptions(angular.element(ul).find('li > span'));
        if (value) {
          open(angular.element(ul));
        } else {
          close(angular.element(ul));
        }
      });
    }, true);

    $element.ready(function () {
      $timeout(function () {
        angular.forEach($element.find('ul'), function (ul) {
          verifyPosition(angular.element(ul));
          handlingOptions(angular.element(ul).find('li > span'));
          if (!ctrl.forceClick) {
            withFocus(angular.element(ul));
          } else {
            withClick(angular.element(ul));
          }
        });
      });
    });
  }]
};

exports.default = Component;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Component = {
  bindings: {},
  template: '\n    <a class="navbar-brand" data-ng-click="$ctrl.navCollapse()" style="position: relative;cursor: pointer;">\n      <div class="navTrigger">\n        <i></i><i></i><i></i>\n      </div>\n    </a>\n  ',
  controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', function ($scope, $element, $attrs, $timeout, $parse) {
    var ctrl = this;

    ctrl.$onInit = function () {
      angular.element("nav.gl-nav").attrchange({
        trackValues: true,
        callback: function callback(evnt) {
          if (evnt.attributeName == 'class') {
            ctrl.toggleHamburger(evnt.newValue.indexOf('collapsed') != -1);
          }
        }
      });

      ctrl.toggleHamburger = function (isCollapsed) {
        isCollapsed ? $element.find('div.navTrigger').addClass('active') : $element.find('div.navTrigger').removeClass('active');
      };

      ctrl.navCollapse = function () {
        document.querySelector('.gumga-layout nav.gl-nav').classList.toggle('collapsed');
        angular.element("nav.gl-nav").attrchange({
          trackValues: true,
          callback: function callback(evnt) {
            if (evnt.attributeName == 'class') {
              ctrl.toggleHamburger(evnt.newValue.indexOf('collapsed') != -1);
            }
          }
        });
      };

      ctrl.toggleHamburger(angular.element('nav.gl-nav').hasClass('collapsed'));
    };
  }]
};

exports.default = Component;

},{}],5:[function(require,module,exports){
'use strict';

var _component = require('./menu/component.js');

var _component2 = _interopRequireDefault(_component);

var _component3 = require('./notification/component.js');

var _component4 = _interopRequireDefault(_component3);

var _component5 = require('./select/component.js');

var _component6 = _interopRequireDefault(_component5);

var _component7 = require('./select/search/component.js');

var _component8 = _interopRequireDefault(_component7);

var _component9 = require('./select/option/component.js');

var _component10 = _interopRequireDefault(_component9);

var _component11 = require('./input/component.js');

var _component12 = _interopRequireDefault(_component11);

var _component13 = require('./ripple/component.js');

var _component14 = _interopRequireDefault(_component13);

var _component15 = require('./fab/component.js');

var _component16 = _interopRequireDefault(_component15);

var _component17 = require('./spinner/component.js');

var _component18 = _interopRequireDefault(_component17);

var _component19 = require('./hamburger/component.js');

var _component20 = _interopRequireDefault(_component19);

var _provider = require('./alert/provider.js');

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

angular.module('gumga.layout', []).provider('$gmdAlert', _provider2.default).directive('gmdRipple', _component14.default).component('glMenu', _component2.default).component('glNotification', _component4.default).component('gmdSelect', _component6.default).component('gmdSelectSearch', _component8.default).component('gmdOption', _component10.default).component('gmdInput', _component12.default).component('gmdFab', _component16.default).component('gmdSpinner', _component18.default).component('gmdHamburger', _component20.default);

},{"./alert/provider.js":1,"./fab/component.js":3,"./hamburger/component.js":4,"./input/component.js":6,"./menu/component.js":7,"./notification/component.js":8,"./ripple/component.js":9,"./select/component.js":10,"./select/option/component.js":11,"./select/search/component.js":12,"./spinner/component.js":13}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Component = {
  transclude: true,
  bindings: {},
  template: '\n    <div ng-transclude></div>\n  ',
  controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', function ($scope, $element, $attrs, $timeout, $parse) {
    var ctrl = this,
        input = void 0,
        model = void 0;

    ctrl.$onInit = function () {
      var changeActive = function changeActive(target) {
        if (target.value) {
          target.classList.add('active');
        } else {
          target.classList.remove('active');
        }
      };
      ctrl.$doCheck = function () {
        if (input && input[0]) changeActive(input[0]);
      };
      ctrl.$postLink = function () {
        input = angular.element($element.find('input'));
        model = input.attr('ng-model') || input.attr('data-ng-model');
      };
    };
  }]
};

exports.default = Component;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
require('../attrchange/attrchange');

var Component = {
  transclude: true,
  bindings: {
    menu: '<',
    keys: '<',
    hideSearch: '=?',
    isOpened: '=?',
    iconFirstLevel: '@?',
    showButtonFirstLevel: '=?',
    textFirstLevel: '@?',
    disableAnimations: '=?'
  },
  template: '\n    <div style="margin-bottom: 10px;padding-left: 10px;padding-right: 10px;" ng-if="!$ctrl.hideSearch">\n      <input type="text" data-ng-model="$ctrl.search" class="form-control gmd" placeholder="Busca...">\n      <div class="bar"></div>\n    </div>\n\n    <button class="btn btn-default btn-block gmd" data-ng-if="$ctrl.showButtonFirstLevel" data-ng-click="$ctrl.goBackToFirstLevel()" data-ng-disabled="!$ctrl.previous.length" type="button">\n      <i data-ng-class="[$ctrl.iconFirstLevel]"></i>\n      <span data-ng-bind="$ctrl.textFirstLevel"></span>\n    </button>\n\n    <ul data-ng-class="\'level\'.concat($ctrl.back.length)">\n      <li class="goback slide-in-right gmd gmd-ripple" data-ng-show="$ctrl.previous.length > 0" data-ng-click="$ctrl.prev()">\n        <a>\n          <i class="material-icons">\n            keyboard_arrow_left\n          </i>\n          <span data-ng-bind="$ctrl.back[$ctrl.back.length - 1].label"></span>\n        </a>\n      </li>\n      <li class="gmd gmd-ripple" data-ng-repeat="item in $ctrl.menu | filter:$ctrl.search"\n          data-ng-show="$ctrl.allow(item)"\n          ng-click="$ctrl.next(item)"\n          data-ng-class="[!$ctrl.disableAnimations ? $ctrl.slide : \'\', {header: item.type == \'header\', divider: item.type == \'separator\'}]">\n\n          <a ng-if="item.type != \'separator\' && item.state" ui-sref="{{item.state}}">\n            <i data-ng-if="item.icon" class="material-icons" data-ng-bind="item.icon"></i>\n            <span ng-bind="item.label"></span>\n            <i data-ng-if="item.children" class="material-icons pull-right">\n              keyboard_arrow_right\n            </i>\n          </a>\n\n          <a ng-if="item.type != \'separator\' && !item.state">\n            <i data-ng-if="item.icon" class="material-icons" data-ng-bind="item.icon"></i>\n            <span ng-bind="item.label"></span>\n            <i data-ng-if="item.children" class="material-icons pull-right">\n              keyboard_arrow_right\n            </i>\n          </a>\n\n      </li>\n    </ul>\n\n    <ng-transclude></ng-transclude>\n\n  ',
  controller: ['$timeout', '$attrs', '$element', function ($timeout, $attrs, $element) {
    var ctrl = this;
    ctrl.keys = ctrl.keys || [];
    ctrl.iconFirstLevel = ctrl.iconFirstLevel || 'glyphicon glyphicon-home';
    ctrl.previous = [];
    ctrl.back = [];

    ctrl.$onInit = function () {
      ctrl.disableAnimations = ctrl.disableAnimations || false;

      var stringToBoolean = function stringToBoolean(string) {
        switch (string.toLowerCase().trim()) {
          case "true":case "yes":case "1":
            return true;
          case "false":case "no":case "0":case null:
            return false;
          default:
            return Boolean(string);
        }
      };

      var fixed = stringToBoolean($attrs.fixed || 'false');
      var fixedMain = stringToBoolean($attrs.fixedMain || 'false');

      if (fixedMain) {
        fixed = true;
      }

      var onBackdropClick = function onBackdropClick(evt) {
        return angular.element('.gumga-layout nav.gl-nav').removeClass('collapsed');
      };

      if (!fixed) {
        var elm = document.createElement('div');
        elm.classList.add('gmd-menu-backdrop');
        angular.element('body')[0].appendChild(elm);
        angular.element('div.gmd-menu-backdrop').on('click', onBackdropClick);
      }

      var setMenuTop = function setMenuTop() {
        $timeout(function () {
          var size = angular.element('.gumga-layout .gl-header').height();
          if (size == 0) setMenuTop();
          angular.element('.gumga-layout nav.gl-nav.collapsed').css({
            top: size
          });
        });
      };

      ctrl.toggleContent = function (isCollapsed) {
        $timeout(function () {
          if (fixed) {
            var mainContent = angular.element('.gumga-layout .gl-main');
            var headerContent = angular.element('.gumga-layout .gl-header');

            if (isCollapsed) {
              headerContent.ready(function () {
                setMenuTop();
              });
            }

            isCollapsed ? mainContent.addClass('collapsed') : mainContent.removeClass('collapsed');
            if (!fixedMain && fixed) {
              isCollapsed ? headerContent.addClass('collapsed') : headerContent.removeClass('collapsed');
            }
          }
        });
      };

      var verifyBackdrop = function verifyBackdrop(isCollapsed) {
        var headerContent = angular.element('.gumga-layout .gl-header');
        var backContent = angular.element('div.gmd-menu-backdrop');
        if (isCollapsed && !fixed) {
          backContent.addClass('active');
          var size = headerContent.height();
          if (size > 0) {
            backContent.css({ top: size });
          }
        } else {
          backContent.removeClass('active');
        }
        $timeout(function () {
          return ctrl.isOpened = isCollapsed;
        });
      };

      if (angular.element.fn.attrchange) {
        angular.element("nav.gl-nav").attrchange({
          trackValues: true,
          callback: function callback(evnt) {
            if (evnt.attributeName == 'class') {
              ctrl.toggleContent(evnt.newValue.indexOf('collapsed') != -1);
              verifyBackdrop(evnt.newValue.indexOf('collapsed') != -1);
            }
          }
        });
        ctrl.toggleContent(angular.element('nav.gl-nav').hasClass('collapsed'));
        verifyBackdrop(angular.element('nav.gl-nav').hasClass('collapsed'));
      }

      ctrl.$onInit = function () {
        if (!ctrl.hasOwnProperty('showButtonFirstLevel')) {
          ctrl.showButtonFirstLevel = true;
        }
      };

      ctrl.prev = function () {
        $timeout(function () {
          ctrl.slide = 'slide-in-left';
          ctrl.menu = ctrl.previous.pop();
          ctrl.back.pop();
        }, 250);
      };
      ctrl.next = function (item) {
        $timeout(function () {
          if (item.children) {
            ctrl.slide = 'slide-in-right';
            ctrl.previous.push(ctrl.menu);
            ctrl.menu = item.children;
            ctrl.back.push(item);
          }
        }, 250);
      };
      ctrl.goBackToFirstLevel = function () {
        ctrl.slide = 'slide-in-left';
        ctrl.menu = ctrl.previous[0];
        ctrl.previous = [];
        ctrl.back = [];
      };
      ctrl.allow = function (item) {
        if (ctrl.keys && ctrl.keys.length > 0) {
          if (!item.key) return true;
          return ctrl.keys.indexOf(item.key) > -1;
        }
      };
      ctrl.slide = 'slide-in-left';
    };
  }]
};

exports.default = Component;

},{"../attrchange/attrchange":2}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Component = {
  bindings: {
    icon: '@',
    notifications: '=',
    onView: '&?'
  },
  template: '\n    <ul class="nav navbar-nav navbar-right notifications">\n      <li class="dropdown">\n        <a href="#" badge="{{$ctrl.notifications.length}}" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">\n          <i class="material-icons" data-ng-bind="$ctrl.icon"></i>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-ng-repeat="item in $ctrl.notifications" data-ng-click="$ctrl.view($event, item)">\n            <div class="media">\n              <div class="media-left">\n                <img class="media-object" data-ng-src="{{item.image}}">\n              </div>\n              <div class="media-body" data-ng-bind="item.content"></div>\n            </div>\n          </li>\n        </ul>\n      </li>\n    </ul>\n  ',
  controller: function controller() {
    var ctrl = this;

    ctrl.$onInit = function () {
      ctrl.view = function (event, item) {
        return ctrl.onView({ event: event, item: item });
      };
    };
  }
};

exports.default = Component;

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Component = function Component() {
  return {
    restrict: 'C',
    link: function link($scope, element, attrs) {
      if (!element[0].classList.contains('fixed')) {
        element[0].style.position = 'relative';
      }
      element[0].style.overflow = 'hidden';
      element[0].style.userSelect = 'none';

      element[0].style.msUserSelect = 'none';
      element[0].style.mozUserSelect = 'none';
      element[0].style.webkitUserSelect = 'none';

      function createRipple(evt) {
        var ripple = angular.element('<span class="gmd-ripple-effect animate">'),
            rect = element[0].getBoundingClientRect(),
            radius = Math.max(rect.height, rect.width),
            left = evt.pageX - rect.left - radius / 2 - document.body.scrollLeft,
            top = evt.pageY - rect.top - radius / 2 - document.body.scrollTop;

        ripple[0].style.width = ripple[0].style.height = radius + 'px';
        ripple[0].style.left = left + 'px';
        ripple[0].style.top = top + 'px';
        ripple.on('animationend webkitAnimationEnd', function () {
          angular.element(this).remove();
        });

        element.append(ripple);
      }

      element.bind('click', createRipple);
    }
  };
};

exports.default = Component;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Component = {
  require: ['ngModel', 'ngRequired'],
  transclude: true,
  bindings: {
    ngModel: '=',
    ngDisabled: '=?',
    unselect: '@?',
    options: '<',
    option: '@',
    value: '@',
    placeholder: '@?',
    onChange: "&?"
  },
  template: '\n  <div class="dropdown gmd">\n     <label class="control-label floating-dropdown" ng-show="$ctrl.selected" data-ng-bind="$ctrl.placeholder"></label>\n     <button class="btn btn-default gmd dropdown-toggle gmd-select-button"\n             type="button"\n             style="border-radius: 0;"\n             id="gmdSelect"\n             data-toggle="dropdown"\n             ng-disabled="$ctrl.ngDisabled"\n             aria-haspopup="true"\n             aria-expanded="true">\n       <span class="item-select" data-ng-show="$ctrl.selected" data-ng-bind="$ctrl.selected"></span>\n       <span data-ng-bind="$ctrl.placeholder" data-ng-hide="$ctrl.selected" class="item-select placeholder"></span>\n       <span class="caret"></span>\n     </button>\n     <ul class="dropdown-menu" aria-labelledby="gmdSelect" ng-show="$ctrl.option">\n       <li data-ng-click="$ctrl.clear()" ng-if="$ctrl.unselect">\n         <a data-ng-class="{active: false}">{{$ctrl.unselect}}</a>\n       </li>\n       <li data-ng-repeat="option in $ctrl.options track by $index">\n         <a class="select-option" data-ng-click="$ctrl.select(option)" data-ng-bind="option[$ctrl.option] || option" data-ng-class="{active: $ctrl.isActive(option)}"></a>\n       </li>\n     </ul>\n     <ul class="dropdown-menu gmd" aria-labelledby="gmdSelect" ng-show="!$ctrl.option" style="max-height: 250px;overflow: auto;" ng-transclude></ul>\n   </div>\n  ',
  controller: ['$scope', '$attrs', '$timeout', '$element', function ($scope, $attrs, $timeout, $element) {
    var ctrl = this,
        ngModelCtrl = $element.controller('ngModel');

    var options = ctrl.options || [];

    ctrl.select = function (option) {
      angular.forEach(options, function (option) {
        option.selected = false;
      });
      option.selected = true;
      ctrl.ngModel = option.ngValue;
      ctrl.selected = option.ngLabel;
    };

    ctrl.addOption = function (option) {
      options.push(option);
    };

    var setSelected = function setSelected(value) {
      angular.forEach(options, function (option) {
        if (option.ngValue.$$hashKey) {
          delete option.ngValue.$$hashKey;
        }
        if (angular.equals(value, option.ngValue)) {
          ctrl.select(option);
        }
      });
    };

    $timeout(function () {
      setSelected(ctrl.ngModel);
    }, 0);

    ctrl.$doCheck = function () {
      if (options && options.length > 0) setSelected(ctrl.ngModel);
    };
  }]
};

exports.default = Component;

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Component = {
  // require: ['ngModel','ngRequired'],
  transclude: true,
  require: {
    gmdSelectCtrl: '^gmdSelect'
  },
  bindings: {
    ngValue: '=',
    ngLabel: '='
  },
  template: '\n    <a class="select-option" data-ng-click="$ctrl.select($ctrl.ngValue, $ctrl.ngLabel)" ng-class="{active: $ctrl.selected}" ng-transclude></a>\n  ',
  controller: ['$scope', '$attrs', '$timeout', '$element', '$transclude', function ($scope, $attrs, $timeout, $element, $transclude) {
    var _this = this;

    var ctrl = this;

    ctrl.$onInit = function () {
      ctrl.gmdSelectCtrl.addOption(_this);
    };
    ctrl.select = function () {
      ctrl.gmdSelectCtrl.select(_this);
      if (ctrl.gmdSelectCtrl.onChange) {
        ctrl.gmdSelectCtrl.onChange({ value: _this.ngValue });
      }
    };
  }]
};

exports.default = Component;

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Component = {
  transclude: true,
  require: {
    gmdSelectCtrl: '^gmdSelect'
  },
  bindings: {
    ngModel: '=',
    placeholder: '@?'
  },
  template: '\n    <div class="input-group" style="border: none;background: #f9f9f9;">\n      <span class="input-group-addon" id="basic-addon1" style="border: none;">\n        <i class="material-icons">search</i>\n      </span>\n      <input type="text" style="border: none;" class="form-control gmd" ng-model="$ctrl.ngModel" placeholder="{{$ctrl.placeholder}}">\n    </div>\n  ',
  controller: ['$scope', '$attrs', '$timeout', '$element', '$transclude', function ($scope, $attrs, $timeout, $element, $transclude) {
    var ctrl = this;
  }]
};

exports.default = Component;

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Component = {
  bindings: {
    diameter: "@?",
    box: "=?"
  },
  template: "\n  <div class=\"spinner-material\" ng-if=\"$ctrl.diameter\">\n   <svg xmlns=\"http://www.w3.org/2000/svg\"\n        xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n        version=\"1\"\n        ng-class=\"{'spinner-box' : $ctrl.box}\"\n        style=\"width: {{$ctrl.diameter}};height: {{$ctrl.diameter}};\"\n        viewBox=\"0 0 28 28\">\n    <g class=\"qp-circular-loader\">\n     <path class=\"qp-circular-loader-path\" fill=\"none\" d=\"M 14,1.5 A 12.5,12.5 0 1 1 1.5,14\" stroke-linecap=\"round\" />\n    </g>\n   </svg>\n  </div>",
  controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', function ($scope, $element, $attrs, $timeout, $parse) {
    var ctrl = this;

    ctrl.$onInit = function () {
      ctrl.diameter = ctrl.diameter || '50px';
    };
  }]
};

exports.default = Component;

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2d1bWdhLWxheW91dC9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZ3VtZ2EtbGF5b3V0L3NyYy9jb21wb25lbnRzL2FsZXJ0L3Byb3ZpZGVyLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZ3VtZ2EtbGF5b3V0L3NyYy9jb21wb25lbnRzL2F0dHJjaGFuZ2UvYXR0cmNoYW5nZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2d1bWdhLWxheW91dC9zcmMvY29tcG9uZW50cy9mYWIvY29tcG9uZW50LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZ3VtZ2EtbGF5b3V0L3NyYy9jb21wb25lbnRzL2hhbWJ1cmdlci9jb21wb25lbnQuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9ndW1nYS1sYXlvdXQvc3JjL2NvbXBvbmVudHMvaW5kZXguanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9ndW1nYS1sYXlvdXQvc3JjL2NvbXBvbmVudHMvaW5wdXQvY29tcG9uZW50LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZ3VtZ2EtbGF5b3V0L3NyYy9jb21wb25lbnRzL21lbnUvY29tcG9uZW50LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZ3VtZ2EtbGF5b3V0L3NyYy9jb21wb25lbnRzL25vdGlmaWNhdGlvbi9jb21wb25lbnQuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9ndW1nYS1sYXlvdXQvc3JjL2NvbXBvbmVudHMvcmlwcGxlL2NvbXBvbmVudC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2d1bWdhLWxheW91dC9zcmMvY29tcG9uZW50cy9zZWxlY3QvY29tcG9uZW50LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZ3VtZ2EtbGF5b3V0L3NyYy9jb21wb25lbnRzL3NlbGVjdC9vcHRpb24vY29tcG9uZW50LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZ3VtZ2EtbGF5b3V0L3NyYy9jb21wb25lbnRzL3NlbGVjdC9zZWFyY2gvY29tcG9uZW50LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZ3VtZ2EtbGF5b3V0L3NyYy9jb21wb25lbnRzL3NwaW5uZXIvY29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNBQSxJQUFJLHlVQUFKOztBQVFBLElBQUksV0FBVyxTQUFYLFFBQVcsR0FBTTs7QUFFbkIsU0FBTyxTQUFQLENBQWlCLEtBQWpCLEdBQXlCLE9BQU8sU0FBUCxDQUFpQixLQUFqQixJQUEwQixZQUFVO0FBQzNELFFBQUksS0FBSyxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBVDtBQUNBLE9BQUcsU0FBSCxHQUFlLElBQWY7QUFDQSxRQUFJLE9BQU8sU0FBUyxzQkFBVCxFQUFYO0FBQ0EsV0FBTyxLQUFLLFdBQUwsQ0FBaUIsR0FBRyxXQUFILENBQWUsR0FBRyxVQUFsQixDQUFqQixDQUFQO0FBQ0QsR0FMRDs7QUFRQSxNQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxPQUFkLEVBQTBCO0FBQzVDLFFBQUksV0FBVyxTQUFTLElBQVQsR0FBZ0IsT0FBaEIsQ0FBd0IsWUFBeEIsRUFBc0MsSUFBdEMsQ0FBZjtBQUNJLGVBQVcsU0FBUyxJQUFULEdBQWdCLE9BQWhCLENBQXdCLGFBQXhCLEVBQXVDLEtBQXZDLENBQVg7QUFDQSxlQUFXLFNB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QWhDLEVBQXlDLFdBQXpDLEVBQXNEO0FBQ3hILFFBQUksT0FBTyxJQUFYO0FBQ0QsR0FGVztBQWpCRSxDQUFoQjs7a0JBc0JlLFM7Ozs7Ozs7O0FDdEJmLElBQUksWUFBWTtBQUNkLFlBQVU7QUFDUixjQUFVLElBREY7QUFFUixTQUFVO0FBRkYsR0FESTtBQUtkLHNpQkFMYztBQWtCZCxjQUFZLENBQUMsUUFBRCxFQUFVLFVBQVYsRUFBcUIsUUFBckIsRUFBOEIsVUFBOUIsRUFBMEMsUUFBMUMsRUFBb0QsVUFBUyxNQUFULEVBQWlCLFFBQWpCLEVBQTJCLE1BQTNCLEVBQW1DLFFBQW5DLEVBQTRDLE1BQTVDLEVBQW9EO0FBQ2xILFFBQUksT0FBTyxJQUFYOztBQUVBLFNBQUssT0FBTCxHQUFlLFlBQU07QUFDbkIsV0FBSyxRQUFMLEdBQWdCLEtBQUssUUFBTCxJQUFpQixNQUFqQztBQUNELEtBRkQ7QUFJRCxHQVBXO0FBbEJFLENBQWhCOztrQkE0QmUsUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgdGVtcGxhdGUgPSBgXG4gIDxkaXYgY2xhc3M9XCJhbGVydCBnbWQgZ21kLWFsZXJ0LXBvcHVwIGFsZXJ0LUFMRVJUX1RZUEUgYWxlcnQtZGlzbWlzc2libGVcIiByb2xlPVwiYWxlcnRcIj5cbiAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgYXJpYS1sYWJlbD1cIkNsb3NlXCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+w5c8L3NwYW4+PC9idXR0b24+XG4gICAgPHN0cm9uZz5BTEVSVF9USVRMRTwvc3Ryb25nPiBBTEVSVF9NRVNTQUdFXG4gICAgPGEgY2xhc3M9XCJhY3Rpb25cIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+RGVzZmF6ZXI8L2E+XG4gIDwvZGl2PlxuYDtcblxubGV0IFByb3ZpZGVyID0gKCkgPT4ge1xuXG4gIFN0cmluZy5wcm90b3R5cGUudG9ET00gPSBTdHJpbmcucHJvdG90eXBlLnRvRE9NIHx8IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWwuaW5uZXJIVE1MID0gdGhpcztcbiAgICBsZXQgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICByZXR1cm4gZnJhZy5hcHBlbmRDaGlsZChlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKSk7XG4gIH07XG5cblxuICBjb25zdCBnZXRUZW1wbGF0ZSA9ICh0eXBlLCB0aXRsZSwgbWVzc2FnZSkgPT4ge1xuICAgIGxldCB0b1JldHVybiA9IHRlbXBsYXRlLnRyaW0oKS5yZXBsYWNlKCdBTEVSVF9UWVBFJywgdHlwZSk7XG4gICAgICAgIHRvUmV0dXJuID0gdG9SZXR1cm4udHJpbSgpLnJlcGxhY2UoJ0FMRVJUX1RJVExFJywgdGl0bGUpO1xuICAgICAgICB0b1JldHVybiA9IHRvUmV0dXJuLnRyaW0oKS5yZXBsYWNlKCdBTEVSVF9NRVNTQUdFJywgbWVzc2FnZSk7XG4gICAgcmV0dXJuIHRvUmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZ2V0RWxlbWVudEJvZHkgICAgPSAoKSA9PiBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKVswXTtcblxuICBjb25zdCBzdWNjZXNzID0gKHRpdGxlLCBtZXNzYWdlLCB0aW1lKSA9PiB7XG4gICAgcmV0dXJuIGNyZWF0ZUFsZXJ0KGdldFRlbXBsYXRlKCdzdWNjZXNzJywgdGl0bGUgfHwgJycsIG1lc3NhZ2UgfHwgJycpLCB0aW1lKTtcbiAgfVxuXG4gIGNvbnN0IGVycm9yID0gKHRpdGxlLCBtZXNzYWdlLCB0aW1lKSA9PiB7XG4gICAgcmV0dXJuIGNyZWF0ZUFsZXJ0KGdldFRlbXBsYXRlKCdkYW5nZXInLCB0aXRsZSB8fCAnJywgbWVzc2FnZSB8fCAnJyksIHRpbWUpO1xuICB9XG5cbiAgY29uc3Qgd2FybmluZyA9ICh0aXRsZSwgbWVzc2FnZSwgdGltZSkgPT4ge1xuICAgIHJldHVybiBjcmVhdGVBbGVydChnZXRUZW1wbGF0ZSgnd2FybmluZycsIHRpdGxlLCBtZXNzYWdlKSwgdGltZSk7XG4gIH1cblxuICBjb25zdCBpbmZvID0gKHRpdGxlLCBtZXNzYWdlLCB0aW1lKSA9PiB7XG4gICAgcmV0dXJuIGNyZWF0ZUFsZXJ0KGdldFRlbXBsYXRlKCdpbmZvJywgdGl0bGUsIG1lc3NhZ2UpLCB0aW1lKTtcbiAgfVxuXG4gIGNvbnN0IGNsb3NlQWxlcnQgPSAoZWxtKSA9PiB7XG4gICAgYW5ndWxhci5lbGVtZW50KGVsbSkuY3NzKHtcbiAgICAgIHRyYW5zZm9ybTogJ3NjYWxlKDAuMyknXG4gICAgfSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBsZXQgYm9keSA9IGdldEVsZW1lbnRCb2R5KCk7XG4gICAgICBpZihib2R5LmNvbnRhaW5zKGVsbSkpe1xuICAgICAgICBib2R5LnJlbW92ZUNoaWxkKGVsbSk7XG4gICAgICB9XG4gICAgfSwgMTAwKTtcbiAgfVxuXG4gIGNvbnN0IGJvdHRvbUxlZnQgPSAoZWxtKSA9PiB7XG4gICAgbGV0IGJvdHRvbSA9IDE1O1xuICAgIGFuZ3VsYXIuZm9yRWFjaChhbmd1bGFyLmVsZW1lbnQoZ2V0RWxlbWVudEJvZHkoKSkuZmluZCgnZGl2LmdtZC1hbGVydC1wb3B1cCcpLCBwb3B1cCA9PiB7XG4gICAgICBhbmd1bGFyLmVxdWFscyhlbG1bMF0sIHBvcHVwKSA/IGFuZ3VsYXIubm9vcCgpIDogYm90dG9tICs9IGFuZ3VsYXIuZWxlbWVudChwb3B1cCkuaGVpZ2h0KCkgKiAzO1xuICAgIH0pO1xuICAgIGVsbS5jc3Moe1xuICAgICAgYm90dG9tOiBib3R0b20rICdweCcsXG4gICAgICBsZWZ0ICA6ICcxNXB4JyxcbiAgICAgIHRvcCAgIDogIG51bGwsXG4gICAgICByaWdodCA6ICBudWxsXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZUFsZXJ0ID0gKHRlbXBsYXRlLCB0aW1lKSA9PiB7XG4gICAgbGV0IG9uRGlzbWlzcywgb25Sb2xsYmFjaywgZWxtID0gYW5ndWxhci5lbGVtZW50KHRlbXBsYXRlLnRvRE9NKCkpO1xuICAgIGdldEVsZW1lbnRCb2R5KCkuYXBwZW5kQ2hpbGQoZWxtWzBdKTtcblxuICAgIGJvdHRvbUxlZnQoZWxtKTtcblxuICAgIGVsbS5maW5kKCdidXR0b25bY2xhc3M9XCJjbG9zZVwiXScpLmNsaWNrKChldnQpID0+IHtcbiAgICAgIGNsb3NlQWxlcnQoZWxtWzBdKTtcbiAgICAgIG9uRGlzbWlzcyA/IG9uRGlzbWlzcyhldnQpIDogYW5ndWxhci5ub29wKClcbiAgICB9KTtcblxuICAgIGVsbS5maW5kKCdhW2NsYXNzPVwiYWN0aW9uXCJdJykuY2xpY2soKGV2dCkgPT4gb25Sb2xsYmFjayA/IG9uUm9sbGJhY2soZXZ0KSA6IGFuZ3VsYXIubm9vcCgpKTtcblxuICAgIHRpbWUgPyBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNsb3NlQWxlcnQoZWxtWzBdKTtcbiAgICAgIG9uRGlzbWlzcyA/IG9uRGlzbWlzcygpIDogYW5ndWxhci5ub29wKCk7XG4gICAgfSwgdGltZSkgOiBhbmd1bGFyLm5vb3AoKTtcblxuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbihwb3NpdGlvbil7XG5cbiAgICAgIH0sXG4gICAgICBvbkRpc21pc3MoY2FsbGJhY2spIHtcbiAgICAgICAgb25EaXNtaXNzID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIG9uUm9sbGJhY2soY2FsbGJhY2spIHtcbiAgICAgICAgZWxtLmZpbmQoJ2FbY2xhc3M9XCJhY3Rpb25cIl0nKS5jc3MoeyBkaXNwbGF5OiAnYmxvY2snIH0pO1xuICAgICAgICBvblJvbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIGNsb3NlKCl7XG4gICAgICAgIGNsb3NlQWxlcnQoZWxtWzBdKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAkZ2V0KCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3MsXG4gICAgICAgICAgZXJyb3IgIDogZXJyb3IsXG4gICAgICAgICAgd2FybmluZzogd2FybmluZyxcbiAgICAgICAgICBpbmZvICAgOiBpbmZvXG4gICAgICAgIH07XG4gICAgICB9XG4gIH1cbn1cblxuUHJvdmlkZXIuJGluamVjdCA9IFtdO1xuXG5leHBvcnQgZGVmYXVsdCBQcm92aWRlclxuIiwiZnVuY3Rpb24gaXNET01BdHRyTW9kaWZpZWRTdXBwb3J0ZWQoKSB7XG5cdFx0dmFyIHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG5cdFx0dmFyIGZsYWcgPSBmYWxzZTtcblxuXHRcdGlmIChwLmFkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHRcdHAuYWRkRXZlbnRMaXN0ZW5lcignRE9NQXR0ck1vZGlmaWVkJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZsYWcgPSB0cnVlXG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0fSBlbHNlIGlmIChwLmF0dGFjaEV2ZW50KSB7XG5cdFx0XHRwLmF0dGFjaEV2ZW50KCdvbkRPTUF0dHJNb2RpZmllZCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmbGFnID0gdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0cC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RhcmdldCcpO1xuXHRcdHJldHVybiBmbGFnO1xuXHR9XG5cblx0ZnVuY3Rpb24gY2hlY2tBdHRyaWJ1dGVzKGNoa0F0dHIsIGUpIHtcblx0XHRpZiAoY2hrQXR0cikge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSB0aGlzLmRhdGEoJ2F0dHItb2xkLXZhbHVlJyk7XG5cblx0XHRcdGlmIChlLmF0dHJpYnV0ZU5hbWUuaW5kZXhPZignc3R5bGUnKSA+PSAwKSB7XG5cdFx0XHRcdGlmICghYXR0cmlidXRlc1snc3R5bGUnXSlcblx0XHRcdFx0XHRhdHRyaWJ1dGVzWydzdHlsZSddID0ge307IC8vaW5pdGlhbGl6ZVxuXHRcdFx0XHR2YXIga2V5cyA9IGUuYXR0cmlidXRlTmFtZS5zcGxpdCgnLicpO1xuXHRcdFx0XHRlLmF0dHJpYnV0ZU5hbWUgPSBrZXlzWzBdO1xuXHRcdFx0XHRlLm9sZFZhbHVlID0gYXR0cmlidXRlc1snc3R5bGUnXVtrZXlzWzFdXTsgLy9vbGQgdmFsdWVcblx0XHRcdFx0ZS5uZXdWYWx1ZSA9IGtleXNbMV0gKyAnOidcblx0XHRcdFx0XHRcdCsgdGhpcy5wcm9wKFwic3R5bGVcIilbJC5jYW1lbENhc2Uoa2V5c1sxXSldOyAvL25ldyB2YWx1ZVxuXHRcdFx0XHRhdHRyaWJ1dGVzWydzdHlsZSddW2tleXNbMV1dID0gZS5uZXdWYWx1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGUub2xkVmFsdWUgPSBhdHRyaWJ1dGVzW2UuYXR0cmlidXRlTmFtZV07XG5cdFx0XHRcdGUubmV3VmFsdWUgPSB0aGlzLmF0dHIoZS5hdHRyaWJ1dGVOYW1lKTtcblx0XHRcdFx0YXR0cmlidXRlc1tlLmF0dHJpYnV0ZU5hbWVdID0gZS5uZXdWYWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5kYXRhKCdhdHRyLW9sZC12YWx1ZScsIGF0dHJpYnV0ZXMpOyAvL3VwZGF0ZSB0aGUgb2xkIHZhbHVlIG9iamVjdFxuXHRcdH1cblx0fVxuXG5cdC8vaW5pdGlhbGl6ZSBNdXRhdGlvbiBPYnNlcnZlclxuXHR2YXIgTXV0YXRpb25PYnNlcnZlciA9IHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyXG5cdFx0XHR8fCB3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcblxuXHRhbmd1bGFyLmVsZW1lbnQuZm4uYXR0cmNoYW5nZSA9IGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRpZiAodHlwZW9mIGEgPT0gJ29iamVjdCcpIHsvL2NvcmVcblx0XHRcdHZhciBjZmcgPSB7XG5cdFx0XHRcdHRyYWNrVmFsdWVzIDogZmFsc2UsXG5cdFx0XHRcdGNhbGxiYWNrIDogJC5ub29wXG5cdFx0XHR9O1xuXHRcdFx0Ly9iYWNrd2FyZCBjb21wYXRpYmlsaXR5XG5cdFx0XHRpZiAodHlwZW9mIGEgPT09IFwiZnVuY3Rpb25cIikgeyBjZmcuY2FsbGJhY2sgPSBhOyB9IGVsc2UgeyAkLmV4dGVuZChjZmcsIGEpOyB9XG5cblx0XHRcdGlmIChjZmcudHJhY2tWYWx1ZXMpIHsgLy9nZXQgYXR0cmlidXRlcyBvbGQgdmFsdWVcblx0XHRcdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKGksIGVsKSB7XG5cdFx0XHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSB7fTtcblx0XHRcdFx0XHRmb3IgKCB2YXIgYXR0ciwgaSA9IDAsIGF0dHJzID0gZWwuYXR0cmlidXRlcywgbCA9IGF0dHJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRcdFx0YXR0ciA9IGF0dHJzLml0ZW0oaSk7XG5cdFx0XHRcdFx0XHRhdHRyaWJ1dGVzW2F0dHIubm9kZU5hbWVdID0gYXR0ci52YWx1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0JCh0aGlzKS5kYXRhKCdhdHRyLW9sZC12YWx1ZScsIGF0dHJpYnV0ZXMpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKE11dGF0aW9uT2JzZXJ2ZXIpIHsgLy9Nb2Rlcm4gQnJvd3NlcnMgc3VwcG9ydGluZyBNdXRhdGlvbk9ic2VydmVyXG5cdFx0XHRcdHZhciBtT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRzdWJ0cmVlIDogZmFsc2UsXG5cdFx0XHRcdFx0YXR0cmlidXRlcyA6IHRydWUsXG5cdFx0XHRcdFx0YXR0cmlidXRlT2xkVmFsdWUgOiBjZmcudHJhY2tWYWx1ZXNcblx0XHRcdFx0fTtcblx0XHRcdFx0dmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obXV0YXRpb25zKSB7XG5cdFx0XHRcdFx0bXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0dmFyIF90aGlzID0gZS50YXJnZXQ7XG5cdFx0XHRcdFx0XHQvL2dldCBuZXcgdmFsdWUgaWYgdHJhY2tWYWx1ZXMgaXMgdHJ1ZVxuXHRcdFx0XHRcdFx0aWYgKGNmZy50cmFja1ZhbHVlcykge1xuXHRcdFx0XHRcdFx0XHRlLm5ld1ZhbHVlID0gJChfdGhpcykuYXR0cihlLmF0dHJpYnV0ZU5hbWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKCQoX3RoaXMpLmRhdGEoJ2F0dHJjaGFuZ2Utc3RhdHVzJykgPT09ICdjb25uZWN0ZWQnKSB7IC8vZXhlY3V0ZSBpZiBjb25uZWN0ZWRcblx0XHRcdFx0XHRcdFx0Y2ZnLmNhbGxiYWNrLmNhbGwoX3RoaXMsIGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gdGhpcy5kYXRhKCdhdHRyY2hhbmdlLW1ldGhvZCcsICdNdXRhdGlvbiBPYnNlcnZlcicpLmRhdGEoJ2F0dHJjaGFuZ2Utc3RhdHVzJywgJ2Nvbm5lY3RlZCcpXG5cdFx0XHRcdFx0XHQuZGF0YSgnYXR0cmNoYW5nZS1vYnMnLCBvYnNlcnZlcikuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0b2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLCBtT3B0aW9ucyk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoaXNET01BdHRyTW9kaWZpZWRTdXBwb3J0ZWQoKSkgeyAvL09wZXJhXG5cdFx0XHRcdC8vR29vZCBvbGQgTXV0YXRpb24gRXZlbnRzXG5cdFx0XHRcdHJldHVybiB0aGlzLmRhdGEoJ2F0dHJjaGFuZ2UtbWV0aG9kJywgJ0RPTUF0dHJNb2RpZmllZCcpLmRhdGEoJ2F0dHJjaGFuZ2Utc3RhdHVzJywgJ2Nvbm5lY3RlZCcpLm9uKCdET01BdHRyTW9kaWZpZWQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7IGV2ZW50ID0gZXZlbnQub3JpZ2luYWxFdmVudDsgfS8valF1ZXJ5IG5vcm1hbGl6YXRpb24gaXMgbm90IHJlcXVpcmVkXG5cdFx0XHRcdFx0ZXZlbnQuYXR0cmlidXRlTmFtZSA9IGV2ZW50LmF0dHJOYW1lOyAvL3Byb3BlcnR5IG5hbWVzIHRvIGJlIGNvbnNpc3RlbnQgd2l0aCBNdXRhdGlvbk9ic2VydmVyXG5cdFx0XHRcdFx0ZXZlbnQub2xkVmFsdWUgPSBldmVudC5wcmV2VmFsdWU7IC8vcHJvcGVydHkgbmFtZXMgdG8gYmUgY29uc2lzdGVudCB3aXRoIE11dGF0aW9uT2JzZXJ2ZXJcblx0XHRcdFx0XHRpZiAoJCh0aGlzKS5kYXRhKCdhdHRyY2hhbmdlLXN0YXR1cycpID09PSAnY29ubmVjdGVkJykgeyAvL2Rpc2Nvbm5lY3RlZCBsb2dpY2FsbHlcblx0XHRcdFx0XHRcdGNmZy5jYWxsYmFjay5jYWxsKHRoaXMsIGV2ZW50KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIGlmICgnb25wcm9wZXJ0eWNoYW5nZScgaW4gZG9jdW1lbnQuYm9keSkgeyAvL3dvcmtzIG9ubHkgaW4gSUVcblx0XHRcdFx0cmV0dXJuIHRoaXMuZGF0YSgnYXR0cmNoYW5nZS1tZXRob2QnLCAncHJvcGVydHljaGFuZ2UnKS5kYXRhKCdhdHRyY2hhbmdlLXN0YXR1cycsICdjb25uZWN0ZWQnKS5vbigncHJvcGVydHljaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0ZS5hdHRyaWJ1dGVOYW1lID0gd2luZG93LmV2ZW50LnByb3BlcnR5TmFtZTtcblx0XHRcdFx0XHQvL3RvIHNldCB0aGUgYXR0ciBvbGQgdmFsdWVcblx0XHRcdFx0XHRjaGVja0F0dHJpYnV0ZXMuY2FsbCgkKHRoaXMpLCBjZmcudHJhY2tWYWx1ZXMsIGUpO1xuXHRcdFx0XHRcdGlmICgkKHRoaXMpLmRhdGEoJ2F0dHJjaGFuZ2Utc3RhdHVzJykgPT09ICdjb25uZWN0ZWQnKSB7IC8vZGlzY29ubmVjdGVkIGxvZ2ljYWxseVxuXHRcdFx0XHRcdFx0Y2ZnLmNhbGxiYWNrLmNhbGwodGhpcywgZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGEgPT0gJ3N0cmluZycgJiYgJC5mbi5hdHRyY2hhbmdlLmhhc093blByb3BlcnR5KCdleHRlbnNpb25zJykgJiZcblx0XHRcdFx0YW5ndWxhci5lbGVtZW50LmZuLmF0dHJjaGFuZ2VbJ2V4dGVuc2lvbnMnXS5oYXNPd25Qcm9wZXJ0eShhKSkgeyAvL2V4dGVuc2lvbnMvb3B0aW9uc1xuXHRcdFx0cmV0dXJuICQuZm4uYXR0cmNoYW5nZVsnZXh0ZW5zaW9ucyddW2FdLmNhbGwodGhpcywgYik7XG5cdFx0fVxuXHR9XG4iLCJsZXQgQ29tcG9uZW50ID0ge1xuICB0cmFuc2NsdWRlOiB0cnVlLFxuICBiaW5kaW5nczoge1xuICAgIGZvcmNlQ2xpY2s6ICc9PycsXG4gICAgb3BlbmVkOiAnPT8nXG4gIH0sXG4gIHRlbXBsYXRlOiBgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPmAsXG4gIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywnJGVsZW1lbnQnLCckYXR0cnMnLCckdGltZW91dCcsICckcGFyc2UnLCBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICR0aW1lb3V0LCRwYXJzZSkge1xuICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgIGNvbnN0IGhhbmRsaW5nT3B0aW9ucyA9IChlbGVtZW50cykgPT4ge1xuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZWxlbWVudHMsIChvcHRpb24pID0+IHtcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQob3B0aW9uKS5jc3Moe2xlZnQ6IChtZWFzdXJlVGV4dChhbmd1bGFyLmVsZW1lbnQob3B0aW9uKS50ZXh0KCksICcxNCcsIG9wdGlvbi5zdHlsZSkud2lkdGggKyAzMCkgKiAtMX0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWVhc3VyZVRleHQocFRleHQsIHBGb250U2l6ZSwgcFN0eWxlKSB7XG4gICAgICAgIHZhciBsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobERpdik7XG5cbiAgICAgICAgaWYgKHBTdHlsZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBsRGl2LnN0eWxlID0gcFN0eWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgbERpdi5zdHlsZS5mb250U2l6ZSA9IFwiXCIgKyBwRm9udFNpemUgKyBcInB4XCI7XG4gICAgICAgIGxEaXYuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICAgIGxEaXYuc3R5bGUubGVmdCA9IC0xMDAwO1xuICAgICAgICBsRGl2LnN0eWxlLnRvcCA9IC0xMDAwO1xuXG4gICAgICAgIGxEaXYuaW5uZXJIVE1MID0gcFRleHQ7XG5cbiAgICAgICAgdmFyIGxSZXN1bHQgPSB7XG4gICAgICAgICAgICB3aWR0aDogbERpdi5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogbERpdi5jbGllbnRIZWlnaHRcbiAgICAgICAgfTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxEaXYpO1xuXG4gICAgICAgIGxEaXYgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBsUmVzdWx0O1xuICAgIH1cblxuICAgIGNvbnN0IHdpdGhGb2N1cyA9ICh1bCkgPT4ge1xuICAgICAgJGVsZW1lbnQub24oJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICAgIGlmKGN0cmwub3BlbmVkKXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRlbGVtZW50LmZpbmQoJ3VsJyksICh1bCkgPT4ge1xuICAgICAgICAgIHZlcmlmeVBvc2l0aW9uKGFuZ3VsYXIuZWxlbWVudCh1bCkpO1xuICAgICAgICAgIGhhbmRsaW5nT3B0aW9ucyhhbmd1bGFyLmVsZW1lbnQodWwpLmZpbmQoJ2xpID4gc3BhbicpKTtcbiAgICAgICAgfSlcbiAgICAgICAgb3Blbih1bCk7XG4gICAgICB9KTtcbiAgICAgICRlbGVtZW50Lm9uKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICBpZihjdHJsLm9wZW5lZCl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZlcmlmeVBvc2l0aW9uKGFuZ3VsYXIuZWxlbWVudCh1bCkpO1xuICAgICAgICBjbG9zZSh1bCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBjbG9zZSA9ICh1bCkgPT4ge1xuICAgICAgaWYodWxbMF0uaGFzQXR0cmlidXRlKCdsZWZ0Jykpe1xuICAgICAgICB1bC5maW5kKCdsaScpLmNzcyh7dHJhbnNmb3JtOiAncm90YXRlKDkwZGVnKSBzY2FsZSgwLjMpJ30pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHVsLmZpbmQoJ2xpJykuY3NzKHt0cmFuc2Zvcm06ICdzY2FsZSgwLjMpJ30pO1xuICAgICAgfVxuICAgICAgdWwuZmluZCgnbGkgPiBzcGFuJykuY3NzKHtvcGFjaXR5OiAnMCcsIHBvc2l0aW9uOiAnYWJzb2x1dGUnfSlcbiAgICAgIHVsLmNzcyh7dmlzaWJpbGl0eTogXCJoaWRkZW5cIiwgb3BhY2l0eTogJzAnfSlcbiAgICAgIHVsLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAvLyBpZihjdHJsLm9wZW5lZCl7XG4gICAgICAvLyAgIGN0cmwub3BlbmVkID0gZmFsc2U7XG4gICAgICAvLyAgICRzY29wZS4kZGlnZXN0KCk7XG4gICAgICAvLyB9XG4gICAgfVxuXG4gICAgY29uc3Qgb3BlbiA9ICh1bCkgPT4ge1xuICAgICAgaWYodWxbMF0uaGFzQXR0cmlidXRlKCdsZWZ0Jykpe1xuICAgICAgICB1bC5maW5kKCdsaScpLmNzcyh7dHJhbnNmb3JtOiAncm90YXRlKDkwZGVnKSBzY2FsZSgxKSd9KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB1bC5maW5kKCdsaScpLmNzcyh7dHJhbnNmb3JtOiAncm90YXRlKDBkZWcpIHNjYWxlKDEpJ30pO1xuICAgICAgfVxuICAgICAgdWwuZmluZCgnbGkgPiBzcGFuJykuaG92ZXIoZnVuY3Rpb24oKXtcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMpLmNzcyh7b3BhY2l0eTogJzEnLCBwb3NpdGlvbjogJ2Fic29sdXRlJ30pXG4gICAgICB9KVxuICAgICAgdWwuY3NzKHt2aXNpYmlsaXR5OiBcInZpc2libGVcIiwgb3BhY2l0eTogJzEnfSlcbiAgICAgIHVsLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgICAvLyBpZighY3RybC5vcGVuZWQpe1xuICAgICAgLy8gICBjdHJsLm9wZW5lZCA9IHRydWU7XG4gICAgICAvLyAgICRzY29wZS4kZGlnZXN0KCk7XG4gICAgICAvLyB9XG4gICAgfVxuXG4gICAgY29uc3Qgd2l0aENsaWNrID0gKHVsKSA9PiB7XG4gICAgICAgJGVsZW1lbnQuZmluZCgnYnV0dG9uJykuZmlyc3QoKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICBpZih1bC5oYXNDbGFzcygnb3BlbicpKXtcbiAgICAgICAgICAgY2xvc2UodWwpO1xuICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgIG9wZW4odWwpO1xuICAgICAgICAgfVxuICAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgdmVyaWZ5UG9zaXRpb24gPSAodWwpID0+IHtcbiAgICAgICRlbGVtZW50LmNzcyh7ZGlzcGxheTogXCJpbmxpbmUtYmxvY2tcIn0pO1xuICAgICAgaWYodWxbMF0uaGFzQXR0cmlidXRlKCdsZWZ0Jykpe1xuICAgICAgICBsZXQgd2lkdGggPSAwLCBsaXMgPSB1bC5maW5kKCdsaScpO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2gobGlzLCBsaSA9PiB3aWR0aCs9YW5ndWxhci5lbGVtZW50KGxpKVswXS5vZmZzZXRXaWR0aCk7XG4gICAgICAgIGNvbnN0IHNpemUgPSAod2lkdGggKyAoMTAgKiBsaXMubGVuZ3RoKSkgKiAtMTtcbiAgICAgICAgdWwuY3NzKHtsZWZ0OiBzaXplfSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IHVsLmhlaWdodCgpO1xuICAgICAgICB1bC5jc3Moe3RvcDogc2l6ZSAqIC0xfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkc2NvcGUuJHdhdGNoKCckY3RybC5vcGVuZWQnLCAodmFsdWUpID0+IHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRlbGVtZW50LmZpbmQoJ3VsJyksICh1bCkgPT4ge1xuICAgICAgICAgIHZlcmlmeVBvc2l0aW9uKGFuZ3VsYXIuZWxlbWVudCh1bCkpO1xuICAgICAgICAgIGhhbmRsaW5nT3B0aW9ucyhhbmd1bGFyLmVsZW1lbnQodWwpLmZpbmQoJ2xpID4gc3BhbicpKTtcbiAgICAgICAgICBpZih2YWx1ZSl7XG4gICAgICAgICAgICBvcGVuKGFuZ3VsYXIuZWxlbWVudCh1bCkpO1xuICAgICAgICAgIH1lbHNlIHtcbiAgICAgICAgICAgIGNsb3NlKGFuZ3VsYXIuZWxlbWVudCh1bCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgIH0sIHRydWUpO1xuXG4gICAgJGVsZW1lbnQucmVhZHkoKCkgPT4ge1xuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goJGVsZW1lbnQuZmluZCgndWwnKSwgKHVsKSA9PiB7XG4gICAgICAgICAgdmVyaWZ5UG9zaXRpb24oYW5ndWxhci5lbGVtZW50KHVsKSk7XG4gICAgICAgICAgaGFuZGxpbmdPcHRpb25zKGFuZ3VsYXIuZWxlbWVudCh1bCkuZmluZCgnbGkgPiBzcGFuJykpO1xuICAgICAgICAgIGlmKCFjdHJsLmZvcmNlQ2xpY2spe1xuICAgICAgICAgICAgd2l0aEZvY3VzKGFuZ3VsYXIuZWxlbWVudCh1bCkpO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgd2l0aENsaWNrKGFuZ3VsYXIuZWxlbWVudCh1bCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICB9XVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnRcbiIsImxldCBDb21wb25lbnQgPSB7XG4gIGJpbmRpbmdzOiB7XG4gIH0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGEgY2xhc3M9XCJuYXZiYXItYnJhbmRcIiBkYXRhLW5nLWNsaWNrPVwiJGN0cmwubmF2Q29sbGFwc2UoKVwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlO2N1cnNvcjogcG9pbnRlcjtcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJuYXZUcmlnZ2VyXCI+XG4gICAgICAgIDxpPjwvaT48aT48L2k+PGk+PC9pPlxuICAgICAgPC9kaXY+XG4gICAgPC9hPlxuICBgLFxuICBjb250cm9sbGVyOiBbJyRzY29wZScsJyRlbGVtZW50JywnJGF0dHJzJywnJHRpbWVvdXQnLCAnJHBhcnNlJywgZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkdGltZW91dCwkcGFyc2UpIHtcbiAgICBsZXQgY3RybCA9IHRoaXM7XG5cbiAgICBjdHJsLiRvbkluaXQgPSAoKSA9PiB7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoXCJuYXYuZ2wtbmF2XCIpLmF0dHJjaGFuZ2Uoe1xuICAgICAgICAgIHRyYWNrVmFsdWVzOiB0cnVlLFxuICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihldm50KSB7XG4gICAgICAgICAgICBpZihldm50LmF0dHJpYnV0ZU5hbWUgPT0gJ2NsYXNzJyl7XG4gICAgICAgICAgICAgIGN0cmwudG9nZ2xlSGFtYnVyZ2VyKGV2bnQubmV3VmFsdWUuaW5kZXhPZignY29sbGFwc2VkJykgIT0gLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjdHJsLnRvZ2dsZUhhbWJ1cmdlciA9IChpc0NvbGxhcHNlZCkgPT4ge1xuICAgICAgICBpc0NvbGxhcHNlZCA/ICRlbGVtZW50LmZpbmQoJ2Rpdi5uYXZUcmlnZ2VyJykuYWRkQ2xhc3MoJ2FjdGl2ZScpIDogJGVsZW1lbnQuZmluZCgnZGl2Lm5hdlRyaWdnZXInKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICB9XG5cbiAgICAgIGN0cmwubmF2Q29sbGFwc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmd1bWdhLWxheW91dCBuYXYuZ2wtbmF2JylcbiAgICAgICAgICAuY2xhc3NMaXN0LnRvZ2dsZSgnY29sbGFwc2VkJyk7XG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChcIm5hdi5nbC1uYXZcIikuYXR0cmNoYW5nZSh7XG4gICAgICAgICAgICB0cmFja1ZhbHVlczogdHJ1ZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihldm50KSB7XG4gICAgICAgICAgICAgIGlmKGV2bnQuYXR0cmlidXRlTmFtZSA9PSAnY2xhc3MnKXtcbiAgICAgICAgICAgICAgICBjdHJsLnRvZ2dsZUhhbWJ1cmdlcihldm50Lm5ld1ZhbHVlLmluZGV4T2YoJ2NvbGxhcHNlZCcpICE9IC0xKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgY3RybC50b2dnbGVIYW1idXJnZXIoYW5ndWxhci5lbGVtZW50KCduYXYuZ2wtbmF2JykuaGFzQ2xhc3MoJ2NvbGxhcHNlZCcpKTtcbiAgICB9XG5cbiAgfV1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50O1xuIiwiaW1wb3J0IE1lbnUgICAgICAgICBmcm9tICcuL21lbnUvY29tcG9uZW50LmpzJ1xuaW1wb3J0IEdtZE5vdGlmaWNhdGlvbiBmcm9tICcuL25vdGlmaWNhdGlvbi9jb21wb25lbnQuanMnXG5pbXBvcnQgU2VsZWN0ICAgICAgIGZyb20gJy4vc2VsZWN0L2NvbXBvbmVudC5qcydcbmltcG9ydCBTZWxlY3RTZWFyY2ggICAgICAgZnJvbSAnLi9zZWxlY3Qvc2VhcmNoL2NvbXBvbmVudC5qcydcbmltcG9ydCBPcHRpb24gICAgICAgZnJvbSAnLi9zZWxlY3Qvb3B0aW9uL2NvbXBvbmVudC5qcydcbmltcG9ydCBJbnB1dCAgICAgICAgZnJvbSAnLi9pbnB1dC9jb21wb25lbnQuanMnXG5pbXBvcnQgUmlwcGxlICAgICAgIGZyb20gJy4vcmlwcGxlL2NvbXBvbmVudC5qcydcbmltcG9ydCBGYWIgICAgICAgICAgZnJvbSAnLi9mYWIvY29tcG9uZW50LmpzJ1xuaW1wb3J0IFNwaW5uZXIgICAgICBmcm9tICcuL3NwaW5uZXIvY29tcG9uZW50LmpzJ1xuaW1wb3J0IEhhbWJ1cmdlciAgICAgIGZyb20gJy4vaGFtYnVyZ2VyL2NvbXBvbmVudC5qcydcbmltcG9ydCBBbGVydCAgICAgIGZyb20gJy4vYWxlcnQvcHJvdmlkZXIuanMnXG5cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VtZ2EubGF5b3V0JywgW10pXG4gIC5wcm92aWRlcignJGdtZEFsZXJ0JywgQWxlcnQpXG4gIC5kaXJlY3RpdmUoJ2dtZFJpcHBsZScsIFJpcHBsZSlcbiAgLmNvbXBvbmVudCgnZ2xNZW51JywgTWVudSlcbiAgLmNvbXBvbmVudCgnZ2xOb3RpZmljYXRpb24nLCBHbWROb3RpZmljYXRpb24pXG4gIC5jb21wb25lbnQoJ2dtZFNlbGVjdCcsIFNlbGVjdClcbiAgLmNvbXBvbmVudCgnZ21kU2VsZWN0U2VhcmNoJywgU2VsZWN0U2VhcmNoKVxuICAuY29tcG9uZW50KCdnbWRPcHRpb24nLCBPcHRpb24pXG4gIC5jb21wb25lbnQoJ2dtZElucHV0JywgSW5wdXQpXG4gIC5jb21wb25lbnQoJ2dtZEZhYicsIEZhYilcbiAgLmNvbXBvbmVudCgnZ21kU3Bpbm5lcicsIFNwaW5uZXIpXG4gIC5jb21wb25lbnQoJ2dtZEhhbWJ1cmdlcicsIEhhbWJ1cmdlcilcbiIsImxldCBDb21wb25lbnQgPSB7XG4gIHRyYW5zY2x1ZGU6IHRydWUsXG4gIGJpbmRpbmdzOiB7XG4gIH0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBuZy10cmFuc2NsdWRlPjwvZGl2PlxuICBgLFxuICBjb250cm9sbGVyOiBbJyRzY29wZScsJyRlbGVtZW50JywnJGF0dHJzJywnJHRpbWVvdXQnLCAnJHBhcnNlJywgZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkdGltZW91dCwkcGFyc2UpIHtcbiAgICBsZXQgY3RybCA9IHRoaXMsXG4gICAgICAgIGlucHV0LFxuICAgICAgICBtb2RlbDtcblxuICAgIGN0cmwuJG9uSW5pdCA9ICgpID0+IHtcbiAgICAgIGxldCBjaGFuZ2VBY3RpdmUgPSB0YXJnZXQgPT4ge1xuICAgICAgICBpZiAodGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGN0cmwuJGRvQ2hlY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dFswXSkgY2hhbmdlQWN0aXZlKGlucHV0WzBdKVxuICAgICAgfVxuICAgICAgY3RybC4kcG9zdExpbmsgPSAoKSA9PiB7XG4gICAgICAgIGlucHV0ID0gYW5ndWxhci5lbGVtZW50KCRlbGVtZW50LmZpbmQoJ2lucHV0JykpXG4gICAgICAgIG1vZGVsID0gaW5wdXQuYXR0cignbmctbW9kZWwnKSB8fCBpbnB1dC5hdHRyKCdkYXRhLW5nLW1vZGVsJylcbiAgICAgIH1cbiAgICB9ICAgIFxuXG4gIH1dXG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudFxuIiwicmVxdWlyZSgnLi4vYXR0cmNoYW5nZS9hdHRyY2hhbmdlJyk7XG5cbmxldCBDb21wb25lbnQgPSB7XG4gIHRyYW5zY2x1ZGU6IHRydWUsXG4gIGJpbmRpbmdzOiB7XG4gICAgbWVudTogJzwnLFxuICAgIGtleXM6ICc8JyxcbiAgICBoaWRlU2VhcmNoOiAnPT8nLFxuICAgIGlzT3BlbmVkOiAnPT8nLFxuICAgIGljb25GaXJzdExldmVsOiAnQD8nLFxuICAgIHNob3dCdXR0b25GaXJzdExldmVsOiAnPT8nLFxuICAgIHRleHRGaXJzdExldmVsOiAnQD8nLFxuICAgIGRpc2FibGVBbmltYXRpb25zOiAnPT8nXG4gIH0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206IDEwcHg7cGFkZGluZy1sZWZ0OiAxMHB4O3BhZGRpbmctcmlnaHQ6IDEwcHg7XCIgbmctaWY9XCIhJGN0cmwuaGlkZVNlYXJjaFwiPlxuICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgZGF0YS1uZy1tb2RlbD1cIiRjdHJsLnNlYXJjaFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGdtZFwiIHBsYWNlaG9sZGVyPVwiQnVzY2EuLi5cIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJiYXJcIj48L2Rpdj5cbiAgICA8L2Rpdj5cblxuICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgYnRuLWJsb2NrIGdtZFwiIGRhdGEtbmctaWY9XCIkY3RybC5zaG93QnV0dG9uRmlyc3RMZXZlbFwiIGRhdGEtbmctY2xpY2s9XCIkY3RybC5nb0JhY2tUb0ZpcnN0TGV2ZWwoKVwiIGRhdGEtbmctZGlzYWJsZWQ9XCIhJGN0cmwucHJldmlvdXMubGVuZ3RoXCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgPGkgZGF0YS1uZy1jbGFzcz1cIlskY3RybC5pY29uRmlyc3RMZXZlbF1cIj48L2k+XG4gICAgICA8c3BhbiBkYXRhLW5nLWJpbmQ9XCIkY3RybC50ZXh0Rmlyc3RMZXZlbFwiPjwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cblxuICAgIDx1bCBkYXRhLW5nLWNsYXNzPVwiJ2xldmVsJy5jb25jYXQoJGN0cmwuYmFjay5sZW5ndGgpXCI+XG4gICAgICA8bGkgY2xhc3M9XCJnb2JhY2sgc2xpZGUtaW4tcmlnaHQgZ21kIGdtZC1yaXBwbGVcIiBkYXRhLW5nLXNob3c9XCIkY3RybC5wcmV2aW91cy5sZW5ndGggPiAwXCIgZGF0YS1uZy1jbGljaz1cIiRjdHJsLnByZXYoKVwiPlxuICAgICAgICA8YT5cbiAgICAgICAgICA8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+XG4gICAgICAgICAgICBrZXlib2FyZF9hcnJvd19sZWZ0XG4gICAgICAgICAgPC9pPlxuICAgICAgICAgIDxzcGFuIGRhdGEtbmctYmluZD1cIiRjdHJsLmJhY2tbJGN0cmwuYmFjay5sZW5ndGggLSAxXS5sYWJlbFwiPjwvc3Bhbj5cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cbiAgICAgIDxsaSBjbGFzcz1cImdtZCBnbWQtcmlwcGxlXCIgZGF0YS1uZy1yZXBlYXQ9XCJpdGVtIGluICRjdHJsLm1lbnUgfCBmaWx0ZXI6JGN0cmwuc2VhcmNoXCJcbiAgICAgICAgICBkYXRhLW5nLXNob3c9XCIkY3RybC5hbGxvdyhpdGVtKVwiXG4gICAgICAgICAgbmctY2xpY2s9XCIkY3RybC5uZXh0KGl0ZW0pXCJcbiAgICAgICAgICBkYXRhLW5nLWNsYXNzPVwiWyEkY3RybC5kaXNhYmxlQW5pbWF0aW9ucyA/ICRjdHJsLnNsaWRlIDogJycsIHtoZWFkZXI6IGl0ZW0udHlwZSA9PSAnaGVhZGVyJywgZGl2aWRlcjogaXRlbS50eXBlID09ICdzZXBhcmF0b3InfV1cIj5cblxuICAgICAgICAgIDxhIG5nLWlmPVwiaXRlbS50eXBlICE9ICdzZXBhcmF0b3InICYmIGl0ZW0uc3RhdGVcIiB1aS1zcmVmPVwie3tpdGVtLnN0YXRlfX1cIj5cbiAgICAgICAgICAgIDxpIGRhdGEtbmctaWY9XCJpdGVtLmljb25cIiBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgZGF0YS1uZy1iaW5kPVwiaXRlbS5pY29uXCI+PC9pPlxuICAgICAgICAgICAgPHNwYW4gbmctYmluZD1cIml0ZW0ubGFiZWxcIj48L3NwYW4+XG4gICAgICAgICAgICA8aSBkYXRhLW5nLWlmPVwiaXRlbS5jaGlsZHJlblwiIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcHVsbC1yaWdodFwiPlxuICAgICAgICAgICAgICBrZXlib2FyZF9hcnJvd19yaWdodFxuICAgICAgICAgICAgPC9pPlxuICAgICAgICAgIDwvYT5cblxuICAgICAgICAgIDxhIG5nLWlmPVwiaXRlbS50eXBlICE9ICdzZXBhcmF0b3InICYmICFpdGVtLnN0YXRlXCI+XG4gICAgICAgICAgICA8aSBkYXRhLW5nLWlmPVwiaXRlbS5pY29uXCIgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIGRhdGEtbmctYmluZD1cIml0ZW0uaWNvblwiPjwvaT5cbiAgICAgICAgICAgIDxzcGFuIG5nLWJpbmQ9XCJpdGVtLmxhYmVsXCI+PC9zcGFuPlxuICAgICAgICAgICAgPGkgZGF0YS1uZy1pZj1cIml0ZW0uY2hpbGRyZW5cIiBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHB1bGwtcmlnaHRcIj5cbiAgICAgICAgICAgICAga2V5Ym9hcmRfYXJyb3dfcmlnaHRcbiAgICAgICAgICAgIDwvaT5cbiAgICAgICAgICA8L2E+XG5cbiAgICAgIDwvbGk+XG4gICAgPC91bD5cblxuICAgIDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5cblxuICBgLFxuICBjb250cm9sbGVyOiBbJyR0aW1lb3V0JywgJyRhdHRycycsICckZWxlbWVudCcsIGZ1bmN0aW9uKCR0aW1lb3V0LCAkYXR0cnMsICRlbGVtZW50KSB7XG4gICAgbGV0IGN0cmwgPSB0aGlzXG4gICAgY3RybC5rZXlzID0gY3RybC5rZXlzIHx8IFtdXG4gICAgY3RybC5pY29uRmlyc3RMZXZlbCA9IGN0cmwuaWNvbkZpcnN0TGV2ZWwgfHwgJ2dseXBoaWNvbiBnbHlwaGljb24taG9tZSdcbiAgICBjdHJsLnByZXZpb3VzID0gW11cbiAgICBjdHJsLmJhY2sgPSBbXVxuXG4gICAgY3RybC4kb25Jbml0ID0gKCkgPT4ge1xuICAgICAgY3RybC5kaXNhYmxlQW5pbWF0aW9ucyA9IGN0cmwuZGlzYWJsZUFuaW1hdGlvbnMgfHwgZmFsc2U7XG5cbiAgICAgIGNvbnN0IHN0cmluZ1RvQm9vbGVhbiA9IChzdHJpbmcpID0+IHtcbiAgICAgICAgc3dpdGNoKHN0cmluZy50b0xvd2VyQ2FzZSgpLnRyaW0oKSl7XG4gICAgICAgICAgY2FzZSBcInRydWVcIjogY2FzZSBcInllc1wiOiBjYXNlIFwiMVwiOiByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICBjYXNlIFwiZmFsc2VcIjogY2FzZSBcIm5vXCI6IGNhc2UgXCIwXCI6IGNhc2UgbnVsbDogcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBCb29sZWFuKHN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGZpeGVkID0gc3RyaW5nVG9Cb29sZWFuKCRhdHRycy5maXhlZCB8fCAnZmFsc2UnKTtcbiAgICAgIGxldCBmaXhlZE1haW4gPSBzdHJpbmdUb0Jvb2xlYW4oJGF0dHJzLmZpeGVkTWFpbiB8fCAnZmFsc2UnKTtcblxuICAgICAgaWYoZml4ZWRNYWluKXtcbiAgICAgICAgZml4ZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvbkJhY2tkcm9wQ2xpY2sgPSAoZXZ0KSA9PiBhbmd1bGFyLmVsZW1lbnQoJy5ndW1nYS1sYXlvdXQgbmF2LmdsLW5hdicpLnJlbW92ZUNsYXNzKCdjb2xsYXBzZWQnKTtcblxuICAgICAgaWYoIWZpeGVkKXtcbiAgICAgICAgbGV0IGVsbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbG0uY2xhc3NMaXN0LmFkZCgnZ21kLW1lbnUtYmFja2Ryb3AnKTtcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KCdib2R5JylbMF0uYXBwZW5kQ2hpbGQoZWxtKTtcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KCdkaXYuZ21kLW1lbnUtYmFja2Ryb3AnKS5vbignY2xpY2snLCBvbkJhY2tkcm9wQ2xpY2spO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzZXRNZW51VG9wID0gKCkgPT4ge1xuICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgc2l6ZSA9IGFuZ3VsYXIuZWxlbWVudCgnLmd1bWdhLWxheW91dCAuZ2wtaGVhZGVyJykuaGVpZ2h0KCk7XG4gICAgICAgICAgICBpZihzaXplID09IDApIHNldE1lbnVUb3AoKTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgnLmd1bWdhLWxheW91dCBuYXYuZ2wtbmF2LmNvbGxhcHNlZCcpLmNzcyh7XG4gICAgICAgICAgICAgICB0b3A6IHNpemVcbiAgICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgY3RybC50b2dnbGVDb250ZW50ID0gKGlzQ29sbGFwc2VkKSA9PiB7XG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZihmaXhlZCl7XG4gICAgICAgICAgICBjb25zdCBtYWluQ29udGVudCA9IGFuZ3VsYXIuZWxlbWVudCgnLmd1bWdhLWxheW91dCAuZ2wtbWFpbicpO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyQ29udGVudCA9IGFuZ3VsYXIuZWxlbWVudCgnLmd1bWdhLWxheW91dCAuZ2wtaGVhZGVyJyk7XG5cbiAgICAgICAgICAgIGlmKGlzQ29sbGFwc2VkKXtcbiAgICAgICAgICAgICAgaGVhZGVyQ29udGVudC5yZWFkeSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0TWVudVRvcCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaXNDb2xsYXBzZWQgPyBtYWluQ29udGVudC5hZGRDbGFzcygnY29sbGFwc2VkJykgICA6IG1haW5Db250ZW50LnJlbW92ZUNsYXNzKCdjb2xsYXBzZWQnKTtcbiAgICAgICAgICAgIGlmKCFmaXhlZE1haW4gJiYgZml4ZWQpe1xuICAgICAgICAgICAgICBpc0NvbGxhcHNlZCA/IGhlYWRlckNvbnRlbnQuYWRkQ2xhc3MoJ2NvbGxhcHNlZCcpIDogaGVhZGVyQ29udGVudC5yZW1vdmVDbGFzcygnY29sbGFwc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjb25zdCB2ZXJpZnlCYWNrZHJvcCA9IChpc0NvbGxhcHNlZCkgPT4ge1xuICAgICAgICBjb25zdCBoZWFkZXJDb250ZW50ID0gYW5ndWxhci5lbGVtZW50KCcuZ3VtZ2EtbGF5b3V0IC5nbC1oZWFkZXInKTtcbiAgICAgICAgY29uc3QgYmFja0NvbnRlbnQgPSBhbmd1bGFyLmVsZW1lbnQoJ2Rpdi5nbWQtbWVudS1iYWNrZHJvcCcpXG4gICAgICAgIGlmKGlzQ29sbGFwc2VkICYmICFmaXhlZCl7XG4gICAgICAgICAgYmFja0NvbnRlbnQuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgIGxldCBzaXplID0gaGVhZGVyQ29udGVudC5oZWlnaHQoKTtcbiAgICAgICAgICBpZihzaXplID4gMCl7XG4gICAgICAgICAgICBiYWNrQ29udGVudC5jc3Moe3RvcDogc2l6ZX0pXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBiYWNrQ29udGVudC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgJHRpbWVvdXQoKCkgPT4gY3RybC5pc09wZW5lZCA9IGlzQ29sbGFwc2VkKTtcbiAgICAgIH1cblxuICAgICAgaWYoYW5ndWxhci5lbGVtZW50LmZuLmF0dHJjaGFuZ2Upe1xuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJuYXYuZ2wtbmF2XCIpLmF0dHJjaGFuZ2Uoe1xuICAgICAgICAgICAgdHJhY2tWYWx1ZXM6IHRydWUsXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oZXZudCkge1xuICAgICAgICAgICAgICAgIGlmKGV2bnQuYXR0cmlidXRlTmFtZSA9PSAnY2xhc3MnKXtcbiAgICAgICAgICAgICAgICAgIGN0cmwudG9nZ2xlQ29udGVudChldm50Lm5ld1ZhbHVlLmluZGV4T2YoJ2NvbGxhcHNlZCcpICE9IC0xKTtcbiAgICAgICAgICAgICAgICAgIHZlcmlmeUJhY2tkcm9wKGV2bnQubmV3VmFsdWUuaW5kZXhPZignY29sbGFwc2VkJykgIT0gLTEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGN0cmwudG9nZ2xlQ29udGVudChhbmd1bGFyLmVsZW1lbnQoJ25hdi5nbC1uYXYnKS5oYXNDbGFzcygnY29sbGFwc2VkJykpO1xuICAgICAgICB2ZXJpZnlCYWNrZHJvcChhbmd1bGFyLmVsZW1lbnQoJ25hdi5nbC1uYXYnKS5oYXNDbGFzcygnY29sbGFwc2VkJykpO1xuICAgICAgfVxuXG4gICAgICBjdHJsLiRvbkluaXQgPSAoKSA9PiB7XG4gICAgICAgIGlmKCFjdHJsLmhhc093blByb3BlcnR5KCdzaG93QnV0dG9uRmlyc3RMZXZlbCcpKXtcbiAgICAgICAgICBjdHJsLnNob3dCdXR0b25GaXJzdExldmVsID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjdHJsLnByZXYgPSAoKSA9PiB7XG4gICAgICAgICR0aW1lb3V0KCgpPT57XG4gICAgICAgICAgY3RybC5zbGlkZSA9ICdzbGlkZS1pbi1sZWZ0JztcbiAgICAgICAgICBjdHJsLm1lbnUgPSBjdHJsLnByZXZpb3VzLnBvcCgpO1xuICAgICAgICAgIGN0cmwuYmFjay5wb3AoKTtcbiAgICAgICAgfSwgMjUwKTtcbiAgICAgIH1cbiAgICAgIGN0cmwubmV4dCA9IGl0ZW0gPT4ge1xuICAgICAgICAkdGltZW91dCgoKT0+e1xuICAgICAgICAgIGlmIChpdGVtLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBjdHJsLnNsaWRlID0gJ3NsaWRlLWluLXJpZ2h0JztcbiAgICAgICAgICAgIGN0cmwucHJldmlvdXMucHVzaChjdHJsLm1lbnUpO1xuICAgICAgICAgICAgY3RybC5tZW51ID0gaXRlbS5jaGlsZHJlbjtcbiAgICAgICAgICAgIGN0cmwuYmFjay5wdXNoKGl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMjUwKTtcbiAgICAgIH1cbiAgICAgIGN0cmwuZ29CYWNrVG9GaXJzdExldmVsID0gKCkgPT4ge1xuICAgICAgICBjdHJsLnNsaWRlID0gJ3NsaWRlLWluLWxlZnQnXG4gICAgICAgIGN0cmwubWVudSA9IGN0cmwucHJldmlvdXNbMF1cbiAgICAgICAgY3RybC5wcmV2aW91cyA9IFtdXG4gICAgICAgIGN0cmwuYmFjayA9IFtdXG4gICAgICB9XG4gICAgICBjdHJsLmFsbG93ID0gaXRlbSA9PiB7XG4gICAgICAgIGlmIChjdHJsLmtleXMgJiYgY3RybC5rZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBpZiAoIWl0ZW0ua2V5KSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIHJldHVybiBjdHJsLmtleXMuaW5kZXhPZihpdGVtLmtleSkgPiAtMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjdHJsLnNsaWRlID0gJ3NsaWRlLWluLWxlZnQnXG4gICAgfVxuXG4gIH1dXG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudFxuIiwibGV0IENvbXBvbmVudCA9IHtcbiAgYmluZGluZ3M6IHtcbiAgICBpY29uOiAnQCcsXG4gICAgbm90aWZpY2F0aW9uczogJz0nLFxuICAgIG9uVmlldzogJyY/J1xuICB9LFxuICB0ZW1wbGF0ZTogYFxuICAgIDx1bCBjbGFzcz1cIm5hdiBuYXZiYXItbmF2IG5hdmJhci1yaWdodCBub3RpZmljYXRpb25zXCI+XG4gICAgICA8bGkgY2xhc3M9XCJkcm9wZG93blwiPlxuICAgICAgICA8YSBocmVmPVwiI1wiIGJhZGdlPVwie3skY3RybC5ub3RpZmljYXRpb25zLmxlbmd0aH19XCIgY2xhc3M9XCJkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCIgcm9sZT1cImJ1dHRvblwiIGFyaWEtaGFzcG9wdXA9XCJ0cnVlXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCI+XG4gICAgICAgICAgPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIGRhdGEtbmctYmluZD1cIiRjdHJsLmljb25cIj48L2k+XG4gICAgICAgIDwvYT5cbiAgICAgICAgPHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudVwiPlxuICAgICAgICAgIDxsaSBkYXRhLW5nLXJlcGVhdD1cIml0ZW0gaW4gJGN0cmwubm90aWZpY2F0aW9uc1wiIGRhdGEtbmctY2xpY2s9XCIkY3RybC52aWV3KCRldmVudCwgaXRlbSlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtbGVmdFwiPlxuICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJtZWRpYS1vYmplY3RcIiBkYXRhLW5nLXNyYz1cInt7aXRlbS5pbWFnZX19XCI+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtYm9keVwiIGRhdGEtbmctYmluZD1cIml0ZW0uY29udGVudFwiPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgIDwvbGk+XG4gICAgPC91bD5cbiAgYCxcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgbGV0IGN0cmwgPSB0aGlzXG5cbiAgICBjdHJsLiRvbkluaXQgPSAoKSA9PiB7XG4gICAgICBjdHJsLnZpZXcgPSAoZXZlbnQsIGl0ZW0pID0+IGN0cmwub25WaWV3KHtldmVudDogZXZlbnQsIGl0ZW06IGl0ZW19KVxuICAgIH1cbiAgICBcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnRcbiIsImxldCBDb21wb25lbnQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0MnLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIGlmKCFlbGVtZW50WzBdLmNsYXNzTGlzdC5jb250YWlucygnZml4ZWQnKSl7XG4gICAgICAgIGVsZW1lbnRbMF0uc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnXG4gICAgICB9XG4gICAgICBlbGVtZW50WzBdLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbidcbiAgICAgIGVsZW1lbnRbMF0uc3R5bGUudXNlclNlbGVjdCA9ICdub25lJ1xuXG4gICAgICBlbGVtZW50WzBdLnN0eWxlLm1zVXNlclNlbGVjdCA9ICdub25lJ1xuICAgICAgZWxlbWVudFswXS5zdHlsZS5tb3pVc2VyU2VsZWN0ID0gJ25vbmUnXG4gICAgICBlbGVtZW50WzBdLnN0eWxlLndlYmtpdFVzZXJTZWxlY3QgPSAnbm9uZSdcblxuICAgICAgZnVuY3Rpb24gY3JlYXRlUmlwcGxlKGV2dCkge1xuICAgICAgICB2YXIgcmlwcGxlID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cImdtZC1yaXBwbGUtZWZmZWN0IGFuaW1hdGVcIj4nKSxcbiAgICAgICAgICByZWN0ID0gZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICByYWRpdXMgPSBNYXRoLm1heChyZWN0LmhlaWdodCwgcmVjdC53aWR0aCksXG4gICAgICAgICAgbGVmdCA9IGV2dC5wYWdlWCAtIHJlY3QubGVmdCAtIHJhZGl1cyAvIDIgLSBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQsXG4gICAgICAgICAgdG9wID0gZXZ0LnBhZ2VZIC0gcmVjdC50b3AgLSByYWRpdXMgLyAyIC0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cbiAgICAgICAgcmlwcGxlWzBdLnN0eWxlLndpZHRoID0gcmlwcGxlWzBdLnN0eWxlLmhlaWdodCA9IHJhZGl1cyArICdweCc7XG4gICAgICAgIHJpcHBsZVswXS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG4gICAgICAgIHJpcHBsZVswXS5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuICAgICAgICByaXBwbGUub24oJ2FuaW1hdGlvbmVuZCB3ZWJraXRBbmltYXRpb25FbmQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsZW1lbnQuYXBwZW5kKHJpcHBsZSk7XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQuYmluZCgnY2xpY2snLCBjcmVhdGVSaXBwbGUpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnRcbiIsImxldCBDb21wb25lbnQgPSB7XG4gIHJlcXVpcmU6IFsnbmdNb2RlbCcsJ25nUmVxdWlyZWQnXSxcbiAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgYmluZGluZ3M6IHtcbiAgICBuZ01vZGVsOiAnPScsXG4gICAgbmdEaXNhYmxlZDogJz0/JyxcbiAgICB1bnNlbGVjdDogJ0A/JyxcbiAgICBvcHRpb25zOiAnPCcsXG4gICAgb3B0aW9uOiAnQCcsXG4gICAgdmFsdWU6ICdAJyxcbiAgICBwbGFjZWhvbGRlcjogJ0A/JyxcbiAgICBvbkNoYW5nZTogXCImP1wiXG4gIH0sXG4gIHRlbXBsYXRlOiBgXG4gIDxkaXYgY2xhc3M9XCJkcm9wZG93biBnbWRcIj5cbiAgICAgPGxhYmVsIGNsYXNzPVwiY29udHJvbC1sYWJlbCBmbG9hdGluZy1kcm9wZG93blwiIG5nLXNob3c9XCIkY3RybC5zZWxlY3RlZFwiIGRhdGEtbmctYmluZD1cIiRjdHJsLnBsYWNlaG9sZGVyXCI+PC9sYWJlbD5cbiAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBnbWQgZHJvcGRvd24tdG9nZ2xlIGdtZC1zZWxlY3QtYnV0dG9uXCJcbiAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICBzdHlsZT1cImJvcmRlci1yYWRpdXM6IDA7XCJcbiAgICAgICAgICAgICBpZD1cImdtZFNlbGVjdFwiXG4gICAgICAgICAgICAgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiXG4gICAgICAgICAgICAgbmctZGlzYWJsZWQ9XCIkY3RybC5uZ0Rpc2FibGVkXCJcbiAgICAgICAgICAgICBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiXG4gICAgICAgICAgICAgYXJpYS1leHBhbmRlZD1cInRydWVcIj5cbiAgICAgICA8c3BhbiBjbGFzcz1cIml0ZW0tc2VsZWN0XCIgZGF0YS1uZy1zaG93PVwiJGN0cmwuc2VsZWN0ZWRcIiBkYXRhLW5nLWJpbmQ9XCIkY3RybC5zZWxlY3RlZFwiPjwvc3Bhbj5cbiAgICAgICA8c3BhbiBkYXRhLW5nLWJpbmQ9XCIkY3RybC5wbGFjZWhvbGRlclwiIGRhdGEtbmctaGlkZT1cIiRjdHJsLnNlbGVjdGVkXCIgY2xhc3M9XCJpdGVtLXNlbGVjdCBwbGFjZWhvbGRlclwiPjwvc3Bhbj5cbiAgICAgICA8c3BhbiBjbGFzcz1cImNhcmV0XCI+PC9zcGFuPlxuICAgICA8L2J1dHRvbj5cbiAgICAgPHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudVwiIGFyaWEtbGFiZWxsZWRieT1cImdtZFNlbGVjdFwiIG5nLXNob3c9XCIkY3RybC5vcHRpb25cIj5cbiAgICAgICA8bGkgZGF0YS1uZy1jbGljaz1cIiRjdHJsLmNsZWFyKClcIiBuZy1pZj1cIiRjdHJsLnVuc2VsZWN0XCI+XG4gICAgICAgICA8YSBkYXRhLW5nLWNsYXNzPVwie2FjdGl2ZTogZmFsc2V9XCI+e3skY3RybC51bnNlbGVjdH19PC9hPlxuICAgICAgIDwvbGk+XG4gICAgICAgPGxpIGRhdGEtbmctcmVwZWF0PVwib3B0aW9uIGluICRjdHJsLm9wdGlvbnMgdHJhY2sgYnkgJGluZGV4XCI+XG4gICAgICAgICA8YSBjbGFzcz1cInNlbGVjdC1vcHRpb25cIiBkYXRhLW5nLWNsaWNrPVwiJGN0cmwuc2VsZWN0KG9wdGlvbilcIiBkYXRhLW5nLWJpbmQ9XCJvcHRpb25bJGN0cmwub3B0aW9uXSB8fCBvcHRpb25cIiBkYXRhLW5nLWNsYXNzPVwie2FjdGl2ZTogJGN0cmwuaXNBY3RpdmUob3B0aW9uKX1cIj48L2E+XG4gICAgICAgPC9saT5cbiAgICAgPC91bD5cbiAgICAgPHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudSBnbWRcIiBhcmlhLWxhYmVsbGVkYnk9XCJnbWRTZWxlY3RcIiBuZy1zaG93PVwiISRjdHJsLm9wdGlvblwiIHN0eWxlPVwibWF4LWhlaWdodDogMjUwcHg7b3ZlcmZsb3c6IGF1dG87XCIgbmctdHJhbnNjbHVkZT48L3VsPlxuICAgPC9kaXY+XG4gIGAsXG4gIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywnJGF0dHJzJywnJHRpbWVvdXQnLCckZWxlbWVudCcsIGZ1bmN0aW9uKCRzY29wZSwkYXR0cnMsJHRpbWVvdXQsJGVsZW1lbnQpIHtcbiAgICBsZXQgY3RybCA9IHRoaXNcbiAgICAsICAgbmdNb2RlbEN0cmwgPSAkZWxlbWVudC5jb250cm9sbGVyKCduZ01vZGVsJylcblxuICAgIGxldCBvcHRpb25zID0gY3RybC5vcHRpb25zIHx8IFtdO1xuXG4gICAgY3RybC5zZWxlY3QgPSBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChvcHRpb25zLCBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICBjdHJsLm5nTW9kZWwgPSBvcHRpb24ubmdWYWx1ZVxuICAgICAgY3RybC5zZWxlY3RlZCA9IG9wdGlvbi5uZ0xhYmVsXG4gICAgfTtcblxuICAgIGN0cmwuYWRkT3B0aW9uID0gZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICBvcHRpb25zLnB1c2gob3B0aW9uKTtcbiAgICB9O1xuXG4gICAgbGV0IHNldFNlbGVjdGVkID0gKHZhbHVlKSA9PiB7XG4gICAgICBhbmd1bGFyLmZvckVhY2gob3B0aW9ucywgb3B0aW9uID0+IHtcbiAgICAgICAgaWYgKG9wdGlvbi5uZ1ZhbHVlLiQkaGFzaEtleSkge1xuICAgICAgICAgIGRlbGV0ZSBvcHRpb24ubmdWYWx1ZS4kJGhhc2hLZXlcbiAgICAgICAgfVxuICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHModmFsdWUsIG9wdGlvbi5uZ1ZhbHVlKSkge1xuICAgICAgICAgIGN0cmwuc2VsZWN0KG9wdGlvbilcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRTZWxlY3RlZChjdHJsLm5nTW9kZWwpXG4gICAgfSwgMCk7XG5cbiAgICBjdHJsLiRkb0NoZWNrID0gKCkgPT4ge1xuICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5sZW5ndGggPiAwKSBzZXRTZWxlY3RlZChjdHJsLm5nTW9kZWwpXG4gICAgfVxuXG4gIH1dXG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudFxuIiwibGV0IENvbXBvbmVudCA9IHtcbiAgLy8gcmVxdWlyZTogWyduZ01vZGVsJywnbmdSZXF1aXJlZCddLFxuICB0cmFuc2NsdWRlOiB0cnVlLFxuICByZXF1aXJlOiB7XG4gICAgZ21kU2VsZWN0Q3RybDogJ15nbWRTZWxlY3QnXG4gIH0sXG4gIGJpbmRpbmdzOiB7XG4gICAgbmdWYWx1ZTogJz0nLFxuICAgIG5nTGFiZWw6ICc9J1xuICB9LFxuICB0ZW1wbGF0ZTogYFxuICAgIDxhIGNsYXNzPVwic2VsZWN0LW9wdGlvblwiIGRhdGEtbmctY2xpY2s9XCIkY3RybC5zZWxlY3QoJGN0cmwubmdWYWx1ZSwgJGN0cmwubmdMYWJlbClcIiBuZy1jbGFzcz1cInthY3RpdmU6ICRjdHJsLnNlbGVjdGVkfVwiIG5nLXRyYW5zY2x1ZGU+PC9hPlxuICBgLFxuICBjb250cm9sbGVyOiBbJyRzY29wZScsJyRhdHRycycsJyR0aW1lb3V0JywnJGVsZW1lbnQnLCckdHJhbnNjbHVkZScsIGZ1bmN0aW9uKCRzY29wZSwkYXR0cnMsJHRpbWVvdXQsJGVsZW1lbnQsJHRyYW5zY2x1ZGUpIHtcbiAgICBsZXQgY3RybCA9IHRoaXNcblxuICAgIGN0cmwuJG9uSW5pdCA9ICgpID0+IHtcbiAgICAgIGN0cmwuZ21kU2VsZWN0Q3RybC5hZGRPcHRpb24odGhpcylcbiAgICB9XG4gICAgY3RybC5zZWxlY3QgPSAoKSA9PiB7XG4gICAgICBjdHJsLmdtZFNlbGVjdEN0cmwuc2VsZWN0KHRoaXMpO1xuICAgICAgaWYoY3RybC5nbWRTZWxlY3RDdHJsLm9uQ2hhbmdlKXtcbiAgICAgICAgY3RybC5nbWRTZWxlY3RDdHJsLm9uQ2hhbmdlKHt2YWx1ZTogdGhpcy5uZ1ZhbHVlfSk7XG4gICAgICB9XG4gICAgfVxuICB9XVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnRcbiIsImxldCBDb21wb25lbnQgPSB7XG4gIHRyYW5zY2x1ZGU6IHRydWUsXG4gIHJlcXVpcmU6IHtcbiAgICBnbWRTZWxlY3RDdHJsOiAnXmdtZFNlbGVjdCdcbiAgfSxcbiAgYmluZGluZ3M6IHtcbiAgICBuZ01vZGVsOiAnPScsXG4gICAgcGxhY2Vob2xkZXI6ICdAPydcbiAgfSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXBcIiBzdHlsZT1cImJvcmRlcjogbm9uZTtiYWNrZ3JvdW5kOiAjZjlmOWY5O1wiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJpbnB1dC1ncm91cC1hZGRvblwiIGlkPVwiYmFzaWMtYWRkb24xXCIgc3R5bGU9XCJib3JkZXI6IG5vbmU7XCI+XG4gICAgICAgIDxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5zZWFyY2g8L2k+XG4gICAgICA8L3NwYW4+XG4gICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBzdHlsZT1cImJvcmRlcjogbm9uZTtcIiBjbGFzcz1cImZvcm0tY29udHJvbCBnbWRcIiBuZy1tb2RlbD1cIiRjdHJsLm5nTW9kZWxcIiBwbGFjZWhvbGRlcj1cInt7JGN0cmwucGxhY2Vob2xkZXJ9fVwiPlxuICAgIDwvZGl2PlxuICBgLFxuICBjb250cm9sbGVyOiBbJyRzY29wZScsJyRhdHRycycsJyR0aW1lb3V0JywnJGVsZW1lbnQnLCckdHJhbnNjbHVkZScsIGZ1bmN0aW9uKCRzY29wZSwkYXR0cnMsJHRpbWVvdXQsJGVsZW1lbnQsJHRyYW5zY2x1ZGUpIHtcbiAgICBsZXQgY3RybCA9IHRoaXM7XG4gIH1dXG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudFxuIiwibGV0IENvbXBvbmVudCA9IHtcbiAgYmluZGluZ3M6IHtcbiAgICBkaWFtZXRlcjogXCJAP1wiLFxuICAgIGJveCAgICAgOiBcIj0/XCJcbiAgfSxcbiAgdGVtcGxhdGU6IGBcbiAgPGRpdiBjbGFzcz1cInNwaW5uZXItbWF0ZXJpYWxcIiBuZy1pZj1cIiRjdHJsLmRpYW1ldGVyXCI+XG4gICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIlxuICAgICAgICB2ZXJzaW9uPVwiMVwiXG4gICAgICAgIG5nLWNsYXNzPVwieydzcGlubmVyLWJveCcgOiAkY3RybC5ib3h9XCJcbiAgICAgICAgc3R5bGU9XCJ3aWR0aDoge3skY3RybC5kaWFtZXRlcn19O2hlaWdodDoge3skY3RybC5kaWFtZXRlcn19O1wiXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgMjggMjhcIj5cbiAgICA8ZyBjbGFzcz1cInFwLWNpcmN1bGFyLWxvYWRlclwiPlxuICAgICA8cGF0aCBjbGFzcz1cInFwLWNpcmN1bGFyLWxvYWRlci1wYXRoXCIgZmlsbD1cIm5vbmVcIiBkPVwiTSAxNCwxLjUgQSAxMi41LDEyLjUgMCAxIDEgMS41LDE0XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIC8+XG4gICAgPC9nPlxuICAgPC9zdmc+XG4gIDwvZGl2PmAsXG4gIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywnJGVsZW1lbnQnLCckYXR0cnMnLCckdGltZW91dCcsICckcGFyc2UnLCBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICR0aW1lb3V0LCRwYXJzZSkge1xuICAgIGxldCBjdHJsID0gdGhpcztcblxuICAgIGN0cmwuJG9uSW5pdCA9ICgpID0+IHtcbiAgICAgIGN0cmwuZGlhbWV0ZXIgPSBjdHJsLmRpYW1ldGVyIHx8ICc1MHB4JztcbiAgICB9XG5cbiAgfV1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50XG4iXX0=
