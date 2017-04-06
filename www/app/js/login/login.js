app._reload=false
app.login={}
app.instance.dv.loginview=null
var mypos = $(window).scrollTop();
var up = false;
var newscroll;

$(document).ready(function(){

  $(document).ajaxError(function(event, response, settings){
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
        $("#logincontent").hide();
        $('body').removeClass('login-page');
        var mp = new MainPageView({el:"#mainpagecontent"});
        mp.render();
        app.main.getModuleList();
        app.main.getModuleShortList();
        app.getUserSettings();
      },
      forgetPassword:function()
      {
        new fgtPassView({el:"#logincontent"});
      }
  });


  //MainPage View
   MainPageView = Backbone.View.extend({
        events:{
          'click .easy-sidebar-toggle': 'sidebarShow',
          'click .easy-sidebar-toggle.active': 'sidebarClose',
          'click .overlayNav': 'sidebarClose',
          'click .easy-sidebar': 'sidebarClose'
        },    
        initialize: function() {
//            _.bindAll(this, "render")
            this.mainpage = $("#mainpagetemplate").html(); 

           // _.bindAll(this, 'detect_scroll');
            $(window).scroll(this.detect_scroll);      
        },        
        render: function() {
            $(this.el).html(this.mainpage).show();            
            return this;
        },
        sidebarShow: function(){
          app.sidebarShow();
        },
        sidebarClose: function(){
          app.sidebarClose();
        },
        detect_scroll: function() {
           var sticky = $('.sticky', this.$el);
           //app.fixHeader(sticky);  
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
          $("#mainpagecontent").hide();
          $("#logincontent").show();
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
}


app.sidebarShow = function(){
    $('html,body').animate({scrollTop: 0},100);
    $('.easy-sidebar-toggle').addClass("active");
    $('html').addClass('easy-sidebar-active');
    $('#mWrapper').addClass('toggled');
    $('.navbar.easy-sidebar').addClass('toggled');
    $('.overlayNav').show();
}

app.sidebarClose = function(){
   $('.easy-sidebar-toggle').removeClass("active");
      $('html').removeClass('easy-sidebar-active');
      $('#mWrapper').removeClass('toggled');
      $('.navbar.easy-sidebar').removeClass('toggled');
      $('.overlayNav').hide();
}


$(document).on('swiperight swipeleft', function(e){
    if(e.type == 'swipeleft')
        app.sidebarClose();
    else if(e.type == 'swiperight')
        app.sidebarShow();
});

app.fixHeader = function(sticky) {
  if ( $(window).scrollTop() > 110) {
      $('.header').hide();
      sticky.addClass('fixed');
  } else{
    $('.header').show();
      sticky.removeClass('fixed');
  }
};

if ($('#back-to-top').length) {
  var scrollTrigger = 100;
    var  backToTop = function () {
        if (mypos > scrollTrigger) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    };
    backToTop();
    $(window).on('scroll', function () {
        backToTop();
    });
    $('#back-to-top').on('click', function (e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: 0
        }, 700);
    });
}

