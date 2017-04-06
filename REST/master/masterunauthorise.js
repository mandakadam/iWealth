var master_unauthorise=function(){
    return {
      process: function(request,response,userObj){
		dlog("in master_unauthorise");
		return onMasterUnAuth(request.getParameter('data'));
      }
    }
}