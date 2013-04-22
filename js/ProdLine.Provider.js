/// <reference path="jquery-1.8.2.js" />

var ProdLine = ProdLine || {};

ProdLine.Provider = {};
ProdLine.Provider.Lists = {};
ProdLine.Provider.Customer = {};
ProdLine.Provider.Product = {};
ProdLine.Provider.Category = {};

ProdLine.Provider.defaultOptions = {
    //constants
    //ServiceRoot: "http://localhost:2269/ProductLine.svc",
    ServiceRoot: "http://productline.dotnetcodecentral.com/ProductLine.svc",
    CategoriesEndPoint: "/Categories",
    ProductsEndPoint: "/Products",
    AuthEndPoint: "/Customer/Authenticate",
    RegisterEndPoint: "/Customer/Register",
    RegistrationInfoEndPoint: "/Customer/RegistrationInfo",
    ContactInfoEndPoint: "/Customer/ContactInfo",
    PaymentInfoEndPoint: "/Customer/PaymentInfo",
    OrdersInfoEndPoint: "/Customer/Orders",
    OrderCreateEndPoint: "/Order/Create",

    GetCategoriesEndPoint: function () {
        return this.ServiceRoot + this.CategoriesEndPoint;
    },

    GetProductsEndPoint: function () {
        return this.ServiceRoot + this.ProductsEndPoint;
    },

    GetAuthenticationEndPoint: function () {
        return this.ServiceRoot + this.AuthEndPoint;
    },

    GetRegistrationEndPoint: function () {
        return this.ServiceRoot + this.RegisterEndPoint;
    },

    GetRegistrationInfoEndPoint: function () {
        return this.ServiceRoot + this.RegistrationInfoEndPoint;
    },

    GetContactInfoEndPoint: function () {
        return this.ServiceRoot + this.ContactInfoEndPoint;
    },

    GetPaymentInfoEndPoint: function () {
        return this.ServiceRoot + this.PaymentInfoEndPoint;
    },

    GetUpdateRegInfoEndPoint: function () {
        return this.ServiceRoot + this.RegistrationInfoEndPoint;
    },

    GetUpdateContactInfoEndPoint: function () {
        return this.ServiceRoot + this.ContactInfoEndPoint;
    },

    GetUpdatePaymentInfoEndPoint: function () {
        return this.ServiceRoot + this.PaymentInfoEndPoint;
    },

    GetOrderCreateEndPoint: function () {
        return this.ServiceRoot + this.OrderCreateEndPoint;
    },

    GetOrdersInfoEndPoint: function () {
        return this.ServiceRoot + this.OrdersInfoEndPoint;
    }

};

//method accepts direct callback function as parameter (not just the callback function name)
//to demonstrate $.getJSON with jsonp
ProdLine.Provider.Lists.GetCategoriesListWithCallback = function (callbackFn, options) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    $.getJSON(mergedOptions.GetCategoriesEndPoint() + "?callback=?", callbackFn);
};

//method accepts callback function name as parameter (not a direct function) 
//to demonstrate $.ajax with jsonp
ProdLine.Provider.Lists.GetProductsListWithCallback = function (categoryId, callbackFnName, options) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
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
ProdLine.Provider.Customer.SignInWithCallback = function (userName, password, callbackFn, options) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    $.ajax({
        url: mergedOptions.GetAuthenticationEndPoint() + "?auth=" + ProdLine.Utils.GetBase64EncodedString(userName + ":" + password) + "&callback=?",
        dataType: "jsonp",
        contentType: "application/json",
        cache: false,
        async: false,
        jsonp: "callback",
        //success: callbackFn //or
        success: function (result) {
            result = JSON.parse(result);
            if (result == true) {
                $.when(ProdLine.Provider.Customer.GetRegInfo(null, userName, password)).done(function (data) {
                    if (data.CustomerId) {
                        ProdLine.Shared.ContextUser.SetNewContext(data.CustomerId, userName, password);
                        callbackFn(result);
                    }
                });
            } else {
                callbackFn(result);
            }
        }
    });
};


//demonstrates sync execution of ajax requests in a function (and with no callback passing to it)
//will return "promise" object
ProdLine.Provider.Category.GetCategoryInfo = function (categoryId, options) {
    var x = new $.Deferred();

    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
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

ProdLine.Provider.Product.GetProductInfoWithCallback = function (productId, callbackFn, options) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    $.getJSON(mergedOptions.GetProductsEndPoint() + "/" + productId + "?callback=?", callbackFn);
};

//not a JSONP call (have to enable cross-domain acceptance) as it is POST operation
ProdLine.Provider.Customer.RegisterWithCallback = function (firstName, lastName, email, password, callbackFn, options) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    $.ajax({
        url: mergedOptions.GetRegistrationEndPoint(),
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify({
            "FirstName": firstName,
            "LastName": lastName,
            "Email": email,
            "Password": password
        }),
        processdata: false,
        cache: false,
        async: false,
        success: function (result) {
            result = JSON.parse(result);
            if (result == true) {
                $.when(ProdLine.Provider.Customer.GetRegInfo(null, email, password)).done(function (data) {
                    if (data.CustomerId) {
                        ProdLine.Shared.ContextUser.SetNewContext(data.CustomerId, email, password);
                        callbackFn(result);
                    }
                });
            } else {
                callbackFn(result);
            }
        }
    });
};

//not a JSONP call (have to enable cross-domain acceptance) as it is PUT operation
ProdLine.Provider.Customer.UpdateRegInfoWithCallback = function (oRegInfo, callbackFn, userName, password, options) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    var sUrl;
    if (userName && password) {
        sUrl = mergedOptions.GetUpdateRegInfoEndPoint() + "?auth=" + ProdLine.Utils.GetBase64EncodedString(userName + ":" + password);
    } else {
        sUrl = mergedOptions.GetUpdateRegInfoEndPoint() + "?auth=" + ProdLine.Shared.ContextUser.GetBasicAuthenticationCredentials();
    }
    $.ajax({
        url: sUrl,
        contentType: "application/json",
        type: "PUT",
        data: JSON.stringify(oRegInfo),
        processdata: false,
        cache: false,
        async: false,
        success: function (result) {
            result = JSON.parse(result);
            if (oRegInfo.Password && oRegInfo.Password != "" && result == true) {
                ProdLine.Shared.ContextUser.SetPasswordForSession(oRegInfo.Password);
            }
            callbackFn(result);
        },
        error: function () {
            callbackFn(false);
        }
    });
};

//not a JSONP call (have to enable cross-domain acceptance) as it is PUT operation
ProdLine.Provider.Customer.UpdateContactInfoWithCallback = function (oContactInfo, callbackFn, userName, password, options) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    var sUrl;
    if (userName && password) {
        sUrl = mergedOptions.GetUpdateContactInfoEndPoint() + "?auth=" + ProdLine.Utils.GetBase64EncodedString(userName + ":" + password);
    } else {
        sUrl = mergedOptions.GetUpdateContactInfoEndPoint() + "?auth=" + ProdLine.Shared.ContextUser.GetBasicAuthenticationCredentials();
    }
    $.ajax({
        url: sUrl,
        contentType: "application/json",
        type: "PUT",
        data: JSON.stringify(oContactInfo),
        processdata: false,
        cache: false,
        async: false,
        success: function (result) {
            result = JSON.parse(result);
            callbackFn(result);
        },
        error: function () {
            callbackFn(false);
        }
    });
};

//not a JSONP call (have to enable cross-domain acceptance) as it is PUT operation
ProdLine.Provider.Customer.UpdatePaymentInfoWithCallback = function (oPaymentInfo, callbackFn, userName, password, options) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    var sUrl;
    if (userName && password) {
        sUrl = mergedOptions.GetUpdatePaymentInfoEndPoint() + "?auth=" + ProdLine.Utils.GetBase64EncodedString(userName + ":" + password);
    } else {
        sUrl = mergedOptions.GetUpdatePaymentInfoEndPoint() + "?auth=" + ProdLine.Shared.ContextUser.GetBasicAuthenticationCredentials();
    }
    $.ajax({
        url: sUrl,
        contentType: "application/json",
        type: "PUT",
        data: JSON.stringify(oPaymentInfo),
        processdata: false,
        cache: false,
        async: false,
        success: function (result) {
            result = JSON.parse(result);
            callbackFn(result);
        },
        error: function () {
            callbackFn(false);
        }
    });
};

ProdLine.Provider.Customer.GetRegInfo = function (options, userName, password) {
    var x = new $.Deferred();
    var result;

    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    var sUrl;
    if (userName && password) {
        sUrl = mergedOptions.GetRegistrationInfoEndPoint() + "?auth=" + ProdLine.Utils.GetBase64EncodedString(userName + ":" + password) + "&callback=?";
    } else {
        sUrl = mergedOptions.GetRegistrationInfoEndPoint() + "?auth=" + ProdLine.Shared.ContextUser.GetBasicAuthenticationCredentials() + "&callback=?";
    }
    $.when(
        $.ajax({
            url: sUrl,
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

ProdLine.Provider.Customer.GetContactInfo = function (options, userName, password) {
    var x = new $.Deferred();
    var result;

    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    var sUrl;
    if (userName && password) {
        sUrl = mergedOptions.GetContactInfoEndPoint() + "?auth=" + ProdLine.Utils.GetBase64EncodedString(userName + ":" + password) + "&callback=?";
    } else {
        sUrl = mergedOptions.GetContactInfoEndPoint() + "?auth=" + ProdLine.Shared.ContextUser.GetBasicAuthenticationCredentials() + "&callback=?";
    }
    $.when(
        $.ajax({
            url: sUrl,
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

ProdLine.Provider.Customer.GetPaymentInfoWithCallback = function (callbackFn, options, userName, password) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    var sUrl;
    if (userName && password) {
        sUrl = mergedOptions.GetPaymentInfoEndPoint() + "?auth=" + ProdLine.Utils.GetBase64EncodedString(userName + ":" + password) + "&callback=?";
    } else {
        sUrl = mergedOptions.GetPaymentInfoEndPoint() + "?auth=" + ProdLine.Shared.ContextUser.GetBasicAuthenticationCredentials() + "&callback=?";
    }

    $.getJSON(sUrl, callbackFn);
};

//not a JSONP call (have to enable cross-domain acceptance) as it is POST operation
ProdLine.Provider.Customer.CreateOrderWithCallback = function (productId, qty, price, cc3DigitCode, callbackFn, userName, password, options) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    var sUrl;
    if (userName && password) {
        sUrl = mergedOptions.GetOrderCreateEndPoint() + "?auth=" + ProdLine.Utils.GetBase64EncodedString(userName + ":" + password);
    } else {
        sUrl = mergedOptions.GetOrderCreateEndPoint() + "?auth=" + ProdLine.Shared.ContextUser.GetBasicAuthenticationCredentials();
    }
    $.ajax({
        url: sUrl,
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify({
            "ProductId": productId,
            "Qty": qty,
            "UnitPrice": price,
            "CC3digitCode": cc3DigitCode
        }),
        processdata: false,
        cache: false,
        async: false,
        success: function (result) {
            result = JSON.parse(result);
            callbackFn(result);
        }
    });
};

ProdLine.Provider.Customer.GetMyOrdersWithCallback = function (callbackFn, options, userName, password) {
    var mergedOptions = $.extend(ProdLine.Provider.defaultOptions, options);
    var sUrl;
    if (userName && password) {
        sUrl = mergedOptions.GetOrdersInfoEndPoint() + "?auth=" + ProdLine.Utils.GetBase64EncodedString(userName + ":" + password) + "&callback=?";
    } else {
        sUrl = mergedOptions.GetOrdersInfoEndPoint() + "?auth=" + ProdLine.Shared.ContextUser.GetBasicAuthenticationCredentials() + "&callback=?";
    }

    $.getJSON(sUrl, callbackFn);
};
