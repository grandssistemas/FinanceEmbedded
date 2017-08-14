import gumgaRest from '../../bower_components/gumga-rest-ng/dist/gumga-rest.min';
import gumgaController from '../../bower_components/gumga-controller-ng/dist/gumga-controller.min.js'
import gumgaAlert from '../../bower_components/gumga-alert-ng/dist/gumga-alert.min.js'
import gumgaWebStorage from '../../bower_components/gumga-web-storage-ng/dist/gumga-web-storage.min.js'
import gumgaManyToOne from '../../bower_components/gumga-many-to-one-ng/dist/gumga-many-to-one.min.js'
import gumgaAddress from '../../bower_components/gumga-address-ng/dist/gumga-address.min.js'
import gumgaTranslate from '../../bower_components/gumga-translate-ng/dist/gumga-translate.min.js'
import gumgaMask from '../../bower_components/gumga-mask-ng/dist/gumga-mask.min.js'
import gumgaUpload from '../../bower_components/gumga-upload-ng/dist/gumga-upload.min.js'
import gumgaCustomField from '../../bower_components/gumga-custom-fields-ng/dist/gumga-custom-fields.min.js'
import gumgaCounter from '../../bower_components/gumga-counter/dist/gumga-counter.min.js'
import gumgaBreadcrumb from '../../bower_components/gumga-breadcrumb/dist/gumga-breadcrumb.min.js'
import gumgaConfirm from '../../bower_components/gumga-confirm/dist/gumga-confirm.min.js'
import gumgaOneToMany from '../../bower_components/gumga-one-to-many-ng/dist/gumga-one-to-many.min.js'
import gumgaPopulate from '../../bower_components/gumga-populate-ng/dist/gumga-populate.min.js'
import gumgaManyToMany from '../../bower_components/gumga-many-to-many-ng/dist/gumga-many-to-many.min.js'
import gumgaForm from '../../bower_components/gumga-form-ng/dist/gumga-form.min.js'
import gumgaGenericFilter from '../../bower_components/gumga-generic-filter-ng/dist/gumga-generic-filter.min.js'
import gumgaQueryFilter from '../../bower_components/gumga-query-filter-ng/dist/gumga-query-filter.min.js'
import gumgaList from '../../bower_components/gumga-list-ng/dist/gumga-list.min'
import gumgaDate from '../../bower_components/gumga-date-ng/dist/gumga-date.min.js'
import InputMask from '../../bower_components/angular-input-masks/angular-input-masks.min.js'
import UiSelect from '../../bower_components/angular-ui-select/dist/select.min'

export default angular.module('group.dependencies', [
    'gumga.rest',
    'gumga.controller',
    'gumga.alert',
    'gumga.webstorage',
    'gumga.manytoone',
    'gumga.address',
    'gumga.translate',
    'gumga.mask',
    'gumga.upload',
    'gumga.customfields',
    'gumga.counter',
    'gumga.breadcrumb',
    'gumga.confirm',
    'gumga.onetomany',
    'gumga.populate',
    'gumga.manytomany',
    'gumga.form',
    'gumga.queryfilter',
    'gumga.genericfilter',
    'gumga.list',
    'gumga.date',
    'ui.utils.masks',
    'gumga.layout',
    'ui.select'
])