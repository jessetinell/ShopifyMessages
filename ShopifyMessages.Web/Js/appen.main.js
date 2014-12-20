$(document).ready(function () {
    appenMain.Init();
});

var appenMain = appenMain || (function () {
    var page;

    var init = function () {
        page = window.Page;

        if (page === 'publish') {
            appenPublish.Init();
        }
    };

    /* == Private == */
    return {
        Init:init
    };
})();