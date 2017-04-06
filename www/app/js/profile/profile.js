app.instance.dv.UserProfileView=null;
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

      $("#frmprofile [fieldname]").each(function() 
      {
          $fieldRef=$(this);
          if($fieldRef.prop("value") == ''){
              $('#profile_ref_'+$fieldRef.attr("fieldname")).hide();
          }
      }); 
      
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


