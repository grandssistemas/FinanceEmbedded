MoneyUtilsService.$inject = [];
function MoneyUtilsService() {


    this.roundMoney = function (value) {
        var signal = value > 0 ? 1 : -1;
        return (Math.floor(Math.round(Math.abs(value * 100))) / 100) * signal;
    };

    this.sumMoney = function (value1, value2) {
        return (Math.round(value1 * 100) + Math.round(value2 * 100)) / 100;
    };

    this.divideMoney = function (money, divider) {
        return this.roundMoney((Math.round(money * 100) / divider) / 100);
    };
    this.multiplyMoney = function (money, multiplier) {
        return this.roundMoney(Math.round((money * 100) * ( multiplier * 100 )) / 10000);
    }
}
module.exports = MoneyUtilsService;