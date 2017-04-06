var master_modify=function(){
    return {
      process: function(request,response,userObj){
		return onServerModify(request.getParameter('data'));
      }
    }
}