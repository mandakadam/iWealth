var master_delete=function(){
    return {
      process: function(request,response,userObj){
		return onServerDelete(request.getParameter('data'));
      }
    }
}