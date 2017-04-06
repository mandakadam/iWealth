app.instance.dv.TradeBondView=null
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
 $("#frmbond #trans_type").prop("value","4")
 app.addNumberMask(document.frmbond);

}
app.trade.onBondSell=function()
{
 $("#frmbond #amtblock").css("display","none") 
 $("#frmbond #qtyblock").css("display","block") 
 $("#frmbond #txtbondqty").attr("validator","nonEmpty,number")
 $("#frmbond #txtbondamt").attr("validator","")
 $("#frmbond #trans_type").prop("value","5")
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


