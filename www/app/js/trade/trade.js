//Holding View
app.trade={}
var sumTotal={}
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
          
         
          var accountTpl= ''
         
          accountTpl+='{{#tdata}}'

          accountTpl+='<a class="listHolding {{clsbg}}" href="#Holding/asset/{{accountid}}">'
          accountTpl+='<div class="col-xs-6">'
            //accountTpl+='<span class="marketvalue"><i class="fa ico_{{lcy}}"></i> {{#commaSeparate}}{{marketvalue}}{{/commaSeparate}}</span>'
            accountTpl+='<span class="marketvalue"><i class="fa ico_{{lcy}}"></i> {{#commaSeparate}}{{#kFormatter}}{{marketvalue}}{{/kFormatter}}{{/commaSeparate}}</span>'
         //   accountTpl+='<span class="lcy"><i class="fa fa-rupee"></i>' 
              accountTpl+='<span class="lcy">' 
               // accountTpl+='<span><i class="fa ico_{{pcy}}"></i> {{#commaSeparate}}{{pcy_marketvalue}}{{/commaSeparate}}</span>'
               accountTpl+='<span><i class="fa ico_{{pcy}}"></i> {{#commaSeparate}}{{#kFormatter}}{{pcy_marketvalue}}{{/kFormatter}}{{/commaSeparate}}</span>'
              accountTpl+='</span>'
          accountTpl+='</div>'
          accountTpl+='<div class="col-xs-5">'
            accountTpl+='<span class="accName">AC: <span>{{accountid}}</span></span>'
            accountTpl+='<div class="listBlock">'
                accountTpl+='<span class="gainloss_perc"><i class="{{clsarrow}}"></i> {{gainloss_perc}}%</span>'
            accountTpl+='</div>'    
          accountTpl+='</div>'

          accountTpl+='<div class="holdingLink">'
            accountTpl+='<i class="fa fa fa-angle-right"></i>'
          accountTpl+='</div>'
        accountTpl+='</a>'

         /* accountTpl+='<a class="listHolding {{clsbg}}" href="#Holding/asset/{{accountid}}">'

          accountTpl+='<div class="col-xs-6">'
            accountTpl+='<span class="marketvalue">${{#commaSeparate}}{{marketvalue}}{{/commaSeparate}}</span>'
            accountTpl+='<span class="lcy"><i class="fa fa-rupee"></i> <span>{{#commaSeparate}}1273356{{/commaSeparate}} </span></span>'
            accountTpl+='<span class="accName">Account: <span>{{accountid}}</span></span>'
          accountTpl+='</div>'

          accountTpl+='<div class="col-xs-2 pull-right holdingLink">'
            accountTpl+='<i class="fa fa-angle-right"></i>'
          accountTpl+='</div>'

          accountTpl+='<div class="col-xs-4 pull-right">'
            accountTpl+='<div class="listBlock {{clsbg}}">'
              accountTpl+='<span class="gainloss_perc">{{gainloss_perc}}%</span>'
              accountTpl+='<i class=\"{{clsarrow}}\"></i>'
           accountTpl+='</div>'
          accountTpl+='</div>'

          accountTpl+='</a>'*/
          accountTpl+='{{/tdata}}'

        

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
          this.assettpl += '{{#tdata}}'                                                                            
          this.assettpl += '<a class="listHolding {{clsbg}}" href="#Holding/security/{{assetclass}}">'
         
           this.assettpl +='<div class="col-xs-6">'
            this.assettpl +='<span class="assetclassname">{{assetclassname}}</span>'
            //this.assettpl +='<span class="marketvalue sm"><i class="fa ico_{{lcy}}"></i> {{#commaSeparate}}{{marketvalue}}{{/commaSeparate}}</span>'
            this.assettpl +='<span class="marketvalue sm"><i class="fa ico_{{lcy}}"></i> {{#commaSeparate}}{{#kFormatter}}{{marketvalue}}{{/kFormatter}}{{/commaSeparate}}</span>'
          this.assettpl +='</div>'

         
          this.assettpl +='<div class="col-xs-5">'
            this.assettpl +='<div class="listBlock">'
              this.assettpl +='<span class="gainloss_amnt">{{#commaSeparate}}{{#kFormatter}}{{gainloss}}{{/kFormatter}}{{/commaSeparate}}</span>'
              this.assettpl +='<span class="gainloss_perc"><i class="{{clsarrow}}"></i> {{gainloss_perc}}%</span>'
           this.assettpl +='</div>'

          this.assettpl +='</div>'
                          
          this.assettpl +='<div class="holdingLink">'
            this.assettpl +='<i class="fa fa-angle-right"></i>'
          this.assettpl +='</div>'

          this.assettpl +='</a>'
          this.assettpl +='{{/tdata}}'            



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
          var clsarrow=""
          var clsbg="bg-default";
          this.$el.html(this.assetholdingpage||"Hey Mohini!!! ");
          //grouping on account
//          var $this=this;
          var accountfiltered=_.filter(app.dc.holdingCollection.toJSON(),function(vObj){
            console.log("Account number : "+this.accountnumber);
            $("#account_no").html(this.accountnumber);

          if(vObj.accountid==this.accountnumber) return true;},{accountnumber:this.accountnumber})
          var groups=_.groupBy(accountfiltered,'assetclasscode');
          var total={gainloss:0,gainloss_perc:0,marketvalue:0}
          _.each(groups,function(group,key){
              total.marketvalue = _.reduce(group, function(memo, Obj){ return Big(memo).plus(Obj.marketvalue).toString(); }, 0);
              total.gainloss_perc = _.reduce(group, function(memo, Obj){ return Big(memo).plus(Obj.gainloss_perc).toString(); }, 0);
              

               if(total.gainloss_perc<0){
                 clsarrow='fa fa-caret-down'
                 clsbg='bg-red'
               }
               else if (total.gainloss_perc>0){
                clsarrow='fa fa-caret-up'
                clsbg='bg-green'
              }
              else{
                clsarrow=''
                clsbg='bg-default'
              }


              // if(total.gainloss_perc<0)
              //   clsarrow='fa fa-caret-down'
              // clsbg=(((assetObj.length+1)%2)==0?"bg-red":"bg-green") 


              total.gainloss_perc=Math.abs(total.gainloss_perc)             
              assetObj[assetObj.length]={"assetclassname":group[0].assetclassname,"assetclass":key,"marketvalue":total.marketvalue,"gainloss_perc":total.gainloss_perc,"y":Number(total.marketvalue),"name":group[0].assetclassname,"clsbg":clsbg,"clsarrow":clsarrow, "pcy": group[0].pcy, "lcy": group[0].lcy, "gainloss": group[0].gainloss}
          });

          mainObj={"tdata":assetObj}
          mainObj["commaSeparate"]=function () {
            return function (text, render) {
              return app.formatPrice.call(render(text));
            }
          }

          mainObj["kFormatter"]=function () {
            return function (text, render) {
              return app.kFormatter(render(text));
            }
          }


          $("#asset_back").attr("href","#MyPortfolio/V1");
          var html=Mustache.to_html(this.assettpl,mainObj)          
          $("#assetlisting").html(html);
          app.trade.getNetWorth();

          app.trade.accountChartObj={"id":"#assetgraph","data":assetObj}          
        }
      })


app.dv.SecurityHoldingView=Backbone.View.extend({    
    initialize: function(options){
      var $this=this;
      this.assetclass=options.assetclass
      this.securitytpl=""

          this.securitytpl += '{{#tdata}}'                                                                            
          this.securitytpl += '<div class="listHolding {{clsbg}}">'
         
           this.securitytpl +='<div class="col-xs-8">'
             this.securitytpl +='<span class="security_name">{{security_name}}</span>'
           // this.securitytpl +='<span class="marketvalue sm"><i class="fa ico_{{lcy}}"></i> {{#commaSeparate}}{{marketvalue}}{{/commaSeparate}}</span>'
            this.securitytpl +='<span class="marketvalue sm"><i class="fa ico_{{lcy}}"></i> {{#commaSeparate}}{{#kFormatter}}{{marketvalue}}{{/kFormatter}}{{/commaSeparate}}</span>'
          this.securitytpl +='</div>'

          this.securitytpl +='<div class="col-xs-4">'
            this.securitytpl +='<div class="listBlock">'
              this.securitytpl +='<span class="gainloss_amnt">{{#commaSeparate}}{{#kFormatter}}{{gainloss}}{{/kFormatter}}{{/commaSeparate}}</span>'
              this.securitytpl +='<span class="gainloss_perc"><i class="{{clsarrow}}"></i> {{gainloss_perc}}%</span>'
           this.securitytpl +='</div>'
          this.securitytpl +='</div>'
                                 
          this.securitytpl +='</div>'
          this.securitytpl +='{{/tdata}}'          

    
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
      var clsarrow=""
      var accountfiltered=_.filter(app.dc.holdingCollection.toJSON(),function(vObj){
        $("#account_no").html(this.accountnumber);
        if(vObj.accountid==this.accountnumber && vObj.assetclasscode==this.assetclass) return true;}
        ,{"accountnumber":accountnumber,"assetclass":this.assetclass}
        )
      
      for(var i=0;i<accountfiltered.length;i++)
      {
        accountfiltered[i].y=Number(accountfiltered[i].marketvalue)
        accountfiltered[i].name=accountfiltered[i].security_name
        //accountfiltered[i].clsbg=clsbg=((i%2)==0?"bg-red":"bg-green")

        // if(accountfiltered[i].gainloss_perc<0)
        //   accountfiltered[i].clsarrow='fa fa-caret-down'
        // else
        //   accountfiltered[i].clsarrow='fa fa-caret-up'

        if(accountfiltered[i].gainloss_perc<0){
           accountfiltered[i].clsarrow='fa fa-caret-down'
           accountfiltered[i].clsbg='bg-red'
         }
         else if (accountfiltered[i].gainloss_perc>0){
          accountfiltered[i].clsarrow='fa fa-caret-up'
          accountfiltered[i].clsbg='bg-green'
        }
        else{
          accountfiltered[i].clsarrow=''
          accountfiltered[i].clsbg='bg-default'
        }

        accountfiltered[i].gainloss_perc=Math.abs(accountfiltered[i].gainloss_perc)
      }
      app.trade.accountChartObj={"id":"#securitygraph","data":accountfiltered};
      mainObj={"tdata":accountfiltered,"accountnumber":accountnumber}
      mainObj["commaSeparate"]=function () {
        return function (text, render) {
          return app.formatPrice.call(render(text));
        }
      }
      mainObj["kFormatter"]=function () {
        return function (text, render) {
          return app.kFormatter(render(text));
        }
      }
      $("#sec_back").attr("href","#Holding/asset/"+accountnumber)               
      var html=Mustache.to_html(this.securitytpl,mainObj)
      $("#securitylisting").html(html);
      app.trade.getNetWorth();
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

sumTotal = {"netWorthAmnt":0, "gainLossAmnt":0, "gainLossPerc":0, "clsbg":""}
app.trade.getNetWorth = function(){
    var tpl = '';
      tpl += '{{#view}}'    
      tpl += '<div class="col-xs-6">'
        tpl += '<div class="netWorth">'
          tpl += '<span>Net Worth</span>'
          tpl += '<span class="amnt"><i class="fa ico_{{lcy}}"></i>{{#commaSeparate}} {{netWorthAmnt}}  {{/commaSeparate}}</span>'
        tpl += '</div>'
      tpl += '</div>'
      tpl += '<div class="col-xs-6 {{clsbg}}">'
        tpl += '<div class="gainLoss">'
          tpl += '<span>Gain / Loss</span>'
          tpl += '<span class="amnt">{{#commaSeparate}}{{gainLossAmnt}}{{/commaSeparate}}<span class="amnt_perc"> ({{gainLossPerc}}%) </span></span>'
        tpl += '</div>'
      tpl += '</div>'
      tpl += '{{/view}}'

      if(sumTotal.gainLossPerc > 0){
        sumTotal.clsbg='bg-green'
      }
      else if(sumTotal.gainLossPerc < 0){
         sumTotal.clsbg='bg-red'
      }
      else{
         sumTotal.clsbg='bg-default'
      }


     netWorthObj={"view":sumTotal}

     netWorthObj["commaSeparate"]=function () {
      return function (text, render) {
        return app.formatPrice.call(render(text));
      }
    }
    var rendered = Mustache.to_html(tpl, netWorthObj);
    $("#top_listHolding").html(rendered);
}



app.trade.loadAccountHoldingView=function(_this)
{
  var accountObj=[],mainObj={},netWorthObj={}
  var total={gainloss:0,gainloss_perc:0,marketvalue:0}
  sumTotal = {"netWorthAmnt":0, "gainLossAmnt":0, "gainLossPerc":0, "clsbg":"","lcy_marketvalue":0,"lcy_bookvalue":0}
  var clsarrow="";
  var clsbg="", $this=_this;
  

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
   total={gainloss:0,gainloss_perc:0,marketvalue:0,pcy_marketvalue:0}

   for(var i=0;i<groups[key].length;i++)
   {
    total.gainloss= Number(Big(total.gainloss).plus(groups[key][i].gainloss))
    //total.gainloss_perc = Number(Big(total.gainloss_perc).plus(groups[key][i].gainloss_perc));
    total.marketvalue= Number(Big(total.marketvalue).plus(groups[key][i].marketvalue))  
    total.pcy_marketvalue= Number(Big(total.pcy_marketvalue).plus(groups[key][i].pcy_mtmvalue))  
    total.lcy= groups[key][i].lcy;
    total.pcy= groups[key][i].pcy;
    total.lcy_bookvalue= Number(Big(total.lcy_bookvalue||0).plus(groups[key][i].lcy_bookvalue));

    sumTotal.lcy = groups[key][i].lcy;
  
   }
total.gainloss_perc = Number((((Big(total.marketvalue).minus(total.lcy_bookvalue)).div(total.lcy_bookvalue)).times(100)).round(2));
  if(total.gainloss_perc<0){
     clsarrow='fa fa-caret-down'
     clsbg='bg-red'
   }
   else if (total.gainloss_perc>0){
    clsarrow='fa fa-caret-up'
    clsbg='bg-green'
  }
  else{
    clsarrow=''
    clsbg='bg-default'
  }
  sumTotal.lcy_marketvalue=Number(Big(sumTotal.lcy_marketvalue).plus(total.marketvalue))
  sumTotal.lcy_bookvalue=Number(Big(sumTotal.lcy_bookvalue).plus(total.lcy_bookvalue))

  //total.gainloss_perc=Math.abs(total.gainloss_perc)
  
 // clsbg=(((accountObj.length+1)%2)==0?"bg-red":"bg-green")
  accountObj[accountObj.length]={"lcy": total.lcy, "pcy": total.pcy, "lcy_bookvalue": total.lcy_bookvalue, "accountid":key,"gainloss":total.gainloss,"gainloss_perc":Math.abs(total.gainloss_perc),"marketvalue":total.marketvalue,"pcy_marketvalue":total.pcy_marketvalue,"name":key,y:total.marketvalue,"clsbg":clsbg,"clsarrow":clsarrow}
  }
  sumTotal.netWorthAmnt=app.kFormatter(sumTotal.lcy_marketvalue);

  sumTotal.gainLossAmnt = app.kFormatter(Number(Big(sumTotal.lcy_marketvalue).minus(sumTotal.lcy_bookvalue).round(2)))

  sumTotal.gainLossPerc = (((Big(sumTotal.lcy_marketvalue).minus(sumTotal.lcy_bookvalue)).div(sumTotal.lcy_bookvalue)).times(100)).round(2);

  mainObj={"tdata":accountObj}
  
  mainObj["commaSeparate"]=function () {
  return function (text, render) {
    return app.formatPrice.call(render(text));
  }
  }
  mainObj["kFormatter"]=function () {
    return function (text, render) {
      return app.kFormatter(render(text));
    }
  }

  var html=Mustache.to_html($this.accountTpl,mainObj)

  app.trade.getNetWorth();

  $("#accountlisting").html(html);
  app.trade.accountChartObj={"id":"#accountinggraph","data":accountObj}
//  return this; 
}


app.kFormatter = function(num){
  var strl = ''
  var str2 = ''

  if(num < 0){
     strl = '('
      str2 = ')'
  }
  num = Math.abs(num);
  return num > 999 ?   strl + (num/1000).toFixed(1) + ' K' + str2   : num
}

