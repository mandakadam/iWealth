var _globalSettings=function(){
  
  var _settings={}
  _settings.changePassword={}
  _settings.updateUserSettings={}

  _settings.changePassword.process=function(req,res,userObj)
  {
  }
  _settings.updateUserSettings.process=function(request,response,userObj)
  {
   var vSQL=[],vQry="",JString={},response="",alertid,subscribe
   var jsondata  =request.getParameter("odata")
   try
   {
        jsondata =eval('('+jsondata +')');
   }
   catch(error)
   {
    return '{"status":"unsuccess","msg":"","error":"Error while updating alerts"}';
   }
   JString=jsondata;
   JString.fieldnames=["user_id","alertid","subscribe"]
   JString.user_id=userObj.user_id
//    JString.alertid=alertid
//    JString.subscribe=subscribe
   
   vQry="SELECT 1 FROM iwz_usernotification WHERE user_id='"+userObj.user_id+"' AND ALERTID='"+JString.alertid+"'"
   vQry=SQLResultset(vQry);
   if(vQry.recordcount==0)
      response=getInsertData(JString,"iwz_usernotification")   
   else
      response=modifyRecord("iwz_usernotification", JString,"modify")
  
   log.debug("Notification Response :  "+response)
   
   try
   {
    response=eval('('+response+')')
   }
   catch(error)
   {
    return '{"status":"unsuccess","msg":"","error":"Error while updating the alert."}';
   }
    if(response.status=="success")
    {
      return '{"status":"success","error":"","msg":""}'
    }
    else
    {
      log.error("Error while updating the alert."+response.error);
      return '{"status":"unsuccess","msg":"","error":"Error while updating the alert"}';
    }
  }

  return {
    "changePassword":_settings.changePassword,
    "updateUserSettings":_settings.updateUserSettings
  }
}