app.instance.dv.TradeEquityView=null
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
      "click #frmequity #btnSummary":"onSummaryEquityDet",
      "click #frmequity #btnModifyreq":"onModifyEquityDet",

      "click #frmequity #lblbuy":"onEquityBuy",
      "click #frmequity #lblsell":"onEquitySell",
      "keypress #frmequity #txtequityamt":"checkNumberKeyPress",
      "keypress #frmequity #txtequityqty":"checkNumberKeyPress",

      "focusout #frmequity #txtequityqty":"computeQuantity",
      "focusout #frmequity #txtequityprice":"computeQuantity"
    },
    checkNumberKeyPress:function(e){
      if(!app.checkNumberKeyPress(e))      
        return false;
    },
    computeQuantity: function(){
      app.trade.computeQuantity();
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
    },
    onSummaryEquityDet:function(){
      app.trade.onSummaryEquityDet();
    },
    onModifyEquityDet:function(){
       app.trade.onModifyEquityDet();
    }
})

app.trade.onOpenequityScreen=function()
{
   if(!app.instance.dv.TradeEquityView)
    app.instance.dv.TradeEquityView=new app.dv.TradeEquityView({el:"#maincontent"});
   else
    app.instance.dv.TradeEquityView.render();
}

app.trade.computeQuantity=function(){
 var qty = $('#txtequityqty').val().replace(/\,/g,'');
 var price = $('#txtequityprice').val().replace(/\,/g,'');


 var amnt = 0;
 if(qty != ''  &&  price != ''){
    $('#txtequityamt').attr('disabled','disabled')
    amnt = Number(Big(price).times(qty));
    $('#txtequityamt').val(amnt);
  }
  else{
    $('#txtequityamt').removeAttr('disabled','disabled')
  }
 
}

app.trade.onEquityBuy=function()
{
 //$("#frmequity #qtyblock").css("display","none")  -- qty will display in both buy and sell
 $("#frmequity #amtblock").css("display","block") 
 $("#frmequity #txtequityqty").attr("validator","")
 $("#frmequity #txtequityamt").attr("validator","number")
 $("#frmequity #trans_type").prop("value","4")
 app.addNumberMask(document.frmequity);
}

app.trade.onEquitySell=function()
{
 //$("#frmequity #amtblock").css("display","none") 
 $("#frmequity #qtyblock").css("display","block") 
 $("#frmequity #txtequityqty").attr("validator","number")
 $("#frmequity #txtequityamt").attr("validator","")
 $("#frmequity #trans_type").prop("value","5")
 app.addNumberMask(document.frmequity);
}


app.trade.onsaveEquityDet=function()
{

    if(app.trade.equitymodel == undefined){
        var vobj={}
        var  $fieldRef;
        $("#frmequity [fieldname]").each(function() 
        {
            $fieldRef=$(this);
            vobj[$fieldRef.attr("fieldname")]= $fieldRef.prop("value")
        });   

          app.trade.equitymodel = new app.dm.trademodel(vobj); 
      }

     app.trade.equitymodel.save(null, {success:function(model,response){
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

app.trade.onSummaryEquityDet=function()
{
  var vobj={}
  var  $fieldRef;
  var trans_type = '';
  var order_type = '';
   $("#frmequity [fieldname]").each(function() 
  {
      $fieldRef=$(this);
      vobj[$fieldRef.attr("fieldname")]= $fieldRef.prop("value")
  });   
    
    app.trade.equitymodel =new app.dm.trademodel(vobj);
    var resp= app.trade.equitymodel.validate(vobj)    
    
    if(resp)
      alert(resp)
    else
    {
      $('#orderSummary ul').html('');
      var tmpl = '';

      var fieldVal = '';
   
     trans_type= ($('#trans_type').val() == 4) ? 'Buy' : 'Sell';

     tmpl += '<li><strong>Trans Type</strong>  <span>'+trans_type+'</span></li>'
     
      $("#frmequity [fieldname]:visible").each(function() 
      {
          $fieldRef=$(this);
          $fieldLabel=$(this).parents('.form-group').find('label').text();

          if($fieldRef.prop("value") == ''){
              fieldVal = '-';
          }
          else if($fieldRef.prop("value")==0){
            fieldVal = 'Market'
          }
          else if($fieldRef.prop("value")==1){
            fieldVal = 'Limit'
          }
          else{
            fieldVal = $fieldRef.prop("value");
          }


          tmpl += '<li><strong>'+$fieldLabel+'</strong>'
          tmpl += '<span>'+fieldVal+'</span></li>'

      }); 
      $('#orderSummary ul').append(tmpl);

      $('#euqityForm').hide();
      $('#orderSummary').show();
    }
  
}

app.trade.onModifyEquityDet = function(){
  $('#euqityForm').show();
  $('#orderSummary').hide();
}


app.trade.validatefrmequity=function(attrs){
  var response =app.validateJQForm(document.frmequity)
  if(response.status=="unsuccess")
    return response.error;
    
  return ""
}