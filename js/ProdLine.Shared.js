var ProdLine = ProdLine || {};

ProdLine.Shared = {};

function ClassUser() {
    var key = "ctxt";

    this.CustomerId = null;
    this.UserName = null;
    this.Password = null;

    var tPassword = null; //will live as long as the app is open in memory

    this.IsLoggedIn = function () {
        return this.UserName != null;
    };

    this.SetNewContext = function (customerId, userName, password) {
        this.CustomerId = customerId;
        this.UserName = userName;
        tPassword = password;
        localStorage.setItem(key, JSON.stringify(this));
    };

    this.SetPasswordForSession = function (password) {
        tPassword = password;
    };

    this.PersistSecurityInfoOnDevice = function () {
        this.Password = tPassword;
        localStorage.setItem(key, JSON.stringify(this));
    };

    this.IsSessionSecured = function () {
        return (tPassword != null && tPassword.length > 0);
    };

    this.GetBasicAuthenticationCredentials = function () {
        return ProdLine.Utils.GetBase64EncodedString(this.UserName + ":" + tPassword);
    };

    var init = function (o) {
        var lo = JSON.parse(localStorage.getItem(key));
        if (lo != null) {
            o.CustomerId = lo.CustomerId;
            o.UserName = lo.UserName;
            o.Password = lo.Password;
            o.SetPasswordForSession(o.Password);
        }
    };

    init(this);
}

//load user context
ProdLine.Shared.ContextUser = new ClassUser();

//ProdLine.Shared.AddMyProfileLinkClickHandler = function (lnkId) {
//    var lnk = $(lnkId, $.mobile.activePage[0]);

//    lnk.off("click"); //remove if available
//    lnk.on('click', function () {

//        if (ProdLine.Shared.ContextUser.IsLoggedIn()) {
//            $.mobile.changePage(this.href, {
//                reloadPage: true,
//                type: 'get'
//            });
//        } else {
//            //$.mobile.changePage('LoginPopup.htm', {
//            //   transition: 'pop',
//            //   role: 'dialog',
//            //   reloadPage: true
//            //});

//            $.mobile.changePage('Login.htm', {
//                role: 'dialog',
//                reloadPage: true
//            });
//        }

//        return false;
//    });
//};