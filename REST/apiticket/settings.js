var _AppSettings=function(){
  var process=function(){
    var appSett={}
    iwebz.app_settings=iwebz.app_settings||[]
    for(var i=0;i<iwebz.app_settings.length;i++)
      appSett[iwebz.app_settings[i]]=iwebz[iwebz.app_settings[i]];
//    return JSON.stringify(appSett);
    return '{"status":"success","msg":"","error":"","appSettings":'+JSON.stringify(appSett)+'}'; 
  }
  
  return {"process":process};
}