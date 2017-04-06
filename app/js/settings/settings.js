app._settings={};
app.instance.dv.SettingsView=null
/*
Model:PsswordParam
Desc:Used to fetch data from parameter table
Date:20-09-2016
Author:Trupti Gaikwad
*/
app.dm.PasswordParamModel=new (app.dm._generic(
{
  _reload:app._reload
  ,_service:"dataset"
  ,_methods:{
    read:"dataset/passwordparameter"
  }
}))

/*
View:SettingView
Desc:To get Settings.html page
Date:20-09-2016
Author:Trupti Gaikwad
*/
app.dv.SettingsView = Backbone.View.extend({   
  initialize: function(attrs) {
    var $this=this;      
    $.get(attrs.paramhtml, function(template){
      $this.settingpage=template;
      $this.render();
    });
  },        
  render: function() {     
    this.$el.html(this.settingpage)
    var $Ref=null,fieldname="",model=null,subscribe="";
    $('#frmAlert input[type=checkbox]').each(function (){
      $Ref=$(this)
      fieldname=$Ref.attr("fieldname");
      model=app.dc._usersettings.get(fieldname);
      if(model)
      {
        subscribe=model.get("subscribe")||"N";
        if(subscribe=="Y")
          $Ref.attr("checked",true);    
      }
    });
    return this;
  }
  ,events:{
     'click #frmsettings #btnchangepwd':'validatePwdComposition',
     'change #frmAlert input[type=checkbox]':'saveAlerts',
  },
  saveAlerts:function(ev){
    var $ref=$("#"+ev.currentTarget.id)
    var fieldname=$ref.attr("fieldname");
    var checked=($ref.is(":checked"))?"Y":"N"
    var model=app.dc._usersettings.get(fieldname);
    if(model)
    {
      model.set({"subscribe":checked});
      model.save({
       success:function(response){
               console.log(response)
       } 
      });   
    }
  },
  validatePwdComposition:function(){
    var oldpwd=$("#frmsettings #txtoldpwd").prop("value"); 
    var newpwd=$("#frmsettings #txtnewpwd").prop("value");  
    var pwd=$("#frmsettings #txtcnfrmpwd").prop("value");  
    var userid=app.getData("_user_id")
    var vobj=app._settings.validatePwd(pwd,newpwd,userid) 
    if(vobj.status=="unsuccess")
    {
       alert(vobj.error)
       return;
    }
    app._settings.updatePassword(oldpwd,pwd,newpwd,userid);
  }
});


/*
Function:app.onGetUserSettings
Desc:Create instance of SettingView and fetch passwordparam model
Date:20-09-2016
Author:Trupti Gaikwad
*/
app.onGetUserSettings=function(viewid,paramhtml)
{
   if(!app.instance.dv.SettingsView)
    app.instance.dv.SettingsView=new app.dv.SettingsView({el:"#maincontent",paramhtml:paramhtml})
   else
     app.instance.dv.SettingsView.render();     
  app.dm.PasswordParamModel.fetch();
}

/*
Function:app._settings.validatePwd
Desc:Validate Password
Date:20-09-2016
Author:Trupti Gaikwad
*/
app._settings.validatePwd=function(pwd,newpwd,userid)
{
  var response =app.validateJQForm(document.frmsettings)
  if(response.status=="unsuccess")
     return {status:"unsuccess",msg:"",error:response.error}; 
  var pwdParam=app.dm.PasswordParamModel.toJSON();
  var myMessage=[];
  var vSQL="";

  
  if(newpwd!=pwd)
    return {status:"unsuccess",msg:"",error:"New/confirm password mismatch."}; 
 
  for(key in pwdParam)
  {
    if(key=="bshouldalphanumeric" && pwdParam[key]=="true")
    {
      if(app._settings.checkIfAlphaNumeric(pwd)=="0")
        myMessage[myMessage.length]="Should be alphanumeric.";             
    }
     if(key=="limitlength")
    {
      if(pwdParam[key]=="true")
      {
        pwdParam.minpasswordlength=pwdParam.minpasswordlength ||5
        pwdParam.maxpasswordlength=pwdParam.maxpasswordlength ||20
        if(pwd.length <pwdParam.minpasswordlength ||pwd.length > pwdParam.maxpasswordlength)
          myMessage[myMessage.length]="Should have at least "+(pwdParam.minpasswordlength)+" alphanumeric characters and less than "+(pwdParam.maxpasswordlength)+" alphanumeric characters long.";
      }
      else
      {
         if(pwd.length <5  ||pwd.length > 20)
           myMessage[myMessage.length]="Should have at least "+(5)+" alphanumeric characters and less than "+(20)+" alphanumeric characters long.";
      }
    }
    if(key=="bshouldcapitalize" && pwdParam[key].toLowerCase()=="true")
    {
      if(app._settings.checkIfCapLetterExist(pwd)==false)
        myMessage[myMessage.length]="Should have at least 1 capital alphabet.";
    }
    if(key=="shouldcontain1lowcaselet" && pwdParam[key].toLowerCase()=="true")
    {
      if(app._settings.chkIfLowCaseLetterExist(pwd)==false)
        myMessage[myMessage.length]="Should have at least 1 lower case alphabet.";
    }
    if(key=="allowsspecialchr" && pwdParam[key].toLowerCase()=="true")
    {
      if(app._settings.chkSpecialCharByValue(pwd)==false)
        myMessage[myMessage.length]="Should have at least 1 special character.";
    }    
    if(key=="matchpassworduserid" && pwdParam[key].toLowerCase()=="true")
    {
      if(app._settings.checkIfUserPresent(pwd,userid)==false)
        myMessage[myMessage.length]="Should not contain your user id.";
    }    
    if(key=="checkconsecutivechar" && pwdParam[key]=="true")
    {
      if(app._settings.checkConsecutiveChar(pwd)==false)
          myMessage[myMessage.length]="Shouldn't contain consecutive characters.";
    }    
    if(key=="checkdateexist" && pwdParam[key]=="true")
    {
      if(!app._settings.chkIfDateExistInPwd(pwd))
          myMessage[myMessage.length]="Shouldn't contain any aspect of the date.";
    }
  }
   if(myMessage.length==0)
    return {status:"success",msg:""};
  else
    return {status:"unsuccess",msg:"",error:myMessage.join("\n"),passval:"3"}; 
    
}
/*
Function:app._settings.checkIfAlphaNumeric
Desc:Alpha Numeric Validation
Date:20-09-2016
Author:Trupti Gaikwad
*/
app._settings.checkIfAlphaNumeric=function(strParam)
{
  var  iNum = false;
  var strCharVal = false;
  var strAplha ='';  
  for(var j=0,len=strParam.length; j<len; j++)
  {
    strAplha = strParam.charCodeAt(j);
    if(strAplha > 47 && strAplha<59)
      iNum=true;
        
    if((strAplha>64 && strAplha<91) || (strAplha>96 && strAplha<123))
      strCharVal=true;
  }
  if(iNum ==false|| strCharVal==false)
    return 0; 
  else
    return 1; 
}
/*
Function:app._settings.checkIfCapLetterExist
Desc:Capital letter exist or no
Date:20-09-2016
Author:Trupti Gaikwad
*/
app._settings.checkIfCapLetterExist=function(strParam)
{
    var capFlag=0;
    var strAplha;

    for(var j=0; j<strParam.length; j++)
    {
    strAplha = strParam.charCodeAt(j);
    if((strAplha >= 65 && strAplha<=90))
    capFlag=1;
    }
    if(capFlag==0) return false;
    else return true;
}
/*
Function:app._settings.chkIfLowCaseLetterExist
Desc:small letter exist or no
Date:20-09-2016
Author:Trupti Gaikwad
*/
app._settings.chkIfLowCaseLetterExist=function(strParam)
{
  var capFlag=0;
  var strAplha;
  
  for(var j=0; j<strParam.length; j++)
  {
    strAplha = strParam.charCodeAt(j);
    if((strAplha >= 97 && strAplha<=122))
       capFlag=1;
  }
  if(capFlag==0) return false;
  else return true;

}
/*
Function:app._settings.chkSpecialCharByValue
Desc:check for special character
Date:20-09-2016
Author:Trupti Gaikwad
*/

app._settings.chkSpecialCharByValue=function(strParam)
{
  var iChars = "~`!@#$%^&*()+=-[]\\\';,./{}|\":<>?";
  var specialFlag=0;
  for(var i = 0; i < strParam.length; i++) 
  { 
   if(iChars.indexOf(strParam.charAt(i)) != -1)
     specialFlag=1;
  }
  if(specialFlag==0) return false;
  else return true;
}
/*
Function:app._settings.checkIfUserPresent
Desc:user present or not
Date:20-09-2016
Author:Trupti Gaikwad
*/
app._settings.checkIfUserPresent=function(strParam,userid)
{
 strParam=strParam.toLowerCase();
  userid=userid.toLowerCase();
  var myIndex=strParam.indexOf(userid);
  if(myIndex!=-1)
    return false;
  else if(myIndex==-1)
      return true;

}
/*
Function:app._settings.checkConsecutiveChar
Desc:check for consecutive characters
Date:20-09-2016
Author:Trupti Gaikwad
*/
app._settings.checkConsecutiveChar=function(pwd)
{
 pwd=pwd
  pwd=pwd.toLowerCase();
  
  var letter=pwd.charAt(0);
  var chlFlag=false;
  
  for(var i=1,len=pwd.length;i<len;i++)
  {
    letter==pwd.charAt(i)
     if(letter==pwd.charAt(i))
     {
      chlFlag=true;
      break;
     }
     letter=pwd.charAt(i)
  }
  
  if(chlFlag)
    return false
  else
    return true
}

/*
Function:app._settings.checkConsecutiveChar
Desc:date exist in passwword
Date:20-09-2016
Author:Trupti Gaikwad
*/
app._settings.chkIfDateExistInPwd=function(pwd)
{
 pwd=pwd.toLowerCase();
  var month = new Array('january','february','march','april','may','june','july','august','september','october','november','december','jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec');
  var day = new Array('sunday','monday','tuesday','wednesday','thursday','friday','saturday','sun','mon','tue','wed','thu','fri','sat');

  dateflag=false;
  monthflag = false;  
  var myIndex=-1;
  for(var j=0,len=month.length;j<len;j++)
  {
    myIndex=pwd.indexOf(month[j]);
    if(myIndex!=-1)
    {
      monthflag=true
      break;          
    }
  }  
  myIndex=-1;
  for(var j=0,len=day.length;j<len;j++)
  {
    myIndex=pwd.indexOf(day[j]);
    if(myIndex!=-1)
    {
      dateflag=true
      break;          
    }
  }
    
  if(monthflag || dateflag)
  {
    return false;
  }
  else
  {
    return true ;   
  }
}
/*
Function:app._settings.updatePassword
Desc:send request to server and update password
Date:21-09-2016
Author:Trupti Gaikwad
*/
app._settings.updatePassword=function(oldpwd,pwd,newpwd)
{
var jstring={}
jstring.oldpass=app._settings.hashAllPwdField(oldpwd);
jstring.newpass=app._settings.hashAllPwdField(pwd);
jstring.confirmpass=app._settings.hashAllPwdField(newpwd);

  app.sendRequest({
          url: 'REST/update/useradmin/changepassword',
          fn: function(response){
              response=eval('('+response+')')
           
              if(response.passval==1)
              {
                alert("Password changed successfully .User will be logged out!!!");           
                app.onLogout();
              }
              else if(response.passval==2)
              {
                alert("Error : Please Check Old Password.");
                $("#frmsettings #txtoldpwd").val("");
                $("#frmsettings #txtnewpwd").val("");
                $("#frmsettings #txtcnfrmpwd").val("");
                return;
              }

              else if(response.passval==3 ||response.passval==0)
              {
                alert("Error : "+response.error.split(",").join("<br>"));
                $("#frmsettings  #txtoldpwd").val("");
                $("#frmsettings  #txtnewpwd").val("");
                $("#frmsettings  #txtcnfrmpwd").val("");
                return   ; 
              } 
             

           },
          async: true,
          data: { 
                  _ticket:app.getData("_ticket"),
                  jstring:JSON.stringify(jstring)       
                }
    });
}

/*
Function:app._settings.hashAllPwdField
Desc:hash password
Date:21-09-2016
Author:Trupti Gaikwad
*/
app._settings.hashAllPwdField=function (txtVal)
{
  var hashObj="";
  hashObj= new jsSHA(txtVal, "TEXT");
  hashObj=hashObj.getHash("SHA-512", "HEX");
  return hashObj;
}