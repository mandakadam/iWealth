var _usertoken = _getUserCToken();
var _userwebticket = _generateUserWebTicket();
var _validatewebticket = validateWebTicket();
var _userlogout = onUserLogOut();
var _forgotpass = _onForgotPassword();
iServiceManager.registerServiceRequest("generatetoken", _usertoken);
iServiceManager.registerServiceRequest("generatewebticket", _userwebticket);
iServiceManager.registerServiceRequest("validatewebticket", _validatewebticket);
iServiceManager.registerServiceRequest("userlogout", _userlogout);
iServiceManager.registerServiceRequest("forgotpassword", _forgotpass);

var _appSettings=_AppSettings();
iServiceManager.registerServiceRequest("_app_settings",_appSettings);