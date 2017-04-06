app.instance.dv.TradeUnittrustView=null
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
}