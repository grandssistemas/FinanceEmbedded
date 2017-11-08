PercentageFinanceUtilsService.$inject = [];
function PercentageFinanceUtilsService() {
    const ONE_MILLION = 1000000;

    this.round = function (value) {
        var signal = value > 0 ? 1 : -1;
        return (Math.floor(Math.round(Math.abs(value * 10000))) / 10000) * signal;
    };

    this.sum = function (value1, value2) {
        return (Math.round(value1 * 10000) + Math.round(value2 * 10000)) / 10000;
    };

    this.divide = function (money, divider) {
        return this.round((Math.round(money * 10000) / divider) / 10000);
    };
    this.multiply = function (money, multiplier) {
        return this.round(Math.round((money * 10000) * ( multiplier * 10000 )) / 100000000);
    };

    this.round6 = function (value) {
        var signal = value > 0 ? 1 : -1;
        return (Math.floor(Math.round(Math.abs(value * ONE_MILLION))) / ONE_MILLION) * signal;
    };

    this.sum6 = function (value1, value2) {
        return (Math.round(value1 * ONE_MILLION) + Math.round(value2 * ONE_MILLION)) / ONE_MILLION;
    };

    this.divide6 = function (money, divider) {
        return this.round6((Math.round(money * ONE_MILLION) / divider) / ONE_MILLION);
    };
    this.multiply6 = function (money, multiplier) {
        return this.round6(Math.round((money * ONE_MILLION) * ( multiplier * ONE_MILLION )) / (ONE_MILLION*ONE_MILLION));
    };
}

module.exports = PercentageFinanceUtilsService;