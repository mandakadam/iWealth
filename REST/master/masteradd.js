var master_add=function(){
    return {
      process: function(request,response,userObj){
        return onServerAdd(request.getParameter('data'));
      }
    }
}