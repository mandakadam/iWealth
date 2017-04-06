//Get the trade options template
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

