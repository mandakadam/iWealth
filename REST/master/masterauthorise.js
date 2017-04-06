var master_authorise=function(){
    return {
      process: function(request,response,userObj){
		dlog("in master_authorise");
		return onMasterAuth(request.getParameter('data'));
      }
    }
}