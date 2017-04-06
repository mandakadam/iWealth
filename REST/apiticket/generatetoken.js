var _getUserCToken = function() {
    return {
        process: function(request, response) {
            try {

                var _esapiutils = Java.type('custom.classes.EsapiUtils');
                var es = new _esapiutils();
                log.debug("CToken is " + es.getCtokenString());
                return '{"status":"success","msg":"","error":"","token":"'+es.getCtokenString()+'"}';

            } catch (e) {
                log.error("Exception in generating user token." + e.toString());
                return '{"status":"unsuccess","msg":"","error":"Error while generating token"}';
            }
        }
    }
}
