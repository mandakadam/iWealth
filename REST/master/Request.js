var _masteradd=master_add();
var _mastermodify=master_modify();
var _masterdelete=master_delete();
var _masterauthorise=master_authorise();
var _masterunauthorise=master_unauthorise();

iServiceManager.registerServiceRequest("masteradd",_masteradd);
iServiceManager.registerServiceRequest("mastermodify",_mastermodify);
iServiceManager.registerServiceRequest("masterdelete",_masterdelete);
iServiceManager.registerServiceRequest("masterauthorise",_masterauthorise);
iServiceManager.registerServiceRequest("masterunauthorise",_masterunauthorise);