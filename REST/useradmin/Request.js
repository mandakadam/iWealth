var _changepassword = _changeUserPassword();
var _passwordconfig = _fetchPasswordConfig();
var _useradminobj = _useradmin();
iServiceManager.registerServiceRequest("changepassword", _changepassword);
iServiceManager.registerServiceRequest("fetchpasswordconfig", _passwordconfig);
iServiceManager.registerServiceRequest("onupdateuserprofile", _useradminobj.onupdateuserprofile);

