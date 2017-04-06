var iServiceManager = (function() {

    var servicerequest = {}

//     var process = function() {
//         var requestname = "";
//         var resp = "";
//         var _ticket = "";
//         var urlObj=parseURL();
//         var servicename=urlObj.service;
//         var requestname=urlObj.request;
//         var _action=urlObj.action;
//         
//         log.debug("Process service " + servicename + "/" + requestname)
//         try {
//             if (!servicerequest[servicename]) {
//                 log.error("Service " + servicename + " not defined");
//                 return '{"status":"unsuccess","msg":"","error":"Service ' + servicename + "/" + requestname + ' not defined."}';
//             }
//             if (!servicerequest[servicename][requestname]) {
//                 log.error("Request " + requestname + " not defined");
//                 return '{"status":"unsuccess","msg":"","error":"Request ' + requestname + "/" + requestname + ' not defined."}';
//             }
// 
//             if (servicename != "apiticket") {
//                 _ticket = request.getParameter("_ticket");
//                 log.debug("_ticket is " + _ticket);
//                 // var result = validateWebTicket( _ticket );
// 
//                 var result = servicerequest["apiticket"]["validatewebticket"].process(request, response);
//                 if (result.status == "unsuccess") {
//                     log.error("" + result.error)
//                     response.setStatus(401);
//                     return '{"status":"unsuccess","msg":"","error":"' + result.error + '","errorcode":"401"}';
//                 }
//                 resp = servicerequest[servicename][requestname].process(request, response, result.userObj);
//             } else
//                 resp = servicerequest[servicename][requestname].process(request, response);
//         } catch (error) {
//             log.error("Error while processing service/request " + servicename + "/" + requestname + ".Error : " + error);
//             return '{"status":"unsuccess","msg":"","error":"Error while processing servce/request ' + servicename + "/" + requestname + '",errorcode:"200"}';
//         }
//         return resp;
//     };
//     
//     var parseURL=function(){
//         var requestname="",servicename="",_action="";
//         var path = request.getRequestURL().toString();
//         path = path.substr(path.indexOf('/REST/') + 6);
//         _action=path.substr(0, path.indexOf('/'));
//         path = path.substr(path.indexOf('/') + 1);
//         servicename = path.substr(0, path.indexOf('/'));
//         if(path.indexOf('/', path.indexOf('/') + 1) != -1)
//             requestname = path.substring(path.indexOf('/') + 1, path.indexOf('/', path.indexOf('/') + 1));
//         else
//             requestname = path.substr(path.indexOf('/') + 1);
//             
//        return {"status":"success","msg":"","error":"","service":servicename,"request":requestname,"action":_action};     
//     }
    
    var loadService = function(name, path) {
        log.debug("Load service " + name + ":" + path)
        serviceFiles.put(name, path);
    }

    var registerServiceRequest = function(name, ref) {
        log.debug("Register service " + this._curr_service + "/" + name)
        servicerequest[this._curr_service] = servicerequest[this._curr_service] || {}
        servicerequest[this._curr_service][name] = ref;
    }

    return {
        process: process,
        loadService: loadService,
        registerServiceRequest: registerServiceRequest
    };
})();
