var Globals = {};  //namespace

Globals.$CurrentPage = {}; //sub-namespace

function UserSession() {
    this.UserName = "";
    this.IsLoggedIn = false;
}

Globals.CurrentSession = new UserSession();

Globals.AddMyProfileLinkClickHandler = function (lnkId) {
    var lnk = $(lnkId, Globals.$CurrentPage[0]);
    
    lnk.off("click"); //remove if available
    lnk.on('click', function () {

        if (Globals.CurrentSession.IsLoggedIn) {
            $.mobile.changePage(this.href, {
                reloadPage: true,
                type: 'get'
            });
        } else {
            $.mobile.changePage('login.htm', {
                transition: 'pop', 
                role: 'dialog',
                reloadPage: true
            }); 
        }

        return false;
    });
};