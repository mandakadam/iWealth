app.instance.dv.ContactView=null;
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

    $.each(vObj, function(k, v) {
       if(v===""){
          $('#'+k).hide();
        }
    });


    return this;
  }       
});

