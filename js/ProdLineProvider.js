/// <reference path="jquery-1.8.2.js" />

var ProdLineProvider = {};  //namespace

ProdLineProvider.Lists = {}; //sub-namespace
ProdLineProvider.Customer = {}; //sub-namespace
ProdLineProvider.Product = {}; //sub-namespace
ProdLineProvider.Category = {}; //sub-namespace

ProdLineProvider.defaultOptions = {
    //constants
    //ServiceRoot: "http://localhost:2269/ProductLine.svc",
    ServiceRoot: "http://productline.dotnetcodecentral.com/ProductLine.svc",
    CategoriesEndPoint: "/Categories",
    ProductsEndPoint: "/Products",
    AuthEndPoint: "/AuthenticateCustomer",


    GetCategoriesEndPoint: function () {
        return this.ServiceRoot + this.CategoriesEndPoint;
    },

    GetProductsEndPoint: function () {
        return this.ServiceRoot + this.ProductsEndPoint;
    },

    GetAuthenticationEndPoint: function () {
        return this.ServiceRoot + this.AuthEndPoint;
    }


};

//method accepts direct callback function as parameter (not just the callback function name)
//to demonstrate $.getJSON with jsonp
ProdLineProvider.Lists.GetCategoriesListWithCallback = function (callbackFn, options) {
    var mergedOptions = $.extend(ProdLineProvider.defaultOptions, options);
    $.getJSON(mergedOptions.GetCategoriesEndPoint() + "?callback=?", callbackFn);
};

//method accepts callback function name as parameter (not a direct function) 
//to demonstrate $.ajax with jsonp 
ProdLineProvider.Lists.GetProductsListWithCallback = function (categoryId, callbackFnName, options) {
    var mergedOptions = $.extend(ProdLineProvider.defaultOptions, options);
    var endPoint = mergedOptions.GetCategoriesEndPoint() + "/" + categoryId + "/Products?callback=?";

    $.ajax({
        url: endPoint,
        dataType: "jsonp",
        contentType: "application/json",
        cache: false,
        async: false,
        jsonp: "callback",
        jsonpCallback: callbackFnName
    })
        .fail(function (err) {
            alert("ERROR:" + err.responseText);
        });
};


//method accepts callback function as parameter (not function name) 
//to demonstrate $.ajax with jsonp 
ProdLineProvider.Customer.SignInWithCallback = function (userName, password, callbackFn, options) {
    var encString = $.base64.encode(userName + ":" + password);
    var mergedOptions = $.extend(ProdLineProvider.defaultOptions, options);
    $.ajax({
        url: mergedOptions.GetAuthenticationEndPoint() + "?auth=" + encString + "&callback=?",
        //url: "http://" + userName + ":" + password + "@localhost:2269/ProductLine.svc/AuthenticateCustomer?callback=?",
        dataType: "jsonp",
        contentType: "application/json",
        cache: false,
        async: false,
        jsonp: "callback",
        success: callbackFn
    });
};


//demonstrates sync execution of ajax requests in a function (and with no callback passing to it)
//will return "promise" object
ProdLineProvider.Category.GetCategoryInfo = function (categoryId, options) {
    var x = new $.Deferred();

    var mergedOptions = $.extend(ProdLineProvider.defaultOptions, options);
    var endPoint = mergedOptions.GetCategoriesEndPoint() + "/" + categoryId + "?callback=?";

    var result;
    $.when(
        $.ajax({
            url: endPoint,
            dataType: "jsonp",
            contentType: "application/json",
            cache: false,
            async: false,
            jsonp: "callback"
        })
            .done(function (data) {
                result = data;
            })
            .fail(function (err) {
                alert("ERROR:" + err.responseText);
            })
    ).then(function () {
        x.resolve(result);
    });

    return x.promise();
};


ProdLineProvider.Product.GetProductInfoWithCallback = function (productId, callbackFn, options) {
    var mergedOptions = $.extend(ProdLineProvider.defaultOptions, options);
    $.getJSON(mergedOptions.GetProductsEndPoint() + "/" + productId + "?callback=?", callbackFn);
};

