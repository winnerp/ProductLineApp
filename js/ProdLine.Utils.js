$(document).ajaxStart(function () {
    $.mobile.loading('show');
});

$(document).ajaxStop(function () {
    $.mobile.loading('hide');
});

var ProdLine = ProdLine || {};
ProdLine.Utils = {};

ProdLine.Utils.GetBase64EncodedString = function (convertText) {
    return $.base64.encode(convertText); //uses Base64.js
};
