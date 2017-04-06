var _trade=function(){
  
  var _request={}
  _request.process=function(request,res){
    var response=""
    var JString={}
    var JString=request.getParameter("jsondata");
    if(!JString)
    {
      log.error("No transaction request data found.");
      return '{"status":"unsuccess","msg":"","error":"Insufficient data."}';
    } 
    try
    {
      JString = eval('('+JString+')')
    }
    catch(error)
    {
      log.error("Error while processing request: "+error+".JString : "+JString);
      return '{"status":"unsuccess","msg":"","error":"Error while processing request."}';
    }

    JString.fieldnames=["req_id","user_id","accountid","trans_type","security","assetclass","amount","quantity","price","ordertype"];
    JString.req_id=""
    JString.user_id=userObj.user_id
    JString.price=JString.price||""
    JString.ordertype=JString.ordertype||""
//    JString.entryon=getServerDate()
    response=getInsertData(JString,"if_transaction_req");
    
     try
   {
    response=eval('('+response+')')
   }
   catch(error)
   {
    return '{"status":"unsuccess","msg":"","error":"'+error+'"}';
   }
   if(response.status=="unsuccess")
    return '{"status":"unsuccess","msg":"","error":"'+response.error+'"}';
    
    JString.req_id=response.out.req_id

    if(JString.assetclass=="EQ" || JString.assetclass=="FIS")
    {
      
      JString.eqobj={"order_date":getServerDateTime(),"ordertime":"","ordervalidtill":"","assetclass":""+JString.assetclass,"transtype":""+JString.trans_type,"securitysymbol":""+JString.security,"justification":"","instruction":"","remarks":"","portfolio":""+JString.accountid,"radamount":"","amount":""+JString.amount,"radqty":"","quantity":"","ordertype":""+JString.ordertype,"pricelimit":""+JString.price,"poolbatch":"","custqty":"","preorder_id":"","pricefrom":"","priceto":"","yieldfrom":"","yieldto":"","sfin":"","foliono":"","tif":"","fd_product":"","fd_deposit_type":"","fd_daycount":"","fd_currency":"","fd_tenor":"","fd_is_frn":"","fd_roi":"","fd_interest_freq":"","fd_tax_status":"","mat_fd_product":"","mat_type":"","mat_addtnl_amt":""} 
      if(JString.amount=="")
        JString.eqobj.radqty="checked"
      else
        JString.eqobj.radamount="checked" 

    }   
    JString=JSON.stringify(JString)
    var eventtype="iService.saveTradeDetails";
    var postMessage ='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.webz/"><soapenv:Header/><soapenv:Body><ser:transaction><arg0>'+eventtype+'</arg0><arg1>'+JString+'</arg1></ser:transaction></soapenv:Body></soapenv:Envelope>';
    var response=iwebz.callWebServiceV1({postMessage:postMessage,eventtype:eventtype,secured:false,auth:false});
    if(response.status=="unsuccess")
      return '{"status":"unsuccess","msg":"","error":"'+response.error+'"}';
    var JsonObj=response.jsonobj["soap:Envelope"]["soap:Body"]["ns2:transactionResponse"]["return"];    
      try
   {
    JsonObj=eval('('+JsonObj+')')
   }
   catch(error)
   {
    return '{"status":"unsuccess","msg":"","error":"'+error+'"}';
   }
    if(JsonObj.status=="unsuccess")
      return '{"status":"unsuccess","msg":"","error":"'+JsonObj.error+'"}';    
    return '{"status":"success","msg":"'+JsonObj.msg+'","error":""}';
  }
  
  return  {
            "saveTransRequest":_request
          }
}