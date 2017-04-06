var _useradmin=function()
{		
	var onupdateuserprofile={}
	onupdateuserprofile.process=function(request,res,userObj){
		var vSQL=[],vQry="",JString={},response="";
   var jsondata  =request.getParameter("odata")
   // if(!jsondata)
   //  return '{"status":"unsuccess","error":"Insufficent data.","msg":""}'
   try
   {
        jsondata =eval('('+jsondata +')');
   }
   catch(error)
   {
    return '{"status":"unsuccess","msg":"","error":"Error while updating user master."}';
   }
   JString=jsondata;   
   JString.fieldnames=["user_id","address","dob","mobile_no"]  
   JString.user_id=userObj.user_id
 
  response=modifyRecord("iwz_user_master", JString,"modify")
  
   log.info("User Profile Response :  "+response)
   
   try
   {
    response=eval('('+response+')')
   }
   catch(error)
   {
    return '{"status":"unsuccess","msg":"","error":"Error while updating the user master."}';
   }
    if(response.status=="success")
    {
      return '{"status":"success","error":"","msg":""}'
    }
    else
    {
      log.error("Error while updating the user master."+response.error);
      return '{"status":"unsuccess","msg":"","error":"Error while updating the user master"}';
    }
	//return 'jhjkh'
	}
	 return {
    "onupdateuserprofile":onupdateuserprofile
   
  }
}