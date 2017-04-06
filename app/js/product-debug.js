app._reload=false
app.login={}
app.instance.dv.loginview=null


$(document).ready(function(){

  $(document).ajaxError(function(event, response, settings ) {
    if(response.status=="401" || response.status=="403")
      app.login.backtoScreen();
    else
      console.log(response)
  })
  .ajaxStart(function () {
      app.showSpinner("body")
  })
  .ajaxStop(function () {
    app.hideSpinner("body")
  });
  ;

  // Router
  var AppRouter = Backbone.Router.extend({
      routes:{
          "":"login",
          "mainpage":"mainpage",
          "forgetPassword":"forgetPassword",
          "*path":"login"
      },
      
      login:function () {
        if(window.sessionStorage.getItem("_ticket"))
          _app_route.navigate('mainpage', { trigger: true });
        else
        {
          if(!app.instance.dv.loginview)
            app.instance.dv.loginview=new LoginView({el:"#logincontent"});
          else
            app.instance.dv.loginview.render();   
            
        }
      },
   
      mainpage:function (id) {
        $("#logincontent").fadeOut();
        $('body').removeClass('login-page');
        var mp = new MainPageView({el:"#mainpagecontent"});
        mp.render();
        app.main.getModuleList();
        app.getUserSettings();
      },
      forgetPassword:function()
      {
        new fgtPassView({el:"#logincontent"});
      }
  });


  //MainPage View
   MainPageView = Backbone.View.extend({    
        initialize: function() {
//            _.bindAll(this, "render")
            this.mainpage = $("#mainpagetemplate").html();            
        },        
        render: function() {
            $(this.el).html(this.mainpage).fadeIn();            
            return this;
        }
    });

  //Login View
   LoginView = Backbone.View.extend({
      initialize: function() {
        var $this=this;
        $.get(app.applicationurl+""+"app/template/login/login.htm", function(template){
          $this.loginpage=template;
          $this.render();          
        });          
      },
      events: {
          "click #btnSubmit":"login_press"
      }
      ,render: function() {
          $("#mainpagecontent").fadeOut();
          $("#logincontent").fadeIn();
          this.$el.html(this.loginpage);
          $('body').addClass('login-page');
        return this;
      },
      login_press: function(e) {
//        e.preventDefault();
        app.login.onlogin();
      }
  })

  //Forget Password View
  fgtPassView = Backbone.View.extend({
      events:{
       "click #btnCancelFP":"backToLoginScreen"
      ,"click #btnResetPass":"resetPassword"  
      }
      ,initialize: function() {
        var $this=this;
        $.get(app.applicationurl+"app/template/login/forgotpwd.htm", function(template){
          $this.FPPage=template;
          $this.render();          
        });          
      },
      render:function()
      {
        this.$el.html(this.FPPage);
      }
      ,backToLoginScreen:function()
      {
        app.login.backtoScreen();
      }
      ,resetPassword:function(e){
        e.preventDefault();
        app.login.onForgetPassword();
      }
    });    

  app.getApplicationSettings();
  _app_route = new AppRouter();
  Backbone.history.start();
});

app.login.processLogin=function(ctoken,objForm)
{ 
		var cToken=ctoken+""
		var hashObj="";	
    objForm.ctoken.value=ctoken;
		if(document.getElementById("authMode").innerHTML =="application")
		{
			hashObj= new jsSHA(objForm.password.value, "TEXT");
			hashObj=hashObj.getHash("SHA-512","HEX");      
			hashObj=hashObj+cToken;
			hashObj= new jsSHA(hashObj,"TEXT");
			hashObj=hashObj.getHash("SHA-512","HEX");
			objForm.password.value=hashObj;
		} 
    $.post(app.applicationurl+"REST/create/apiticket/generatewebticket?_reload="+app._reload,$(objForm).serialize(),function(vobj){    
    try
    {
      vobj=eval('('+vobj+')')    
    }
    catch(e)
    {
      $("#frmlogin #loginValid").html("Error while login").show();
      //document.getElementById("loginValid").innerHTML="Error while login";
      objForm.user_id.value=""
      objForm.password.value = "";
      return;
    }
    if(vobj.status!="success")
    {      
//      document.getElementById("loginValid").innerHTML=vobj.error;
      $("#frmlogin #loginValid").html(vobj.error).show();  
      objForm.user_id.value=""
      objForm.password.value = "";
      return;
    }
    window.sessionStorage.setItem("_ticket",vobj.webticket);
    window.sessionStorage.setItem("_user_id",objForm.user_id.value);
    app._ticket=vobj.webticket    
    _app_route.navigate('mainpage', { trigger: true });

   });
}
getSession=function()
{
  return window.sessionStorage.getItem("_ticket");
}
app.getData=function(param)
{
  if(param)
    return window.sessionStorage.getItem(param);
  else ""  
}

app.login.backtoScreen=function()
{
  window.sessionStorage.setItem("_ticket","");
  window.sessionStorage.setItem("_user_id","");
  app.destroyObjects();
  _app_route.navigate('', { trigger:true });
}

app.login.onForgetPassword=function(){
  var emailaddress=$("#frmforgotpwd #txt_email").prop("value")||"";
  if(emailaddress=="")
  {
    $("#frmforgotpwd #passwordmsg").html("Please enter email address");
    return;
  }  
	app.sendRequest({
		   		url: 'REST/update/apiticket/forgotpassword',
		   		fn: function(response){
              response=eval('('+response+')')
              if(response.status=="success")
              {
                alert("Password has been mailed to your email address.")
                app.login.backtoScreen();
                // document.getElementById("loginValid").innerHTML="Password has been mailed to your email address.";
              }
                
              else
                $("#frmforgotpwd #passwordmsg").html("Opps!!! Have encountered an error while emailing the password.")  
           },
		   		async: true,
		   		data: { 
		   						sessionid:app.getData("_ticket")
                 ,user_id:emailaddress 
		   		      }
		});
}


app.login.onlogin=function(e)
{
//  document.getElementById("loginValid").innerHTML="";
  $("#frmlogin #loginValid").hide().html("");
  var objForm = document.frmlogin;
  var vUser = objForm.user_id.value;
  var vPass = objForm.password.value;
  if(vUser == "")
  {
      $("#frmlogin #loginValid").html("Please enter email address").show();     
//      document.getElementById("loginValid").innerHTML="Please enter your user id";    
      objForm.password.value = "";              
      return ;
  }
  if(vPass == "")
  {       
     $("#frmlogin #loginValid").html("Please enter your password").show();
//     document.getElementById("loginValid").innerHTML="Please enter your password";
     objForm.password.value = "";
     return;
  }
  
	app.sendRequest({
		   		url: 'REST/create/apiticket/generatetoken',
		   		fn: function(response){
            response=eval('('+response+')');
            if(response.status=="success")
            {
              app.login.processLogin(response.token,objForm);
              return;
            }
            else
            {
              $("#frmlogin #loginValid").html("Error while login.").show();                  
              objForm.user_id.value=""
              objForm.password.value = "";
              return;
            }
           },
		   		async: true,
		   		data: { 
                  "_ticket":app.getData("_ticket")
      		   		}
		});
}

//Destroy all the views
app.destroyObjects=function()
{
  for(var key in app.instance.dv)
  {
    if(app.instance.dv[key])
    {
      if(key=="loginview") continue;
//      app.instance.dv[key].close();
      console.debug("Unbind " +key);
      app.instance.dv[key].unbind();
      app.instance.dv[key]=null;      
    }
  }
};//Holding View
app.trade={}
app.instance.dv.HoldingView=null;
app.instance.dv.AssetHoldingView=null;
// if(app.dv.HoldingView)
//   app.dv.HoldingView.remove()
app.dv.HoldingView = Backbone.View.extend({    
        initialize: function(attrs) {
          var $this=this;

          //Add a refresh icon besides holding
          $("#module_V1").append('<div class="holding-refresh" onclick="app.onGetHolding();"><i class="fa fa-refresh"></i></div>')
          $("#module_V1 a").addClass("holding-mod-cls");
          
          this.paramhtml=attrs.paramhtml;
          var accountTpl='{{#tdata}}<div class="row"><div class="col-md-12 col-sm-12 col-xs-12"><div class="box cls-holding-box-shadow">'
          accountTpl=accountTpl+'<div class="box-body {{clsbg}}"><div class="row">'
          accountTpl=accountTpl+'<div class="col-md-10 col-sm-10 col-xs-10"><div class="row">'
          accountTpl=accountTpl+'<div class="col-md-12 col-sm-12 col-xs-12">'
          accountTpl=accountTpl+'<label class="cls-lbl-holding-amt">${{#commaSeparate}}{{marketvalue}}{{/commaSeparate}}</label></div></div><div class="row">'
          accountTpl=accountTpl+'<div class="col-md-12 col-sm-12 col-xs-12"><label class="cls-lbl-holding-perc">{{gainloss_perc}}%</label>'
          accountTpl=accountTpl+'<span class="cls-holding-caret-arrow"><i class=\"{{clsarrow}}\"></i></span>'
          accountTpl=accountTpl+'<label class="cls-lbl-holding-ac" ><i>Account : {{accountid}} </i>'
          accountTpl=accountTpl+'</label></div></div></div><div class="col-md-2 col-sm-2 col-xs-2">'
          accountTpl=accountTpl+'<div class="pull-right cls-holding-links"><a href="#Holding/asset/{{accountid}}" class="cls-holding-arrow"><i class="fa  fa-angle-right fa-5x"></i></a></div>'
          accountTpl=accountTpl+'</div></div></div></div></div></div>{{/tdata}}'


          this.accountTpl=accountTpl;                             
          //bind the collection to the view          
          app.dc.holdingCollection.on('reset',this.render,this);

          $.get(attrs.paramhtml, function(template){
            $this.holdingpage=template;
            app.dc.holdingCollection.fetch({reset:true});
          });
          
          //add the routes for asset wise and security wise holding
          _app_route.route("Holding/asset/:accountnumber","Holding/asset/",function(accountnumber){
            if(!app.instance.dv.AssetHoldingView)
            {
              app.instance.dv.AssetHoldingView=new app.dv.AssetHoldingView({el:"#maincontent","accountnumber":accountnumber});
            }
            else 
            {
              app.instance.dv.AssetHoldingView.accountnumber=accountnumber;
              app.instance.dv.AssetHoldingView.render();
            }  
          });          
        },        
        render: function(){
          app.trade.loadAccountHoldingView(this);
//           var $this=this;
//           //Get the accounting temmplate   
//           $.get(this.paramhtml, function(template){
//             $this.holdingpage=template;
//             app.trade.loadAccountHoldingView($this);
//           });
      }
    });

//Asset wise holding view
app.dv.AssetHoldingView=Backbone.View.extend({    
        initialize: function(options){
          var $this=this;
          this.accountnumber=options.accountnumber
          this.assettpl=""  
//          this.assettpl='<div class="row"><div class="col-md-12 col-sm-12 col-xs-12"><div><a  href="#MyPortfolio/V1"><i class="fa fa-angle-left fa-5x cls-holding-backicon"></i><span class="cls-holdings-backbtn" >Back</span></a></div></div></div>'
          this.assettpl=this.assettpl+'{{#tdata}}<div class="row"><div class="col-md-12 col-sm-12 col-xs-12"><div class="box cls-holding-box-shadow">'                 
          this.assettpl=this.assettpl+'<div class="box-body {{clsbg}}"><div class="row">'                                                                      
          this.assettpl=this.assettpl+'<div class="col-md-8 col-sm-8 col-xs-8"><div class="row">'                                                            
          this.assettpl=this.assettpl+'<div class="col-md-12 col-sm-12 col-xs-12"><label class="cls-lbl-holding-amt">${{#commaSeparate}}{{marketvalue}}{{/commaSeparate}}</label> </div>'                
          this.assettpl=this.assettpl+'</div><div class="row"><div class="col-md-12 col-sm-12 col-xs-12">'                                                   
          this.assettpl=this.assettpl+'<label class="cls-lbl-holding-desc"><i>{{assetclassname}}</i></label> </div></div></div><div class="col-md-2 col-sm-2 col-xs-2">'
          this.assettpl=this.assettpl+'<span class="pull-right"><i class=\"{{clsarrow}}\"></i><br>'                                                  
          this.assettpl=this.assettpl+'<label class="cls-lbl-holding-desc" >{{gainloss_perc}}%</label> </span>'                                                             
          this.assettpl=this.assettpl+'</div><div class="col-md-2 col-sm-2 col-xs-2"><span class="pull-right cls-holding-links ">'                             
          this.assettpl=this.assettpl+'<a href="#Holding/security/{{assetclass}}" class="cls-holding-arrow"><i class="fa fa-angle-right fa-5x"></a></i></span></div></div></div></div></div></div>{{/tdata}}'                                   
               

          $.get(app.applicationurl+"app/template/holding/AssetHolding.html", function(template){
            $this.assetholdingpage=template;
            $this.render();
          });

          //add route for security wise holding
          _app_route.route("Holding/security/:asset","Holding/security/",function(assetclass){
            if(!app.instance.dv.SecurityHoldingView)
            {
              app.instance.dv.SecurityHoldingView=new app.dv.SecurityHoldingView({el:"#maincontent","assetclass":assetclass});
            }
            else 
            {
              app.instance.dv.SecurityHoldingView.assetclass=assetclass;
              app.instance.dv.SecurityHoldingView.render();
            }  
          });     

          
        },
        
        render: function(){
          var assetObj=[],mainObj={};
          var clsarrow="fa fa-caret-up fa-3x"
          var clsbg="";
          this.$el.html(this.assetholdingpage||"Hey Mohini!!! ");
          //grouping on account
//          var $this=this;
          var accountfiltered=_.filter(app.dc.holdingCollection.toJSON(),function(vObj){console.log("Account number : "+this.accountnumber);if(vObj.accountid==this.accountnumber) return true;},{accountnumber:this.accountnumber})
          var groups=_.groupBy(accountfiltered,'assetclasscode');
          var total={gainloss:0,gainloss_perc:0,marketvalue:0}
          _.each(groups,function(group,key){
              total.marketvalue = _.reduce(group, function(memo, Obj){ return Big(memo).plus(Obj.marketvalue).toString(); }, 0);
              total.gainloss_perc = _.reduce(group, function(memo, Obj){ return Big(memo).plus(Obj.gainloss_perc).toString(); }, 0);
              if(total.gainloss_perc<0)
                clsarrow='fa fa-caret-down fa-3x'
              clsbg=(((assetObj.length+1)%2)==0?"bg-aqua":"bg-teal") 
              total.gainloss_perc=Math.abs(total.gainloss_perc)             
              assetObj[assetObj.length]={"assetclassname":group[0].assetclassname,"assetclass":key,"marketvalue":total.marketvalue,"gainloss_perc":total.gainloss_perc,"y":Number(total.marketvalue),"name":group[0].assetclassname,"clsbg":clsbg,"clsarrow":clsarrow}
          });

          mainObj={"tdata":assetObj}
          mainObj["commaSeparate"]=function () {
            return function (text, render) {
              return app.formatPrice.call(render(text));
            }
          }
          
          $("#asset_back").attr("href","#MyPortfolio/V1");
          var html=Mustache.to_html(this.assettpl,mainObj)          
          $("#assetlisting").html(html);
          app.trade.accountChartObj={"id":"#assetgraph","data":assetObj}          
        }
      })


app.dv.SecurityHoldingView=Backbone.View.extend({    
    initialize: function(options){
      var $this=this;
      this.assetclass=options.assetclass
      this.securitytpl=""
//      this.securitytpl='<div class="row"><div class="col-md-12 col-sm-12 col-xs-12"><div><a  href="#Holding/asset/{{accountnumber}}"><i class="fa fa-angle-left fa-5x cls-holding-backicon"></i><span class="cls-holdings-backbtn" >Back</span></a></div></div></div>'
      this.securitytpl=this.securitytpl+'{{#tdata}}<div class="row"><div class="col-md-12 col-sm-12 col-xs-12"><div class="box cls-holding-box-shadow">'
      this.securitytpl=this.securitytpl+'<div class="box-body {{clsbg}}"><div class="row"><div class="col-md-10 col-sm-10 col-xs-10">'
      this.securitytpl=this.securitytpl+'<div class="row"><div class="col-md-12 col-sm-12 col-xs-12"><label class="cls-lbl-holding-amt">${{#commaSeparate}}{{marketvalue}}{{/commaSeparate}}</label>'
      this.securitytpl=this.securitytpl+'</div></div><div class="row">'
      this.securitytpl=this.securitytpl+'<div class="col-md-12 col-sm-12 col-xs-12"><label class="cls-lbl-holding-desc" ><i>{{security_name}}</i></label></div>'
      this.securitytpl=this.securitytpl+'</div></div><div class="col-md-2 col-sm-2 col-xs-2">'
      this.securitytpl=this.securitytpl+'<span class="pull-right"><i class=\"{{clsarrow}}\"></i><br><label class="cls-lbl-holding-desc" >{{gainloss_perc}}%</label></span></div></div></div></div></div></div>{{/tdata}}'
  
      $.get(app.applicationurl+"app/template/holding/SecurityHolding.html", function(template){
        $this.securityholdingpage=template;
        $this.render();
      });
    },
    
    render: function(){
      var secObj=[],mainObj={};
      this.$el.html(this.securityholdingpage);
      //grouping on account
      var accountnumber=app.instance.dv.AssetHoldingView.accountnumber;
      var clsarrow="fa fa-caret-up fa-3x"
      var accountfiltered=_.filter(app.dc.holdingCollection.toJSON(),function(vObj){
        if(vObj.accountid==this.accountnumber && vObj.assetclasscode==this.assetclass) return true;}
        ,{"accountnumber":accountnumber,"assetclass":this.assetclass}
        )
      
      for(var i=0;i<accountfiltered.length;i++)
      {
        accountfiltered[i].y=Number(accountfiltered[i].marketvalue)
        accountfiltered[i].name=accountfiltered[i].security_name
        accountfiltered[i].clsbg=clsbg=((i%2)==0?"bg-aqua":"bg-teal")

        if(accountfiltered[i].gainloss_perc<0)
          accountfiltered[i].clsarrow='fa fa-caret-down fa-3x'
        else
          accountfiltered[i].clsarrow='fa fa-caret-up fa-3x'
        accountfiltered[i].gainloss_perc=Math.abs(accountfiltered[i].gainloss_perc)
      }
      app.trade.accountChartObj={"id":"#securitygraph","data":accountfiltered};
      mainObj={"tdata":accountfiltered,"accountnumber":accountnumber}
      mainObj["commaSeparate"]=function () {
        return function (text, render) {
          return app.formatPrice.call(render(text));
        }
      }
      $("#sec_back").attr("href","#Holding/asset/"+accountnumber)               
      var html=Mustache.to_html(this.securitytpl,mainObj)
      $("#securitylisting").html(html);          
    }
  })
    
//Holding Collection
app.dc.holdingCollection=new (app.dc._generic(
{
   _reload:app._reload
  ,data:{user_id:app.getData("_user_id")} 
  ,_service:"dataset"
  ,_methods:
  {
    read:"dataset/AllHolding"
  },
  parse: function (response, options) {
    return response.data
 }  
}))
 
app.onGetHolding=function(viewid,paramhtml)
{
  if(!app.instance.dv.HoldingView)
  {
   app.instance.dv.HoldingView=new app.dv.HoldingView({el:"#maincontent",paramhtml:paramhtml})
  }
  else
  {
   app.dc.holdingCollection.fetch({reset:true});
  } 
  
}


app.trade.onShowAccountHoldingChart=function(param)
{
  $('#holdinggraph a[data-toggle="tab"]').on('shown.bs.tab', function (e) {       
    app.createPieChart(param);    
    });
}

//User Account Models
app.dc.tradeaccounts = new (app.dc._generic(
 {
   _reload:app._reload
  ,data:{"_reload":app._reload}
  ,_service:"dataset"
  ,_methods:{
    read:"dataset/UserAccount"
 },
 parse: function (response, options) {
    return response.data
 }  
}))


//User currency
app.dc.tradecurrency = new (app.dc._generic(
{
   _reload:app._reload
  ,data:{"_reload":app._reload}
  ,_service:"dataset"
  ,_methods:{
    read:"dataset/tradecurrency"
},
parse: function (response, options) {
    return response.data
 }  
}))

app.dc.tradesecurity = new (app.dc._generic(
{
   _reload:app._reload
  ,data:{"_reload":app._reload}
  ,_service:"dataset"
  ,_methods:{
    read:"dataset/tradesecurity"
},
parse: function (response, options) {
    return response.data
 }  
}))

app.dm.trademodel = (app.dm._generic({
    idAttribute:"req_id"
    ,_methods: {
        create: "trade/OnSaveTransRequest"
    },
     initialize : function(){
      this.on("invalid",function(model,error){
      alert(error)
     });
    },
    
    validate: function (attrs) {
      
      var response=""
      if(attrs.assetclass=="CASH")
      {
        response=app.trade.validatefrmcash(attrs)
        if(response!="")
          return response;
      }
      else if(attrs.assetclass=="EQ")
      {
       response=app.trade.validatefrmequity(attrs)
        if(response!="")
          return response;
      }
      else if(attrs.assetclass=="FIS")
      {
        response=app.trade.validatefrmbond(attrs);
        if(response!="")
          return response;
      }
      else if(attrs.assetclass=="MF")
      {
        response=app.trade.validatefrmunitrust(attrs);
        if(response!="")
          return response;
      }      
    },
    parse:function(response){
      return null;
    }
}))

app.trade.goBackToHoldingPage=function()
{
  window.location.href="#MyPortfolio/V1"
}

app.trade.goBackToAssetHoldingPage=function()
{
  window.location.href="#Holding/asset/"+app.instance.dv.AssetHoldingView.accountnumber
}


app.trade.loadAccountHoldingView=function(_this)
{
  var accountObj=[],mainObj={}
  var total={gainloss:0,gainloss_perc:0,marketvalue:0}
  var clsarrow="fa fa-caret-up fa-3x"
  var clsbg="",$this=_this;
             
  $this.el.innerHTML = $this.holdingpage;             
  
  if(app.dc.holdingCollection.toJSON().length==0)
  {
    $("#_noholding").show();
    $("#_noholdingquote").html(quoteslist.getRandomQuote());
    $("#_withholding").hide()
    return;
  }             
  
  //grouping on account 
  var groups=_.groupBy(app.dc.holdingCollection.toJSON(), 'accountid');
  for(var key in groups)
  {
   total={gainloss:0,gainloss_perc:0,marketvalue:0}
   for(var i=0;i<groups[key].length;i++)
   {
    total.gainloss= Number(Big(total.gainloss).plus(groups[key][i].gainloss))
    total.gainloss_perc = Number(Big(total.gainloss_perc).plus(groups[key][i].gainloss_perc));
    total.marketvalue= Number(Big(total.marketvalue).plus(groups[key][i].marketvalue))  
   }
   if(total.gainloss_perc<0)
    clsarrow='fa fa-caret-down fa-3x'
  total.gainloss_perc=Math.abs(total.gainloss_perc)             
  clsbg=(((accountObj.length+1)%2)==0?"bg-aqua":"bg-teal")
  accountObj[accountObj.length]={"accountid":key,"gainloss":total.gainloss,"gainloss_perc":total.gainloss_perc,"marketvalue":total.marketvalue,"name":key,y:total.marketvalue,"clsbg":clsbg,"clsarrow":clsarrow}
  }
  mainObj={"tdata":accountObj}
  mainObj["commaSeparate"]=function () {
  return function (text, render) {
    return app.formatPrice.call(render(text));
  }
  }
  
  var html=Mustache.to_html($this.accountTpl,mainObj)
  $("#accountlisting").html(html);
  app.trade.accountChartObj={"id":"#accountinggraph","data":accountObj}
//  return this; 
};//Get the trade options template
app.instance.dv.TradeView=null;
app.instance.dv.TradeCashView=null
app.dv.TradeView = Backbone.View.extend({
    //
    initialize: function(attrs){
      var $this=this;
      $.get(attrs.paramhtml, function(template){
        $this.tradetpl=template;
        $this.render();
      });
     
      var tradeoption=["cash","equity","bonds","unittrust"];
      
      _.each(tradeoption, function(option) {
        _app_route.route("trade/:"+option,"trade/"+option,function(option){
          eval("app.trade.onOpen"+option+"Screen()");
        })
      });
    }
   ,render:function(){
      this.$el.html(this.tradetpl);
    }
})

//Cash View 
app.dv.TradeCashView= Backbone.View.extend({
    initialize: function(){
      var $this=this;
      this.optionTpl="{{#tdata}}<option value='{{code}}'>{{name}}</option>{{/tdata}}"
      $.get(app.applicationurl+"app/template/trade/cash.html", function(template){
        $this.tradecashtpl=template;
        $this.render();
     });
    },
    render:function(){
      this.$el.html(this.tradecashtpl);
      var $this=this;
            
        $("#frmcash #btndeposit").trigger("click");
        
        // Fetch user accounts
        app.addNumberMask(document.frmcash)
        app.dc.tradeaccounts.fetch({
           data:{"asset_class":"CASH"}
          ,success:function(response){
          var html=Mustache.to_html("<option disabled selected value=''>Please select account</option>"+$this.optionTpl,{"tdata":app.dc.tradeaccounts.toJSON()})
           $("#frmcash #txtacct").html(html);           
          }})
          
        //Fetch currency   
        app.dc.tradecurrency.fetch({
          success:function(){
            var html=Mustache.to_html("<option disabled selected value=''>Please select currency</option>"+$this.optionTpl,{"tdata":app.dc.tradecurrency.toJSON()})
            $("#frmcash #txtcurrency").html(html);           
          }
        })      
    }
    ,
    events:{
      "click #frmcash #btnplacereq":"saveCashDet",
      "click #frmcash #lbldeposit":"onDeposit",
      "click #frmcash #lblwithdraw":"onWithdrawal",
      "keypress #frmcash #txtamt":"checkNumberKeyPress"
    },
    saveCashDet:function(){
      app.trade.saveCashDet();
    },
    checkNumberKeyPress:function(e){      
      if(!app.checkNumberKeyPress(e))      
        return false;
    },
    onDeposit:function()
    {
      app.trade.onDeposit();
    },
    onWithdrawal:function()
    {
      app.trade.onWithdrawal();
    }
})


app.trade.onGettradeDetails=function(viewid,paramhtml)
{
//   if(!app.trade.TradeView)
//   {
    app.instance.dv.TradeView=new app.dv.TradeView({el:"#maincontent",paramhtml:paramhtml});   
//   }
  app.instance.dv.TradeView.render();                    
}
 
/**
 *@event      Display Cash screen.
**/
app.trade.onOpencashScreen=function()
{
   if(!app.instance.dv.TradeCashView)
    app.instance.dv.TradeCashView=new app.dv.TradeCashView({el:"#maincontent"});
   else
    app.instance.dv.TradeCashView.render();
}

//Save Cash details
app.trade.saveCashDet=function(){

  var vobj={};
  var $fieldRef;
  $("#frmcash [fieldname]").each(function() 
  {
    $fieldRef=$(this);
    vobj[$fieldRef.attr("fieldname")]= $fieldRef.prop("value")
  });   
  var cashmodel=new app.dm.trademodel(vobj);
  cashmodel.save(null,{success:function(model,response){
    if(response.status=="unsuccess")
      alert("Error while adding request")
    else
    {
      alert("Request has been added.")
      _app_route.navigate('Trade/V2', { trigger:true });
    }
        
  }
  ,error:function(model,error){
    alert("Opps something went wrong.Try again");
    console.log("Error : "+error);
  }});
}

//validate cash details
app.trade.validatefrmcash=function(){
  var vamt="",vtrans_type="",vbal="";
  var response =app.validateJQForm(document.frmcash)
  if(response.status=="unsuccess")
    return response.error;
        
  //vtrans_type=$("#frmcash #trans_type").prop("value")
  // if(vtrans_type=="CASH-OUT")
  //     {
  //       vamt=parseInt($("#frmcash #txtamt").prop("value"));
  //       vbal=parseInt($("#frmcash #txtbal").text());
       
  //       if(vamt>vbal)
  //       {
  //         return "Insufficient balance."
  //         alert("Withdrawal amount should be less than balance.")
  //         return false
  //       }
  //     }
      return "";
}

app.trade.onDeposit=function(){
  $("#frmcash #trans_type").prop("value","CASH-IN")
}

app.trade.onWithdrawal=function(){
  $("#frmcash #trans_type").prop("value","CASH-OUT")  
}

;app.instance.dv.TradeEquityView=null
app.dv.TradeEquityView= Backbone.View.extend({
    initialize: function(){
      var $this=this;
      this.optionTpl="{{#tdata}}<option value='{{code}}'>{{name}}</option>{{/tdata}}"      
      $.get(app.applicationurl+"app/template/trade/equity.html", function(template){
        $this.tradeequitytpl=template;
        $this.render();

        
      });
    },
    render:function(){
     this.$el.html(this.tradeequitytpl);
      var $this=this;        
      $("#frmequity #lblbuy").trigger("click");
      
        // Fetch user accounts
        app.dc.tradeaccounts.fetch({
          data:{"asset_class":"EQ"},
          success:function(response){
          var html=Mustache.to_html("<option disabled selected value=''>Please select account</option>"+$this.optionTpl,{"tdata":app.dc.tradeaccounts.toJSON()})
           $("#frmequity #txtequityacct").html(html);           
          }})
          
        //Fetch security   
        app.dc.tradesecurity.fetch({ data:{"assetclass":'EQ'},
          success:function(){
            var html=Mustache.to_html("<option disabled selected value=''>Please select security</option>"+$this.optionTpl,{"tdata":app.dc.tradesecurity.toJSON()})
            $("#frmequity #txtequitysecurity").html(html);           
          }
        })      
    },
    events:{
      "click #frmequity #btnplacereq":"onsaveEquityDet",
      "click #frmequity #lblbuy":"onEquityBuy",
      "click #frmequity #lblsell":"onEquitySell",
      "keypress #frmequity #txtequityamt":"checkNumberKeyPress",
      "keypress #frmequity #txtequityqty":"checkNumberKeyPress"
    },
    checkNumberKeyPress:function(e){      
      if(!app.checkNumberKeyPress(e))      
        return false;
    },
    onEquityBuy:function()
    {
      app.trade.onEquityBuy();
    },
      onEquitySell:function()
    {
      app.trade.onEquitySell();
    },
    onsaveEquityDet:function(){
      app.trade.onsaveEquityDet();
    }
})

app.trade.onOpenequityScreen=function()
{
   if(!app.instance.dv.TradeEquityView)
    app.instance.dv.TradeEquityView=new app.dv.TradeEquityView({el:"#maincontent"});
   else
    app.instance.dv.TradeEquityView.render();
}

app.trade.onEquityBuy=function()
{
 $("#frmequity #qtyblock").css("display","none") 
 $("#frmequity #amtblock").css("display","block") 
 $("#frmequity #txtequityqty").attr("validator","")
 $("#frmequity #txtequityamt").attr("validator","nonEmpty,number")
 $("#frmequity #trans_type").prop("value","EQ-BUY")
 app.addNumberMask(document.frmequity);

}
app.trade.onEquitySell=function()
{
 $("#frmequity #amtblock").css("display","none") 
 $("#frmequity #qtyblock").css("display","block") 
 $("#frmequity #txtequityqty").attr("validator","nonEmpty,number")
 $("#frmequity #txtequityamt").attr("validator","")
 $("#frmequity #trans_type").prop("value","EQ-SELL")
 app.addNumberMask(document.frmequity);
}
app.trade.onsaveEquityDet=function()
{
  var vobj={}
  var  $fieldRef;
//   if(!app.trade.validatefrmequity())
//     return;
   $("#frmequity [fieldname]").each(function() 
  {
      $fieldRef=$(this);
      vobj[$fieldRef.attr("fieldname")]= $fieldRef.prop("value")
  });   
  var equitymodel=new app.dm.trademodel(vobj);
  equitymodel.save(null,{success:function(model,response){
    if(response.status=="unsuccess")
      alert("Error while adding request")
    else
    {
      alert("Request has been added.")
      _app_route.navigate('Trade/V2', { trigger:true });
    }
        
  }
  ,error:function(model,error){
    alert("Opps something went wrong.Try again");
    console.log("Error : "+error);
  }});
  
}

app.trade.validatefrmequity=function(attrs){
  var response =app.validateJQForm(document.frmequity)
  if(response.status=="unsuccess")
    return response.error;
    
  return ""
};app.instance.dv.TradeBondView=null
app.dv.TradeBondView= Backbone.View.extend({
    initialize: function(){
      var $this=this;
      this.optionTpl="{{#tdata}}<option value='{{code}}'>{{name}}</option>{{/tdata}}"      
      $.get(app.applicationurl+"app/template/trade/bond.html", function(template){
        $this.tradebondtpl=template;
        $this.render();
      });
    },
    render:function(){
      this.$el.html(this.tradebondtpl);
      var $this=this      
      $("#frmbond #lblbuy").trigger("click");
             // Fetch user accounts
        app.dc.tradeaccounts.fetch({
          data:{"asset_class":"FIS"},
          success:function(response){
          var html=Mustache.to_html("<option disabled selected value=''>Please select account</option>"+$this.optionTpl,{"tdata":app.dc.tradeaccounts.toJSON()})
           $("#frmbond #txtbondacct").html(html);           
          }})          
        //Fetch currency   
        app.dc.tradesecurity.fetch({ data:{"assetclass":'FIS'},
          success:function(){
            var html=Mustache.to_html("<option disabled selected value=''>Please select security</option>"+$this.optionTpl,{"tdata":app.dc.tradesecurity.toJSON()})
            $("#frmbond #txtbondsecurity").html(html);           
          }
        })
    }
     ,events:{
      "click #frmbond #btnplacereq":"onsaveBondDet",
      "click #frmbond #lblbuy":"onBondBuy",
      "click #frmbond #lblsell":"onBondSell",
      "keypress #frmbond #txtbondamt":"checkNumberKeyPress",
      "keypress #frmbond #txtbondqty":"checkNumberKeyPress"
    },
    checkNumberKeyPress:function(e){      
      if(!app.checkNumberKeyPress(e))      
        return false;
    },
    onBondBuy:function()
    {
      app.trade.onBondBuy();
    },
      onBondSell:function()
    {
      app.trade.onBondSell();
    },
    onsaveBondDet:function(){
      app.trade.onsaveBondDet();
    }
})

app.trade.onOpenbondsScreen=function()
{
   if(!app.instance.dv.TradeBondView)
      app.instance.dv.TradeBondView=new app.dv.TradeBondView({el:"#maincontent"});
   else
      app.instance.dv.TradeBondView.render();
}
app.trade.onBondBuy=function()
{
 $("#frmbond #qtyblock").css("display","none") 
 $("#frmbond #amtblock").css("display","block") 
 $("#frmbond #txtbondqty").attr("validator","")
 $("#frmbond #txtbondamt").attr("validator","nonEmpty,number")
 $("#frmbond #trans_type").prop("value","FIS-BUY")
 app.addNumberMask(document.frmbond);

}
app.trade.onBondSell=function()
{
 $("#frmbond #amtblock").css("display","none") 
 $("#frmbond #qtyblock").css("display","block") 
 $("#frmbond #txtbondqty").attr("validator","nonEmpty,number")
 $("#frmbond #txtbondamt").attr("validator","")
 $("#frmbond #trans_type").prop("value","FIS-SELL")
 app.addNumberMask(document.frmbond);
}

app.trade.onsaveBondDet=function()
{
  var vobj={}
  var  $fieldRef;
//   if(!app.trade.validatefrmbond())
//     return;
  $("#frmbond [fieldname]").each(function() 
  {
      $fieldRef=$(this);
      vobj[$fieldRef.attr("fieldname")]= $fieldRef.prop("value")
  });   
  var bondmodel=new app.dm.trademodel(vobj);
  bondmodel.save(null,{success:function(model,response){
    if(response.status=="unsuccess")
      alert("Error while adding request")
    else
    {
      alert("Request has been added.")
      _app_route.navigate('Trade/V2', { trigger:true });
    }
  }
  ,error:function(model,error){
    alert("Opps something went wrong.Try again");
    console.log("Error : "+error);
  }});
  
}

app.trade.validatefrmbond=function(attrs){
  var response =app.validateJQForm(document.frmbond)
  if(response.status=="unsuccess")
    return response.error;

  return ""    
}


;app.instance.dv.TradeUnittrustView=null
app.dv.TradeUnittrustView= Backbone.View.extend({
    initialize: function(){
      var $this=this;
      this.optionTpl="{{#tdata}}<option value='{{code}}'>{{name}}</option>{{/tdata}}"      
      $.get(app.applicationurl+"app/template/trade/unittrust.html", function(template){
        $this.tradeunittrusttpl=template;
        $this.render();
            
      });
    },
    render:function(){
      this.$el.html(this.tradeunittrusttpl);
      var $this=this;
      $("#frmunittrust #lblsubscribe").trigger("click");
       // Fetch user accounts
        app.dc.tradeaccounts.fetch({
          data:{"asset_class":"MF"},
          success:function(response){
          var html=Mustache.to_html("<option disabled selected value=''>Please select account</option>"+$this.optionTpl,{"tdata":app.dc.tradeaccounts.toJSON()})
           $("#frmunittrust #txtunitacct").html(html);           
          }})
          
        //Fetch currency   
        app.dc.tradesecurity.fetch({
          data:{"assetclass":'MF'},
          success:function(){
            var html=Mustache.to_html("<option disabled selected value=''>Please select security</option>"+$this.optionTpl,{"tdata":app.dc.tradesecurity.toJSON()})
            $("#frmunittrust #txtunitfund").html(html);           
          }
        })
    },events:{
      "click #frmunittrust #btnplacereq":"onSaveUnitTrustDet",
      "click #frmunittrust #lblsubscribe":"onUnitsubscribe",
      "click #frmunittrust #lblredeem":"onUnitredeem",
      "keypress #frmunittrust #txtunitamt":"checkNumberKeyPress",
      "keypress #frmunittrust #txtunitqty":"checkNumberKeyPress"
    },
    checkNumberKeyPress:function(e){      
      if(!app.checkNumberKeyPress(e))      
        return false;
    },
    onUnitsubscribe:function()
    {
      app.trade.onUnitsubscribe();
    },
      onUnitredeem:function()
    {
      app.trade.onUnitredeem();
    },
    onSaveUnitTrustDet:function(){
      app.trade.onSaveUnitTrustDet();
    }
})

app.trade.onOpenunittrustScreen=function()
{
   if(!app.instance.dv.TradeUnittrustView)
    app.instance.dv.TradeUnittrustView=new app.dv.TradeUnittrustView({el:"#maincontent"});
   else
    app.instance.dv.TradeUnittrustView.render();
}
app.trade.onUnitsubscribe=function()
{
 $("#frmunittrust #qtyblock").css("display","none") 
 $("#frmunittrust #amtblock").css("display","block") 
 $("#frmunittrust #txtunitqty").attr("validator","").removeClass("iwebz-numbermask")
 $("#frmunittrust #txtunitamt").attr("validator","nonEmpty,number").addClass("iwebz-numbermask")
 $("#frmunittrust #trans_type").prop("value","MF-BUY")
 app.addNumberMask(document.frmunittrust);

}
app.trade.onUnitredeem=function()
{
 $("#frmunittrust #amtblock").css("display","none") 
 $("#frmunittrust #qtyblock").css("display","block") 
 $("#frmunittrust #txtunitqty").attr("validator","nonEmpty,number").addClass("iwebz-numbermask")
 $("#frmunittrust #txtunitamt").attr("validator","").removeClass("iwebz-numbermask")
 $("#frmunittrust #trans_type").prop("value","MF-SELL")
 app.addNumberMask(document.frmunittrust);
}
app.trade.onSaveUnitTrustDet=function()
{
  var vobj={}
  var  $fieldRef;
//   if(!app.trade.validatefrmunitrust())
//     return;
  $("#frmunittrust [fieldname]").each(function() 
  {
      $fieldRef=$(this);
      vobj[$fieldRef.attr("fieldname")]= $fieldRef.prop("value")
  });   
  var mfmodel=new app.dm.trademodel(vobj);
  mfmodel.save(null,{success:function(model,response){
    if(response.status=="unsuccess")
      alert("Error while adding request")
    else
    {
      alert("Request has been added.")
      _app_route.navigate('Trade/V2', { trigger:true });
    }
      
  }
  ,error:function(model,error){
    alert("Opps something went wrong.Try again");
    console.log("Error : "+error);
  }});

}

app.trade.validatefrmunitrust=function(attrs){
  var response =app.validateJQForm(frmunittrust)
  if(response.status=="unsuccess")
    return response.error;
  
  return "" 
};app.instance.dv.ContactView=null;
app.onGetContactUsDetails=function(viewid,paramhtml)
{
  if(!app.instance.dv.ContactView)
   app.instance.dv.ContactView=new app.dv.ContactView({el:"#maincontent",paramhtml:paramhtml})
  else
  {
    app.dm.contactModel.fetch();      
  }
//   app.dm.contactModel.fetch({
//     success:function()
//     {
//       app.instance.dv.ContactView.render();
//     }
//   });
}

app.dm.contactModel=new (app.dm._generic(
{
  _reload:app._reload
  ,data:{user_id:app.getData("_user_id")}
  ,defaults: {
          rm_id:""
        , name:""
        , personal_no:""
        , office_no:""
        , mail:""
   } 
  ,_service:"dataset"
  ,_methods:{
    read:"dataset/RMData"
  },
  parse: function (response, options) { 	
    return response.data[0]
  }  
}))

app.dv.ContactView = Backbone.View.extend({   
  initialize: function(attrs) {
    var $this=this;
    this.model=app.dm.contactModel
    this.model.on('sync',this.render,this);
    $.get(attrs.paramhtml, function(template){
      $this.template=template;
      $this.model.fetch()
//       {
//         success:function(){
//           $this.render();
//         }
//       });
    });
  },        
  render: function() {
    var contactpage=_.template(this.template);
    var vObj=this.model.toJSON();
    vObj.off_address=app.dm._appsettings.get("off_address")    
    this.$el.html(contactpage(vObj));
    if(vObj.name=="")
    {
      $("#frmcontactus #rmblck").hide();
      $("#frmcontactus #_norm").show();
    }
    else{
     $("#frmcontactus #rmblck").show();
      $("#frmcontactus #_norm").hide(); 
    }
    return this;
  }       
});

;app._settings={};
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
};app.instance.dv.UserProfileView=null;
app.userProfile={}
app.onGetUserProfile=function(viewid,paramhtml)
{
  if(!app.instance.dv.UserProfileView)
    app.instance.dv.UserProfileView=new app.dv.UserProfileView({el:"#maincontent",paramhtml:paramhtml})
  else  
    app.dm.userProfileModel.fetch({
      success:function()
      {
        app.instance.dv.UserProfileView.render();
      }
    });
}
app.dm.userProfileModel=new (app.dm._generic(
{
  _reload:app._reload
  ,idAttribute:"user_id" 
  ,_service:"dataset"
  ,_methods:{
    read:"dataset/UserProfile",
    update:"useradmin/onupdateuserprofile"
  },
  parse: function (response, options) {          
   if(response.status=="success" && response.vdata)
        return response.vdata[0]
  },

  validate:function(attrs){
    if(!app.dm.userProfileModel.changedAttributes(attrs))
    {
      app.instance.dv.UserProfileView.render();
      return "Nothing changed"
    }
     if(!app.validate('date',$("#frmprofile #dob")))     
        return "Invalid date of birth."
    if(!app.dobDateValidation($("#frmprofile #dob")))     
    {
      alert("Date of birth cannot exceed current date.")
       return "Date of birth cannot exceed current date."
    }          
  }  
}))

app.dv.UserProfileView = Backbone.View.extend({   
  initialize: function(attrs) {    
    var $this=this;    
    this.model=app.dm.userProfileModel
    $.get(attrs.paramhtml, function(template){
      $this.template=template;        

    app.dm.userProfileModel.fetch(
    {
      success:function()
      {
        $this.render();
      }
    });
    });
  },        
  render: function() {    
    var profilepage=_.template(this.template);
    this.$el.html(profilepage(this.model.toJSON()));
    app.createCalendar($('#frmprofile'))        
    return this;
  },
  events:{
    'click #frmprofile #btneditdetail':'userProfileEdit',
    'click #frmprofile #btnsaveprofile':'userProfileSave',
    'click #frmprofile #btncancel':'userProfileCancel',
     "keypress #frmprofile #txtmob":"checkNumberKeyPress"     
  },
   checkNumberKeyPress:function(e){      
      if(!app.checkNumberKeyPress(e))      
        return false;
    },
      
  userProfileEdit:function(){
    $('#frmprofile #editdetails').css("display",'block');
    $('#frmprofile #showdetails').css("display",'none');

  },
  userProfileSave:function(){        
      app.userProfile.userProfileSave()
  },
  userProfileCancel:function(){
    app.userProfile.userProfileCancel()
  }

});
app.userProfile.userProfileSave=function(){
  var vobj={};
  var $fieldRef;
  $("#frmprofile [fieldname]").each(function() 
  {
      $fieldRef=$(this);
      vobj[$fieldRef.attr("fieldname")]= $fieldRef.prop("value")
  });   
  app.dm.userProfileModel.save(vobj,{
     success:function(model,response){
      if(response.status=="success")
      {
        app.instance.dv.UserProfileView.render();
      }
      else
      {
        alert("Unable to save the details.Please try again.")
        app.dm.userProfileModel.set(app.dm.userProfileModel.previousAttributes())          
      }               
     } 
    })
}
app.userProfile.userProfileCancel=function(){
  app.instance.dv.UserProfileView.render();
}


;app.fp={}
app.instance.dv.financialPView=null;

app.dv.financialPView = Backbone.View.extend({   
 initialize: function(attrs) {   
 	var $this=this;
    $.get(attrs.paramhtml, function(template){
      $this.template=template;
      $this.render();     
      app.fp.risktpl()
      app.dc.riskmaster.fetch();
    });
    //Create route for risk profile result

  _app_route.route("FinancialPlanning/result/:riskprofile","FinancialPlanning/result",function(riskprofile){
    app.instance.dv.RPAllocation=new app.dv.RPAllocation({"riskprofile":riskprofile,el:"#maincontent"})
  });
     
    
  },        
  render: function() {    	       
    this.$el.html(this.template);  
    return this;
  },
  events:{
    "click #btnRPNext":"goToNextQuest",
    "click #btnRPPrev":"goToPrevQuest",
    "click #frmriskprofile input":"calculateProgress",
    "click #frmriskprofile #btnRPSubmit":"onSubmitRiskProfile"
  },
  goToNextQuest:function(){
    app.fp.goToNextQuest();
  },
  goToPrevQuest:function(){
    app.fp.goToPrevQuest();
  },
  calculateProgress:function(e){
    app.fp.calculateProgress(e);
  },
  onSubmitRiskProfile:function(e)
  {
    app.fp.onSubmitRiskProfile();
  }
})

app.dv.RPAllocation = Backbone.View.extend({   
 initialize: function(attrs) {   
 	  var $this=this;
    this.riskprofile=attrs.riskprofile
    $.get(app.applicationurl+"app/template/financialplanning/ModelPortfolio.html", function(template){
      $this.template=template;
      $this.render();
    });
  },        
  render: function() {    	       
    this.$el.html(this.template);
    app.fp.createRPAllocationCharts(this,this.riskprofile);  
    return this;
  },
  events:{
    "click #btnRecalculate":"onRecalculate"
  },
  onRecalculate:function()
  {
    _app_route.navigate('FinancialPlanning/V3', { trigger: true });
  }
})

//Model portfolio allocation
app.dc.RPAllocation=(app.dc._generic(
{   
  _methods: {
      read: "dataset/riskprofileallocation"
  }   
  ,parse:function(response){
        if(response.vdata.status && response.vdata.status=="unsuccess")
          return {}
        else return response.vdata.data
  }      
}))

//Risk Profile Question Collection
app.dc._financialPQuestion=new (app.dc._generic(
  {   
    data:{user_id:app.getData("_user_id")} 
    ,_methods: {
        read: "dataset/riskquestion"
    }   
    ,parse:function(response){
          if(response.vdata.status && response.vdata.status=="unsuccess")
            return {}
          else return response.vdata.data
    }      

  }))
  
//Risk Profile Question Collection
app.dc.riskmaster=new (app.dc._generic(
{   
  _methods: {
      read: "dataset/riskdefn"
  }   
  ,parse:function(response){
        if(response.vdata.status && response.vdata.status=="unsuccess")
          return {}
        else return response.vdata.data
  }      
}))

  
  
//Risk Profile Answer Collection  
app.dc._financialPAnswer=new (app.dc._generic(
{  
  data:{user_id:app.getData("_user_id")} 
  ,_methods: {
      read: "dataset/riskanswer"
  }
  ,parse:function(response){    
      if(response.status=="success" && response.vdata)
      {
        if(response.vdata.status && response.vdata.status=="unsuccess")
          return {}
        else return response.vdata.data
      }
      
  }   
}))

app.onGetFinancialPlanning=function(viewid,paramhtml)
{ 
   if(!app.instance.dv.financialPView) 
    app.instance.dv.financialPView=new app.dv.financialPView({el:"#maincontent",paramhtml:paramhtml})
   else
   {
    app.instance.dv.financialPView.render();
    app.fp.risktpl()
    app.dc.riskmaster.fetch();
   } 
}

app.fp.risktpl=function(_this)
{
  var riskqtn;
  app.dc._financialPQuestion.fetch(
  {
    success:function(model,response)
    {
       riskqtn=model.toJSON()
       app.dc._financialPAnswer.fetch(
       {            
          success:function(model,response)
          {
            var html="",divRef=null
//            _this.render();
            html=app.fp.createQAhtml(riskqtn,model)
            $("#riskprofile").html(html)
            $("#qtn_attempt").html("0 of "+riskqtn.length+" answered");   
            divRef=$("#frmriskprofile .cls-rp-qtnansblock").first()
            if(divRef.length!=0)
              divRef.addClass("active");
             $('html, body').animate({
                  scrollTop:divRef.offset().top-50
              }, 100);    
            return html;
          }
       })      
     }
  })
}


app.fp.createQAhtml=function(qmodel,amodel)
{
  var vhtml=[]
  var riskAnsArr=[]
  for(var i=0;i<qmodel.length;i++)
  {
    vhtml[vhtml.length]='<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 cls-rp-qtnansblock" id="Q'+qmodel[i].option_id+'">'
    vhtml[vhtml.length]='<label class="cls-rp-qtn">'+(i+1)+". "+qmodel[i].option_name+'</label>' 
    riskAnsArr=_.filter(amodel.toJSON(),function(vObj){if(vObj.option_id==this.option_id)return true;},{option_id:qmodel[i].option_id})
    for(var j=0;j<riskAnsArr.length;j++)
    {
      if(qmodel[i].multi_select=="Y")
        vhtml[vhtml.length]='<div class="checkbox cls-rp-ans"><label><input type="checkbox" _others="'+riskAnsArr[j].is_others+'" name="AQ'+qmodel[i].option_id+'" id="AQ'+riskAnsArr[j].srno+'" class="cls-rp-inptcntrl" value="'+riskAnsArr[j].weight+'">'+riskAnsArr[j].value_name+'</label>'
      else
        vhtml[vhtml.length]='<div class="radio cls-rp-ans"><label><input type="radio" class="cls-rp-inptcntrl"  _others="'+riskAnsArr[j].is_others+'" name="AQ'+qmodel[i].option_id+'" id="AQ'+riskAnsArr[j].srno+'" value="'+riskAnsArr[j].weight+'">'+riskAnsArr[j].value_name+'</label>'

      if(riskAnsArr[j].is_others=="Y")
          vhtml[vhtml.length]='<br><input class="form-control input-lg login-input" type="text"  name="txtAQ'+qmodel[i].option_id+'" id="txtAQ'+riskAnsArr[j].srno+'" value="">'
      vhtml[vhtml.length]='</div>'
    }
    if(qmodel[i].multi_select=="Y")
    {
      vhtml[vhtml.length]='<div class="checkbox cls-rp-ans"><label><input type="button" onclick="app.fp.goToNextQuest();" value="OK" name="btnok'+qmodel[i].option_id+'" id="btnok'+qmodel[i].option_id+'" class="btn btn-block btn-primary"></label> </div>'      
    }  
    if(qmodel.length-1==i)
      vhtml[vhtml.length]='<div style="margin-top:100px;" id="divsubmit"><button type="button" id="btnRPSubmit" class="btn btn-block btn-primary btn-lg">Submit</button></div>'
    vhtml[vhtml.length]='</div>'
  }
  return   vhtml.join(" ");
}


/**
 *@event      app.fp.goToNextQuest.
 *@desc       Go to next question
 *@author     Mohini
 *@dated      28-09-2016 12:25:12 PM
 **/
app.fp.goToNextQuest=function(currID)
{
  var nextRefid="",nextRef=null,activeRef=null;
  if(currID)
    nextRef=$("#frmriskprofile #"+currID).next(".cls-rp-qtnansblock");
  else
  {
    activeRef=$("#frmriskprofile .cls-rp-qtnansblock.active");
    nextRef=activeRef.next(".cls-rp-qtnansblock")
  }
  if(nextRef.length!=0)
  {
    $("#frmriskprofile .cls-rp-qtnansblock").removeClass("active");
    nextRef.addClass("active");
    nextRefid=nextRef.attr("id");
    $('html, body').animate({
        scrollTop:$("#"+nextRefid).offset().top-50
    }, 1000);    
  }
  else
  {
    $('html, body').animate({
      scrollTop:$("#divsubmit").offset().top
    }, 500);    
  }
}

/**
 *@event      app.fp.goToNextQuest.
 *@desc       Go to next question
 *@author     Mohini
 *@dated      28-09-2016 12:25:12 PM
 **/
app.fp.goToPrevQuest=function()
{
  var prevRefid="";
  var prevRef=$("#frmriskprofile .cls-rp-qtnansblock.active").prev(".cls-rp-qtnansblock")
  if(prevRef.length!=0)
  {
    $("#frmriskprofile .cls-rp-qtnansblock").removeClass("active");
    prevRef.addClass("active");
    prevRefid=prevRef.attr("id");
    $('html, body').animate({
        scrollTop:$("#"+prevRefid).offset().top-50
    }, 1000);    
  }
}

/**
 *@event      app.fp.calculateProgress.
 *@desc       Calcualte progress
 *@author     Mohini
 *@dated      28-09-2016 2:48:49 PM
**/
app.fp.calculateProgress=function(e)
{
  var QACount=app.dc._financialPQuestion.length
  var ansCount=0,ansflag=false;
  var targetRef=null,otherRef;
  targetRef=$("#"+e.target.id);
  $("#frmriskprofile .cls-rp-qtnansblock").removeClass("active");
  targetRef.parents(".cls-rp-qtnansblock").addClass("active")
  $("#frmriskprofile .cls-rp-qtnansblock").each(function( index ) {
    ansflag=$("#frmriskprofile [name=A"+this.id+"]").is(":checked");
    if(ansflag)
      ansCount++;
  });
  $("#frmriskprofile #txtanswercount").prop("value",ansCount)
  var progressperc=Math.ceil(ansCount/QACount*100)
  $("#progressbar").css("width",progressperc+"%")
  $("#qtn_attempt").html(ansCount+" of "+QACount+" answered");  
  
  if(targetRef.attr("_others")=="Y" || targetRef.attr("type")=="checkbox")
  {
    otherRef=$("#txt"+e.target.id)
    if(otherRef.length!=0)
      otherRef.focus();
  }
  else  
    app.fp.goToNextQuest(this.id);   
}

app.fp.onSubmitRiskProfile=function()
{
  var ref=null,weight=0,riskprofile=""
  var riskmaster=app.dc.riskmaster.toJSON();
  var ansCnt=$("#frmriskprofile #txtanswercount").prop("value")
  
  if(ansCnt!=app.dc._financialPQuestion.length)
  {
    alert("Please answer all the question.");
    return;
  }
  
  $("#frmriskprofile input").each(function( index ) {
    ref=$(this);
    if(ref.is(":checked"))
      weight=weight+ Number(ref.prop("value"))
  });
  
  for(var i=0;i<riskmaster.length;i++)
  {
    if(weight>riskmaster[i].weight_min && weight<riskmaster[i].weight_max)
    {
      riskprofile=riskmaster[i].riskprofile_name
      break;    
    }
  }
  _app_route.navigate('FinancialPlanning/result/'+riskprofile, { trigger:true });
//  app.fp.RPAllocation=new app.dv.RPAllocation({"riskprofile":riskprofile,el:"#maincontent"})
}

app.fp.createRPAllocationCharts=function(_viewRef,riskprofile)
{
  app.fp.RPAllocationCol=new app.dc.RPAllocation()
  app.fp.RPAllocationCol.fetch({
   data:{"riskprofile":riskprofile}
  ,success:function(model,response){
    var secwise=[],sectorwise=[],assetwise=[],chartObj={};
    
    //securitywise allocation
    var groups=_.groupBy(model.toJSON(),'securitysymbol');
    var totalweight=0;
    for(var key in groups)
    {
      for(var i=0;i<groups[key].length;i++)
      {
        totalweight=Number(Big(totalweight).plus(groups[key][i].sec_weight))
      }
      
      secwise[secwise.length]={"name":groups[key][0].securitysymbol,"y":totalweight}            
    }
    
    //sectorwise allocation
    groups=_.groupBy(model.toJSON(),'industry');
    totalweight=0;
    for(var key in groups)
    {
      for(var i=0;i<groups[key].length;i++)
        totalweight=Number(Big(totalweight).plus(groups[key][i].sec_weight))
      sectorwise[sectorwise.length]={"name":groups[key][0].industryname,"y":totalweight}            
    }
    
    //assetwise allocation
    groups=_.groupBy(model.toJSON(),'asset_class_code');
    totalweight=0;
    for(var key in groups)
    {
      for(var i=0;i<groups[key].length;i++)
        totalweight=Number(Big(totalweight).plus(groups[key][i].sec_weight))
      assetwise[assetwise.length]={"name":groups[key][0].asset_class_name,"y":totalweight}            
    }
    $("#info_riskprofile").html(riskprofile)
    chartObj={"id":"#securitywise_chart","data":secwise}
    app.createPieChart(chartObj);
    chartObj={"id":"#sectorwise_chart","data":sectorwise}
    app.createPieChart(chartObj);
    chartObj={"id":"#asset_chart","data":assetwise}
    app.createPieChart(chartObj);    
   }
  })  
}

;app.newsfeed={}
app.dc._newsfeed=(app.dc._generic(
  {   
    data:{user_id:app.getData("_user_id")} 
    ,_methods: {
        read: "dataset/newsfeed"
    }   
    ,parse:function(response){  
		if(response.status=="success" && response.vdata)                
          return response.vdata
    }      
  }))
app.onGetNewsFeed =function()
{
 app.newsfeed._newsfeedCol=new app.dc._newsfeed();
 app.newsfeed._newsfeedCol.fetch({
   	success:function(model){
   		var vhtml=""
   		vhtml='<ul class="cls-newsfeed-ul">{{#data}}<li><a href="{{url}}" target="_blank">{{title}}</a></li>{{/data}}</ul>'
   		vhtml=Mustache.to_html(vhtml,{"data":model.toJSON()})   		
   		$("#maincontent").html(vhtml);   
   	}
   });	
}
