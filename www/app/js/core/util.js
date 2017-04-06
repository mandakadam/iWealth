var app = app || {};

//Generic Model
app.dm = app.dm || {};

//Generic View
app.dv = app.dv || {};

app.instance=app.instance||{dv:{},dm:{},dc:{}}

var ivalid=ivalid || {};


Backbone.View.prototype.close = function(){
  this.remove();
  this.unbind();
}

// matches zip codes
ivalid.zip = /\d{5}(-\d{4})?/;
ivalid.zip_msg="Please enter proper zip code.(e.g. 400101)";
// matches $17.23 or $14,281,545.45 or ...
ivalid.currency = /\$\d{1,3}(,\d{3})*\.\d{2}/;
ivalid.currency_msg="Please enter proper currency.($17.23 or $14,281,545.45)"; 
// matches 05:04 or 12:34 but not 75:83
ivalid.time_24=/^(([0-1][0-9])|([2][0-3])):(([0-9])|([0-5][0-9]))$/;
ivalid.time_msg="Please enter proper time.(05:04 or 12:34 but not 75:83)" 

// matches 5:04 or 12:34 but not 75:83
ivalid.time = /^([1-9]|1[0-2]):[0-5]\d$/;
ivalid.time_msg="Please enter proper time.(5:04 or 12:34 but not 75:83)" 
//matches email
ivalid.email = /^.+\@(\[?)[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,3}|[0-9]{1,3})(\]?)$/;
ivalid.email_msg="Please enter proper email address.(e.g. abc@credenceanalytics.com)"
// matches phone ###-###-####
ivalid.phno = /^\(?\d{3}\)?\s|-\d{3}-\d{4}$/;
ivalid.phno_msg="Please enter proper phone number.(eg.###-###-####)"
ivalid.number = /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/ ;
ivalid.number_msg = "Please enter proper number(e.g. 1234.23)";
ivalid.integer = /(^\d\d*$)/;
ivalid.integer_msg = "Please enter positive number.(e.g. 12 , 10 etc)";
// International Phone Number
ivalid.phnoint = /^\d(\d|-){7,20}/;
// IP Address
ivalid.ipadd = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
// Date xx/xx/xxxx
ivalid.date = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/;
ivalid.date_msg="Please enter proper date.(e.g. dd-mm-yyyy)"
//not empty
ivalid.nonEmpty = /\S([\w]*[\W]*){1,}/;
// Social Security Number
ivalid.ssn = /^\d{3}\-\d{2}\-\d{4}$/;
//Matches 0, 0.0, 99.9, 100.0, but excludes -1, 100.1, etc.
ivalid.percent=/^100$|^\s*(\d{0,2})((\.|\,)(\d*))?\s*\%?\s*$/;
ivalid.percent_msg="Please enter proper percentage.(e.g. 0, 0.0, 99.9, 100.0, but excludes -1, 100.1, etc)";
ivalid.nonNegative= /(^\d*\.?\d*[0-9]+\d*$)|(^[0-9]+\d*\.\d*$)/;
ivalid.nonNegative_msg="Please enter positive number only.(e.g. 0.5555, 99.54654,  589.6565, 64564.7575 etc)";
// ivalid.timecontrol=/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;
ivalid.timecontrol12=/^(0?[1-9]|1[0-2]):([0-5][0-9]):([0-5][0-9])\s(am|pm)$/;
ivalid.timecontrol12_msg="Please enter proper time.(05:04:11 am/pm or 12:34:25 am/pm but not 75:83:90)" 

ivalid.timecontrol24=/^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
ivalid.timecontrol24_msg="Please enter proper time.(21:04:11 or 01:34:25 but not 75:83:90)" 
//Validate mac address
ivalid.macAddress=/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
ivalid.macAddress_msg="Please enter proper mac address"
//Validate multiple email address
ivalid.multipleEmail=/^(([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+([,.](([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+)*$/;
ivalid.multipleEmail_msg="Please enter the email addresses properly(Should be comma separated)." 

//************* REGEX Elements

app.dm._generic = function(config) {
    var _config = {
            _methods: {
                'read': "dataset/masters",
                'create':"master/masteradd",
                'update':"master/mastermodify",
                'delete':"master/masterdelete",
                'patch':""
            },
//             parse: function(response) {
//                 if (response.data && response.data.length > 0)
//                     return response.data[0]
//                 return {};
//             },
            _service: "dataset",
            sync: function(method, model, options) {
                var key,Obj={};
                options || (options = {});

                //additional parameters if any needs to sent
                if(this.beforeSend)
                  options.data = this.beforeSend(model.toJSON(), method, options) || {};
                else
                  options.data={} 

                //set compulsary and user defined data values to be sent to server
                options.data._ticket = sessionStorage.getItem("_ticket") || "";
                options.data._datatable = this._datatable || "";
                options.data._reload=app._reload||false; 
                for (key in this.data) {
                    options.data[key] = options.data[key] || this.data[key];
                }

                //Create a URL for this method
                options.url = this.geturl(method.toLowerCase());
               if(method == 'update')
               {
                 if(model.changedAttributes())
                 {
                   Obj=model.changedAttributes()||{};
                   Obj[model.idAttribute]=model.get(model.idAttribute)
                   options.data.jsondata=JSON.stringify(Obj)
                   options.data.odata=JSON.stringify(model.toJSON())
                 }
//                  else
//                  {
//                   return {"status":"success","msg":"","error":""}
//                  }
               }
               else if(method=="delete")
               {
                Obj={}                
                Obj[model.idAttribute]=model.get(model.idAttribute)
                options.data.jsondata=JSON.stringify(Obj);
               }
               else if(method=="create")
               {
                options.data.jsondata=JSON.stringify(model.toJSON());
               }
                  
                //Overwrite the http method to POST always
                method = 'create';

                //to remove the payload data with form encoded data
                options.emulateJSON = true;

                 //options.data.jsondata = model.toJSON();
                return Backbone.sync.apply(this, arguments);
            },
            geturl: function(method) {
                switch (method) {
                    case 'read':
                        return app.applicationurl+'REST/read/' + this._methods[method];
                    case 'create':
                        return app.applicationurl+'REST/create/' + this._methods[method];
                    case 'update':
                        return app.applicationurl+'REST/update/' + this._methods[method];
                    case 'delete':
                        return app.applicationurl+'REST/delete/' + this._methods[method];
                    default:
                        return false;
                }
            }
        }
    // Overwrite base object
    $.extend(_config,config)
    return Backbone.Model.extend(_config);
}

//Generic Collection
app.dc = app.dc || {};
app.dc._generic = function(config) {
        var _config = {
                _methods: {
                    'read': "dataset/master",
                    'create':"master/masteradd",
                    'update':"master/mastermodify",
                    'delete':"master/masterdelete",
                    'patch': ""
                },
                _service: "dataset",
                sync: function(method, collection, options) {
                    var key,Obj={};
                    options || (options = {});

                    //additional parameters if any needs to sent
                    if(this.beforeSend)
                      options.data = this.beforeSend(model.toJSON(), method, options) || {};
                    else
                      options.data =options.data||{}                      

                    //set compulsary and user defined data values to be sent to server
                    options.data._ticket = app.getData("_ticket") || "";
                    options.data._datatable = app._datatable || "";
                    options.data._reload=app._reload||false;
                    for (key in this.data) {
                        options.data[key] = options.data[key] || this.data[key];
                    }

                    //Create a URL for this method
                    options.url = this.geturl(method.toLowerCase());
                    options.emulateJSON = true;
                     if(method == 'update' && model.changedAttributes())
                     {
                       Obj=model.changedAttributes()||{};
                       Obj[model.idAttribute]=model.get(model.idAttribute)
                       options.data.jsondata=JSON.stringify(Obj)
                       options.data.odata=JSON.stringify(model.toJSON())
                     }
                     else if(method=="delete")
                     {
                      Obj={}                
                      Obj[model.idAttribute]=model.get(model.idAttribute)
                      options.data.jsondata=JSON.stringify(Obj);
                     }
                     else if(method=="create")
                      options.data.jsondata=JSON.stringify(model.toJSON());


                    //Overwrite the http method to POST always
                    method = 'create';
                    return Backbone.sync.apply(this, arguments);
                },
                geturl: function(method) {
                    switch (method) {
                        case 'read':
                            return app.applicationurl+'REST/read/'+ this._methods[method];
                        case 'create':
                            return app.applicationurl+'REST/create/' + this._methods[method];
                        case 'update':
                            return app.applicationurl+'REST/update/' + this._methods[method];
                        case 'delete':
                            return app.applicationurl+'REST/delete/' + this._methods[method];
                        default:
                            return false;
                    }
                }
            }
        // Overwrite base object
        $.extend(_config,config)        
        return Backbone.Collection.extend(_config);

    }
    
app.getApplicationSettings=function()
{
  //Initialise the application settings model
  app.dm._appsettings = new (app.dm._generic({
      idAttribute:"applicationtitle",
      data:{"_reload":app._reload}  
      ,_service: "apiticket",
      _methods: {
          read: "apiticket/_app_settings"
      },
      parse:function(response){

        if(response.status=="success")
          return response.appSettings;
        else
        {
          alert("Error while loading application settings.Try again.")
          return {}  
        }    
      }  
  }))
  app.dm._appsettings.fetch(
  {
    success:function(){
     app["_reload"]=(app.dm._appsettings.get("_reload")||"false");
     window.document.title=app.dm._appsettings.get("applicationtitle")||"";
    }
  }
  );
}    


/**
 *@name       iWebZ.request.
 *@desc       this function performs the Ajax request to the server
 *author      Vikas  
 *dated         
 *@param      
              * vObj{Object} - Ajax request Object
              * @cfg - configuration for the object
                        * url(String) - url for the server side request
                        * async(Boolean) - Async/Sync Request to the server                       
                        * fn(Function) - callback function after data is returned from server
                        * data(Object) - name:value pair for of the data to be passed to server  
                        * rf(Function) - Callback Function if error Occurs at server side                                                                                                  
 *@return     response Object from the server
 **/
app.sendRequest=function(vObj)
{

	if(!vObj.url || vObj.url==""){alert("Url Not specifed for calling Server Request");return;};
	if(!vObj.async)
	{
	 var response=$.ajax({
  			url: app.applicationurl+""+vObj.url,
  			async: false,
  			type: "POST",
  			data:vObj.data||""
		 });
	 if(response.status=="401")	 			
	 {
		app.requestFailed(response);
	 }
   else if(response.status=="403")	 			
	 {
		app.requestFailed(response);
	 }
	 else 	
		return response.responseText;	 	 	
	}
	else
	{
	
		if(!vObj.fn){alert("Call back function is required for the Asynchronous call");return;};
	  return $.ajax({
  			url: app.applicationurl+""+vObj.url,
  			async: true,
  			type: "POST",
  			data:vObj.data||"",
//         beforeSend: function() { ifwk.showSpinner();},
//         complete: function() {  ifwk.hideSpinner();},        
   			success: function(response){return vObj.fn(response)},
   			error:app.requestFailed
		 });
	}	
}

// function to be calle when the request fails
app.requestFailed=function(response)
{
//  window.alertO("u r logged out");
	 if(response.status=="401")	 			
	 {
    window.alert("You have been logged out");
//		location.href=iWebZ.getLocationPath()+ "/josso_logout/";	
		return false;
	 }
   else if(response.status=="403")
   {
    window.alert("You have been logged out");
//    location.href=iWebZ.getLocationPath() + "/josso_logout/";
    return false;
   }
   else if(response.readyState==0 && response.statusText=="error")
   {
    window.alert("You have been logged out");
//    location.href=iWebZ.getLocationPath() + "/josso_logout/";
    return false;
   } 
}

window.BDalert=window.alert;
window.alert = function(message, fallback){
   BootstrapDialog.show({
            title: 'Information',
            message:message,
            buttons: [{
                label: 'Ok',
                action: function(dialogItself){
                    dialogItself.close();
                }                               
            }]
        });
};


window.confirm = function(title,message, cb){
  BootstrapDialog.confirm({
          title: title||"Information",
          message: message,
//          type: BootstrapDialog.TYPE_WARNING, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
          closable: true, // <-- Default value is false
          draggable: true, // <-- Default value is false
          btnCancelLabel: 'No', // <-- Default value is 'Cancel',
          btnOKLabel: 'Yes', // <-- Default value is 'OK',
          callback:cb
      });
}


/**
 *@event      app.getUserSettings.
 *@desc       Get user settings
 *@author     Mohini

**/
app.getUserSettings=function()
{

  app.dm._usersettings = (app.dm._generic({
      idAttribute:"alertid"
      ,_methods: {
         update:"settings/updateUserSettings"
      }
//      ,parse:function(response){
//         if(response.status=="success" && response.vdata)
//           return response.vdata
//      }            
 }))
  
  app.dc._usersettings=new (app.dc._generic(
  {
    model:app.dm._usersettings
    ,data:{user_id:app.getData("_user_id")} 
    ,_methods: {
        read: "dataset/UserSettings"
    }
    ,parse:function(response){
      if(response.status=="success" && response.vdata)
        return response.vdata
    }      
  }))
  app.dc._usersettings.fetch();
}

Highcharts.getOptions().plotOptions.pie.colors = (function () {
      var colors = [],
          base = Highcharts.getOptions().colors[0],
          i;

      for (i = 0; i < 5; i += 1) {
          // Start out with a darkened base color (negative brighten), and end
          // up with a much brighter color
          colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
      }
      return colors;
  }());



/**
 *@event      app.createPieChart.
 *@desc       Create pie chart 
 *@author     Mohini
 *@dated      16-09-2016 4:03:06 PM
 *@param      chartObj{Object} 
**/
app.createPieChart=function(chartObj)
{
 // Build the chart
    $(chartObj.id).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: (chartObj.title||"")
        },
        tooltip: {
            pointFormat:chartObj.tooltip||'{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                enableMouseTracking: true,
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false,
                    format: chartObj.plotlabel||'<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
                , showInLegend: true
            }
        },
        series: [{
            name: chartObj.name||'',
            data: chartObj.data
        }]
    });
}

app.validateJQForm=function(objForm){

    var vMsg=""
  // Validator Object
    var valid = new Object();
   // REGEX Elements
    // matches zip codes
    valid.zipCode = /\d{5}(-\d{4})?/;
    valid.zipCode_msg="Invalid ZIP Code"

    // matches $17.23 or $14,281,545.45 or ...
    valid.Currency = /\$\d{1,3}(,\d{3})*\.\d{2}/;
    valid.Currency_msg="Invalid currency format"

    // matches 5:04 or 12:34 but not 75:83
    valid.Time = /^([1-9]|1[0-2]):[0-5]\d$/;
    valid.Time_msg="Invalid time format"
    
    //matches email
    valid.emailAddress = /^.+\@(\[?)[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,3}|[0-9]{1,3})(\]?)$/;
    valid.emailAddress_msg="Invalid email address"

    // matches phone ###-###-####
    valid.phoneNumber = /^\(?\d{3}\)?\s|-\d{3}-\d{4}$/;
    valid.phoneNumber_msg="Invalid phone number format"
      
    //matches number
    valid.number = /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/ ;
    valid.number_msg="Number Field."
    
    //matches integer
    valid.integer = /(^-?\d\d*$)/;
    valid.integer_msg="Integer field"

    // International Phone Number
    valid.phoneNumberInternational = /^\d(\d|-){7,20}/;
    valid.phoneNumberInternational_msg="Invalid format of international phone number"
    
    // IP Address
    valid.ipAddress = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    valid.ipAddress_msg="Invalid format of IP address"
    
    // Date xx/xx/xxxx
    valid.Date = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/;
    valid.Date_msg="Date Field"
    
    //not empty
    valid.nonEmpty = /\S([\w]*[\W]*){1,}/;
    valid.nonEmpty_msg="Mandatory field"

    // State Abbreviation
    valid.State = /^(AK|AL|AR|AZ|CA|CO|CT|DC|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NB|NC|ND|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV|WY)$/i;
    valid.State_msg="Incorrect state abbreviation"
    
    // Social Security Number
    valid.SSN = /^\d{3}\-\d{2}\-\d{4}$/;
    valid.SSN_msg="Invalid social security number"
    
    //non negative numbers
    valid.nonNegative= /(^\d*\.?\d*[0-9]+\d*$)|(^[0-9]+\d*\.\d*$)/;
    valid.SSN_msg="Non negative number"

    valid.multipleEmail=/^(([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+([,.](([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+)*$/;
    valid.multipleEmail_msg="Invalid email addresses(Should be comma separated)." 

    
    //validate actual form fields
    vMsg=app.validateFormField(valid,objForm);
    
    //validate custom fields
    if(document[objForm.id+"_cust"])  
      vMsg+=app.validateFormField(valid,document[objForm.id+"_cust"]);
    
   if(vMsg.length > 0)
   {
    return {"status":"unsuccess","msg":"","error":vMsg};   
    alert("Validation Error :\n\n"+vMsg);
    return false;     
   }
   else
    return {"status":"success","msg":"","error":""};
    return true;
}

app.validateFormField=function (validObj,objForm)
{
    var valid = validObj; 
    var vMsg = "";
    var fieldRef;
    var v ;
    var vTemp;
    var arrValidate=""
    var vLen; 
    var thePat;
    var gotIt;
    var elArr = objForm.elements;
    
    for(var i = 0; i < elArr.length; i++)
    {
       //alert(elArr[i].id)                 
       with(elArr[i])
       {                                
        if(elArr[i].id=="")continue;
        v =$("#"+objForm.id+" #"+elArr[i].id).attr("validator");
        if(!v) continue; 
        vTemp = elArr[i].value+"";
        vTemp = vTemp.replace(/^(\s+)?(.*\S)(\s+)?$/, '$2');//trims right and left spaces of a string
        arrValidate = v.split(",");
        vLen = arrValidate.length;
        $("#"+objForm.id+" label[for="+elArr[i].id+"]").removeClass('labelerr');
        fieldRef=$("#"+objForm.id+" #"+elArr[i].id);
        fieldRef.removeClass('texterr');
        //unmask the number 
        if(fieldRef.hasClass('iwebz-numbermask'))
         //fieldRef.val(fieldRef.unmask());
         app.unmaskNumberFieldEl(fieldRef)
         
        for(var vCnt = 0 ; vCnt < vLen ; vCnt++ )
        {
          if(valid[arrValidate[vCnt]] != undefined)
          {
            thePat = valid[arrValidate[vCnt]]; 
            gotIt = thePat.exec(value); 
            if(vTemp.length <= 0 && arrValidate[vCnt] != "nonEmpty") continue;
            if(! gotIt)
            {
              $("#"+objForm.id+" label[for="+elArr[i].id+"]").addClass('labelerr');
              $("#"+objForm.id+" #"+elArr[i].id).addClass('texterr');
               vMsg += "" + $("label[for="+elArr[i].id+"]").text()+ " - " + valid[arrValidate[vCnt]+"_msg"]+ "\n";
               ///alert(vMsg)
            }
          }    
          else
          {
            ///vMsg += " Validation Not Found Des:- " + arrValidate[vCnt];
          }
        }
      }
     }
     return vMsg
}
app.unmaskNumberFieldEl=function(fieldRef)
{
  if(fieldRef)
    fieldRef.attr("value",fieldRef.unmask());
}    
app.addNumberMask=function(obj)
{
  if(!obj)return;
   var numMask = $("#"+obj.id+" .iwebz-numbermask");
   $.each(numMask,function(){
    //Add keyup
      $(this)
        .bind('keyup', function() {
          $(this).val(app.formatPrice.call(this.value,',', '.'));
        })
      .bind('blur', function() {
         $(this).val(app.unformatPrice.call(this.value));
       })
       .bind('focus', function() {
         $(this).val(app.formatPrice.call(this.value, ',', '.'));
       });
                            
   }); 
}

app.formatPrice=function(comma, period) {
    comma = comma || ',';
    period = period || '.';
    var split = this.toString().split('.');
    var numeric = split[0];
    var decimal = split.length > 1 ? period + split[1] : '';
    numeric = numeric.replace(/\,/g, '');
    var reg = /(\d+)(\d{3})/;
    while (reg.test(numeric)) {
        numeric = numeric.replace(reg, '$1' + comma + '$2');
    }
    return numeric + decimal;
}

app.unformatPrice=function() 
{
    var numeric = this.toString()
    numeric = numeric.replace(/\,/g, '');
    return numeric;
}
app.checkNumberKeyPress=function(temp)
{

if(!temp.keyCode)
temp.keyCode=temp.which;
  if((temp.keyCode<48 || temp.keyCode>57) && temp.keyCode!=46)
  {    
    return false;
  }  
  return true;
}

app.createCalendar= function(node)
{
  node.find('.calendar').each(function(i){
  $(this).datepicker({
                                autoclose:true
                                ,format:app.dm._appsettings.get("bsDateFormat")[app.dm._appsettings.get("globalDateFormat")]
                                ,todayHighlight:true
                                ,changeYear:true
                                ,changeMonth: true
    }).prop("size","10");
  });
}

app.validate=function(valmsg,obj)
{
  if(obj.prop("value")=="")
    return true;
  var thePat= ivalid[valmsg];
  var gotIt = thePat.test(obj.prop("value"));
  if(!gotIt)
  {    
    alert(ivalid[valmsg+"_msg"] || "Improper data.Please check!")       
    return false;
  }
  else
    return true;
}
app.dobDateValidation=function(vdate)
{
  var db=vdate.prop("value");  
  var cur_date=formatDate(new Date(),app.dm._appsettings.get("globalDateFormat"))  
  var num=compareDates(db,app.dm._appsettings.get("globalDateFormat"),cur_date,app.dm._appsettings.get("globalDateFormat"));            
  if(num==1)
    return false; 
  return true;
}

var quoteslist={min:0};
quoteslist.data = [
"Money without brains is always dangerous"
,"The Best way to teach your kids abour TAXES is by eating 30% of their icecream"
,"Love conquers all things except poverty and toothache"
,"Money doesn’t talk, it swears"
,"If only God would give me some clear sign! Like making a large deposit in my name at a Swiss bank"
,"I have enough money to last me the rest of my life, unless I buy something"
,"I’ve been rich and I’ve been poor: Rich is better"
]
quoteslist.getRandomQuote=function(){
	var at=0
  var min = Math.ceil(this.min);
  var max = Math.floor(this.data.length);
  at=Math.floor(Math.random() * (max - min)) + min;
  return this.data[at];
}



/**
 *@event      app.showSpinner.
 *@desc       Show loading spinner
**/
app.showSpinner=function(divid,opts)
{
  run_waitMe($('body'), 3, "roundBounce");
}

/**
 *@event      ifwk.hideSpinner.
 *@desc       Hide the spinner
 *@author     Mohini     
 *@dated      27/03/2012
 *@param      Param1{String} - param Description
 *@param      Param1{String} - param Description
 *@validation 
              * Val Desc                   
 *@return     Return Data Desc
 **/
app.hideSpinner=function()
{
  $('body').waitMe('hide');
}


	function run_waitMe(el, num, effect){
		text = 'Please wait...';
		fontSize = '';
		switch (num) {
			case 1:
			maxSize = '';
			textPos = 'vertical';
			break;
			case 2:
			text = '';
			maxSize = 30;
			textPos = 'vertical';
			break;
			case 3:
			maxSize = 30;
			textPos = 'horizontal';
			fontSize = '18px';
			break;
		}
		// console.log(effect)
		el.waitMe({
			effect: effect,
			text: text,
			bg: 'rgba(255,255,255,0.7)',
			color: '#000',
			maxSize: maxSize,
			source: 'img.svg',
			textPos: textPos,
			fontSize: fontSize,
			onClose: function() {}
		});
	}