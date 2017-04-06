app.main={}
app.main.getModuleList=function()
{
 app.dc.modlistCollection=new (app.dc._generic(
 {
   _reload:app._reload
  ,_service:"dataset"
  ,_methods:{
    read:"dataset/modulelist"
  },
 parse: function (response, options) {
  if(response.status=="success")
    return response.modules.data
  else
    return {}
 }  
 }))
  
 app.dc.modlistCollection.fetch({
    success:function(Obj,response){
      var modlist=app.dc.modlistCollection.toJSON();
      var template='{{#tdata}}<li id="module_{{viewid}}"><a href="#{{route}}/{{viewid}}"><i class="fa {{image_path}}"></i> <span>{{viewname}}</span></a></li>{{/tdata}}'
      var html=Mustache.to_html(template,{"tdata":modlist})
      html=html+'<li id="module_V9" class="logout" onclick="app.onUserLogout();"><span class="logout"><i class="fa fa-power-off"></i> <span>Logout</span></span></li>'
      $("#_sidebar-menu").html(html);
      
      var onload=""
      for(var i=0;i<modlist.length;i++)
      {
        onload=modlist[i].onload||"getmodlist"+i;
        _app_route.route(modlist[i].route+"/:number",modlist[i].route+"/"+modlist[i].viewid,function(number){
          var vObj=_.filter(app.dc.modlistCollection.toJSON(),function(Obj){
            if(Obj.viewid==number)
              return Obj.onload
          })
          if(vObj.length!=0)
          {
            $("body").removeClass('sidebar-open').removeClass('sidebar-collapse').trigger('collapsed.pushMenu');            
            eval(""+vObj[0].onload+"('"+number+"','"+app.applicationurl+""+vObj[0].paramhtml+"')");
            app.setActiveTab(number,vObj[0].viewname);
          }

        });
      }
      _app_route.navigate(app.dm._appsettings.get("defaultview"), { trigger: true });

      app.main.getModuleShortList(modlist);


//       _app_route.route("Logout1","Logout1",function(){
//           app.onUserLogout();
//       });
       
//       if(app.dm._appsettings.get("defaultview"))
//         setTimeout(function(){ _app_route.navigate(app.dm._appsettings.get("defaultview"), { trigger: true }); }, 2000);
    }
  });  
}

app.main.getModuleShortList = function(modlist){
      var template='';
      template='{{#tdata}}'
      template += '<li class="listing" id="shortNavList_{{viewid}}">';
        template += '<a title="{{viewname}}" href="#{{route}}/{{viewid}}">';
          template += '<span class="listing_icon"><i class="fa {{image_path}}"></i></span>';
          template += '<h3 class="listing_heading hidden-xs">{{viewname}}</h3>';
        template += '</a>'; 
      template += '</li>';  
      template += '{{/tdata}}';
     var html=Mustache.to_html(template,{"tdata":modlist});
      $("#shortNavList").html(html);
}

app.setActiveTab=function(viewid,viewname)
{
  $("#_sidebar-menu li").removeClass("active")
  $("#module_"+viewid).addClass("active")

  $("#shortNavList li").removeClass("active")
  $("#shortNavList_"+viewid).addClass("active")

  $("#viewtitle").html(viewname);
  $("#viewtitle").attr('href', '#'+viewname+'/'+viewid);

  if(viewid == "V1"){       
       $("#compLogo").show(); 
       $("#viewtitle").hide();
  }
  else{
       $("#compLogo").hide(); 
       $("#viewtitle").show();
   }
}
app.onUserLogout=function()
{
  window.confirm("Information",'Are you sure you want to logout?', function(result){
      if(result) {
          app.onLogout();
      }
  });
          
//  app.onLogout();
}

/**
 *@event      app.onLogout.
 *@desc       Logout user
**/
app.onLogout=function()
{
  	app.sendRequest({
  		   		url: 'REST/update/apiticket/userlogout',
  		   		fn: function(response){
            
              response=eval('('+response+')');
              if(response.status=="success")
              {
                app.login.backtoScreen();
                return;
              }
              else
              {
                alert("Unable to logout.");
                return;              
              }
             },
  		   		async: true,
  		   		data: { 
                    "_ticket":app.getData("_ticket")
        		   		}
  		});
}


app.toggleListing = function(self){
  if($(self).hasClass('active')){
    console.log('d')
    $(self).removeClass('active');
    $(self).next().slideUp(200);
    $('.content').removeClass('btmPadding');
  }else{
    console.log('q')
     $(self).addClass('active');
     $(self).next().slideDown(200);
    $('.content').addClass('btmPadding');
  }
}
