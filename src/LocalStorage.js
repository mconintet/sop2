define({
    name: 'sop.LocalStorage',
    init: function () {
        /**
         * @memberof sop
         * @constructor
         */
        var LocalStorage = function () {

        };

        LocalStorage.setItem = function (key, item) {
            try {
                item = JSON.stringify(item);
                localStorage.setItem(key, item);
                return true;
            } catch (e) {
                return false;
            }
        };

        LocalStorage.getItem = function (key) {
            var item = localStorage.getItem(key);
            if (item) {
                try {
                    return JSON.parse(item);
                } catch (e) {
                    return null;
                }
            }
            return item
        };

        LocalStorage.removeItem = function (key) {
            localStorage.removeItem(key);
        };

        return LocalStorage;
    }
});