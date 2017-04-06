var _dataset=function(){
  var modulelist={}
  var holding={}
  var rmdata={}
  var userprofile={}
  var useraccount={}
  var usersettings={}
  var tradecurrency={}
  var tradesecurity={}
  var passwordparameter={}
  var riskprofile={riskQst:{},riskAns:{},riskdefn:{},modeldefn:{}}
  var newsfeed={}
  var userwatchlist={}
  var tradelist={}
  var watchlist={}
   
  //get Module list
  modulelist.process=function(){
    var vsql="SELECT viewid,viewname,image_path,onload,REPLACE(VIEWNAME,' ','') route,paramhtml FROM iwz_viewmaster order by seq";
    vsql=SQLStore(vsql);
    return '{"status":"success","msg":"","error":"","modules":'+vsql+'}';
  }
  
  
  //get total client  holding 
  holding.process=function(req,res,userObj)
  {
  
    
    var client_id,response,postMessage,eventtype;
    var JsonObj;
    var JString={};
    var vSQL="SELECT client_id FROM iwz_user_master WHERE user_id='"+ _encode(userObj.user_id)+"'"
    vSQL=SQLResultset(vSQL);  
    if(vSQL.recordcount!=0)
    {
      JString.client_id=vSQL.data[vSQL.recordno][vSQL.client_id]
      JString.email_id=userObj.user_id
      JString=JSON.stringify(JString);
      eventtype="iService.getMTMPostion";
      postMessage ='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.webz/"><soapenv:Header/><soapenv:Body><ser:transaction><arg0>'+eventtype+'</arg0><arg1>'+JString+'</arg1></ser:transaction></soapenv:Body></soapenv:Envelope>';
      response=iwebz.callWebServiceV1({postMessage:postMessage,eventtype:eventtype,secured:false,auth:false});
      if(response.status=="unsuccess")
        return '{"status":"unsuccess","msg":"","error":"'+response.error+'"}';
      JsonObj=response.jsonobj["soap:Envelope"]["soap:Body"]["ns2:transactionResponse"]["return"];                
    }      
    return JsonObj; 
  }
  
  //Get the RM Detaild
  rmdata.process=function(req,res,userObj)
  {
    var vSQL="SELECT rd.rm_id,name, personal_no, office_no, mail FROM if_rm_details rd,if_user_rm_map urm WHERE rd.rm_id=urm.rm_id AND user_id='"+ _encode(userObj.user_id)+"'"
    vSQL=SQLStore(vSQL);
    return vSQL; 
  }
  
  userprofile.process=function(req,res,userObj)
  {
    var vSQL="SELECT user_id,user_name,profile_id,address,email_id,dob,mobile_no FROM iwz_user_master where 1=1 AND user_id='"+ _encode(userObj.user_id)+"'"
    vSQL=SQLStore(vSQL);

    vSQL=eval('('+vSQL+')')
    if(vSQL.status && vSQL.status=="unsuccess")
      return '{"status":"unsuccess","msg":"","error":"Error while retrieving user master."}';
    else
      return '{"status":"success","msg":"","error":"","vdata":'+JSON.stringify(vSQL.data)+'}';      
  }

  useraccount.process=function(req,res,userObj)
  {
    var whereClause=""
    var asset_class=req.getParameter('asset_class');
    var vSQL="SELECT accountno code ,accountno||' ['||acct_name||'-'||sub_ac_name ||']' name FROM if_user_accounts WHERE client_id ='"+ _encode(userObj.user_id)+"'";
    if(asset_class=="MF")
      whereClause=" and  ACCT_TYPE IN ('UNTH')"
    else
      whereClause=" and ACCT_TYPE IN ('PDIS','PNDS')"
    vSQL=vSQL+" "+whereClause+" ORDER BY accountno"    
    
    vSQL=SQLStore(vSQL)
    return vSQL;
  }
  
  usersettings.process=function(req,res,userObj)
  {
    var vArr=[]
    var vSQL="SELECT al.alertid,Nvl(subscribe,'N') subscribe FROM  (SELECT * FROM iwz_usernotification WHERE user_id='"+userObj.user_id+"')un,iwz_alerts al WHERE al.alertid= un.alertid(+)"
    vSQL=SQLStore(vSQL)
    vSQL=eval('('+vSQL+')')
    if(vSQL.status && vSQL.status=="unsuccess")
      return '{"status":"unsuccess","msg":"","error":"Error while retrieving alerts."}';
    else
      return '{"status":"success","msg":"","error":"","vdata":'+JSON.stringify(vSQL.data)+'}';  
  }

  tradecurrency.process=function(){
    var vSQL="SELECT currency_code code , currency_code name FROM if_currency_master order by currency_code";
    vSQL=SQLStore(vSQL);
    return vSQL;     
  }
  passwordparameter.process=function(){
    var vArr=[]
    var vSQL="SELECT paramname,paramvalue FROM iwz_parameter WHERE paramname IN ('shouldcontain1lowcaselet','checkconsecutivechar','checkdateexist','allowsspecialchr','bshouldalphanumeric','bshouldcapitalize','checkpasswordhistory','limitlength','matchpassworduserid','maxpasswordlength','minpasswordlength','passwordhistorycount','minpasswordlength')";
    vSQL=SQLResultset(vSQL);
    for(var i=0;i<vSQL.recordcount;i++)
    {
      vSQL.recordno=i
      vArr[vArr.length]="\""+vSQL.data[vSQL.recordno][vSQL.paramname]+"\":" +"\""+(vSQL.data[vSQL.recordno][vSQL.paramvalue])+"\""    
    }
    return "{"+vArr.join(",")+"}";
     
  }
   tradesecurity.process=function(request){
    var assetclass=request.getParameter("assetclass")
    var vSQL="SELECT securitycode code,securityname name FROM if_security_master where assetclass='"+assetclass+"' order by securitycode";  
    vSQL=SQLStore(vSQL);
    return vSQL;     
  }
  
  riskprofile.riskQst.process=function(){
    var vSQL="SELECT option_id, risk_id, option_name, category_id, deleted, ordno, multi_select FROM if_risk_option_master where risk_id='35' ORDER BY ordno "
    vSQL=SQLStore(vSQL);
    return '{"status":"success","msg":"","error":"","vdata":'+vSQL+'}';    
  }
  
  riskprofile.riskAns.process=function(){
    var vSQL="SELECT value_name, weight, option_id, srno, is_others FROM if_risk_optionans_master ORDER BY option_id,is_others "
    vSQL=SQLStore(vSQL);
    return '{"status":"success","msg":"","error":"","vdata":'+vSQL+'}';
  }

  riskprofile.riskdefn.process=function(){
    var vSQL="SELECT riskprofile_name, weight_min, weight_max FROM if_riskprofile_master "
    vSQL=SQLStore(vSQL);
    return '{"status":"success","msg":"","error":"","vdata":'+vSQL+'}';
  }
  
  riskprofile.modeldefn.process=function(req){
    var vSQL="SELECT * FROM if_model_portfolio WHERE PRODUCT_NAME='"+req.getParameter('riskprofile')+"'"
    
    vSQL=SQLStore(vSQL);

    return '{"status":"success","msg":"","error":"","vdata":'+vSQL+'}';
  }
  
  newsfeed.process=function(){   
  
    return '{"status":"success","msg":"","error":"","vdata":'+getFileText(serverPath+"/REST/newsfeed/newsfeed.cfg")+'}';        
  }
  userwatchlist.process=function(){   
  
    return '{"status":"success","msg":"","error":"","vdata":'+getFileText(serverPath+"/app/js/watchlist/watchlist.json")+'}';        
  }
  tradelist.process=function()
  {   
    var client_id,response,postMessage,eventtype;
    var JsonObj;
    var JString={};
    var vSQL="SELECT client_id FROM iwz_user_master WHERE user_id='"+ _encode(userObj.user_id)+"'"
    vSQL=SQLResultset(vSQL);  
    if(vSQL.recordcount!=0)
    {
      JString.client_id=vSQL.data[vSQL.recordno][vSQL.client_id]
      JString.email_id=userObj.user_id
      JString=JSON.stringify(JString);
      eventtype="iService.getTradeList";
      postMessage ='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.webz/"><soapenv:Header/><soapenv:Body><ser:transaction><arg0>'+eventtype+'</arg0><arg1>'+JString+'</arg1></ser:transaction></soapenv:Body></soapenv:Envelope>';
      response=iwebz.callWebServiceV1({postMessage:postMessage,eventtype:eventtype,secured:false,auth:false});
      if(response.status=="unsuccess")
        return '{"status":"unsuccess","msg":"","error":"'+response.error+'"}';
      JsonObj=response.jsonobj["soap:Envelope"]["soap:Body"]["ns2:transactionResponse"]["return"];                
    }      

return '{"status":"success","msg":"","error":"","vdata":'+JsonObj+'}';        
//    return '{"status":"success","msg":"","error":"","vdata":'+getFileText(serverPath+"/app/js/tradelist/tradelist.json")+'}';        

  }
   watchlist.process=function(){   
  
    return '{"status":"success","msg":"","error":"","vdata":'+getFileText(serverPath+"/app/js/watchlist/addWatchlist.json")+'}';        
  }
  //Dataset list  
  return {
    "modulelist":modulelist,
    "getAllHolding":holding,
    "getRMData":rmdata,
    "getUserProfile":userprofile,
    "getUserAccounts":useraccount,
    "getUserSettings":usersettings,
    "tradecurrency":tradecurrency,
    "getpasswordparameter":passwordparameter,
    "tradesecurity":tradesecurity,
    "RiskQuestion":riskprofile.riskQst,
    "RiskAnswers":riskprofile.riskAns,
    "RiskDefn":riskprofile.riskdefn,
    "ModelDefn":riskprofile.modeldefn,
    "newsfeed":newsfeed,
    "userwatchlist":userwatchlist,
    "tradelist":tradelist,
    "watchlist":watchlist
  }
 
}
