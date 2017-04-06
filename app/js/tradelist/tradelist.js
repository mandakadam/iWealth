 app.instance.dv.TradelistView=null;
 app.tradelist={}
// app.onGetTradelist=function(viewid,paramhtml)
// {
//   console.log('onGetTradeorder function loaded');
//   app.instance.dv.TradelistView=new app.dv.TradelistView({el:"#maincontent",paramhtml:paramhtml})
// }
// app.dv.moreTradeListInfo = function(self){
// 	if(!$('.tradeListInfo', self).is(':visible')){
// 		$('.tradeListInfo').slideUp(300);
// 		$('.tradeListInfo', self).slideDown(300);
// 		$('.tradeListing').removeClass('active');
// 		$(self).addClass('active');
// 	}else{
// 		$('.tradeListing').removeClass('active');
// 		$('.tradeListInfo', self).slideUp(300);
// 	}
// }

// app.dv.TradelistView = Backbone.View.extend({   
//   initialize: function(attrs) {
//     var $this=this;
//     var tpl ='';

//     $.getJSON( "app/js/tradelist/tradelist.json", function( response ) {
//     	tpl += '{{#view}}'
//     		tpl += '<div class="tradeListing" onclick="app.dv.moreTradeListInfo(this)">'
//     			tpl += '<div class="tradeList">'
// 				tpl += '<div class="col-xs-5">'
// 					tpl += '<h3 class="compName">{{company}}</h3>'
// 					tpl += '<span>{{tradeType}}</span>'				
// 				tpl += '</div>'

// 				tpl += '<div class="col-xs-3">'
// 					tpl += '<span class="exc">{{exchange}}</span>'
// 					tpl += '<span class="qty">Qty: {{quantity}}</span>'
// 				tpl += '</div>'

// 				tpl += '<div class="col-xs-4">'
// 					tpl += '<span class="status {{status}}">{{status}}</span>'
// 				tpl += '</div>'
// 				tpl += '</div>'
			

// 			tpl += '<div class="tradeListInfo" style="display:none">'
// 				tpl += '<ul>'
// 						tpl += '<li><strong>Account No</strong> <span> {{accountid}}</span></li>'
// 						tpl += '<li><strong>Trans Type</strong> <span> {{trans_type}}</span></li>'
						
// 						tpl += '<li><strong>Request ID</strong> <span> {{req_id}}</span></li>'
// 						tpl += '<li><strong>Order On</strong> <span> {{entryon}}</span></li>'
						
// 						tpl += '<li><strong>Quantity</strong> <span> {{quantity}}</span></li>'
// 						tpl += '<li><strong>Price</strong> <span> {{price}}</span></li>'
						
// 						tpl += '<li><strong>Amount</strong><span> $ {{amount}}</span></li>'
					
// 				tpl += '</ul>'
// 			tpl += '</div>'
// 			tpl += '</div>'
//     	tpl += '{{/view}}'

//     	Mustache.parse(tpl);
// 		var rendered = Mustache.render(tpl, {"view": response.data});
// 		$("#maincontent").html(rendered);

// 	}).done(function() {

// 	});

    
//   },        
//   render: function() {
//     var tradelistTpl =_.template(this.template);
//     this.$el.html(tradelistTpl());
//     return this;
//   }       
// });


app.dc._tradelistCollection=new (app.dc._generic(
  {   
  	_reload:app._reload,
    data:{user_id:app.getData("_user_id")} 
    ,_methods: {
        read: "dataset/tradelist"
    }   
    ,parse:function(response){  
		if(response.status=="success" && response.vdata)                
          return response.vdata
    }      
  }))

app.dv.TradelistView = Backbone.View.extend({   
  initialize: function(attrs) {
    var $this=this;
    var tpl ='';
     
      tpl += '<div class="col-xs-12 well">'
      tpl += '{{#view}}'
    		tpl += '<div class="tradeListing" onclick="app.dv.moreTradeListInfo(this)">'
    			tpl += '<div class="tradeList  {{status}}">'
         
          tpl += '<h3 class="compName"><span class="cmp">{{company}}</span> <i class="fa fa-angle-down pull-right"></i><span class="status" style="display:none">{{status}}</span> </h3>'
          tpl += '<div class="trade_dtl">'

				tpl += '<div class="col-xs-4">'
					tpl += '<span class="col1"><i class="fa fa-calendar"></i> {{entryon}}</span>'				
				tpl += '</div>'

				tpl += '<div class="col-xs-5">'
					tpl += '<span class="col2 qty"><i class="fa ico_{{currency}}"></i> {{#commaSeparate}}{{amount}}{{/commaSeparate}}</span>'
				tpl += '</div>'

				tpl += '<div class="col-xs-3">'
					tpl += '<span class="status">{{status}}</span>'
        tpl += '</div>'
				tpl += '</div>'
        tpl += '</div>'
				
			

			tpl += '<div class="tradeListInfo" style="display:none">'
				tpl += '<ul>'
          tpl += '<li><strong>Account No</strong> <span> {{accountid}}</span></li>'
          tpl += '<li><strong>Transaction Type</strong> <span> {{trans_type}}</span></li>'
          tpl += '<li><strong>Requested id</strong> <span> {{req_id}}</span></li>'
          tpl += '<li><strong>Order On</strong> <span> {{entryon}}</span></li>'
          tpl += '<li><strong>Price</strong> <span> <i class="fa ico_{{currency}}"></i> {{#commaSeparate}}{{price}}{{/commaSeparate}}</span></li>'
          tpl += '<li><strong>Quantity</strong> <span> {{quantity}}</span></li>'
          tpl += '<li><strong>Amount</strong> <span> <i class="fa ico_{{currency}}"></i>  {{#commaSeparate}}{{amount}}{{/commaSeparate}}</span></li>'
          tpl += '<li><strong>Asset Class</strong> <span> {{tradetype}}</span></li>'
				tpl += '</ul>'
			tpl += '</div>'
      tpl += '</div>'
      tpl += '{{/view}}'
      tpl += '</div>'
    	this.tpl=tpl;                                       
      app.dc._tradelistCollection.on('reset',this.render,this);

      $.get(attrs.paramhtml, function(template){  
      $this.tradelistpg=template;               
       app.dc._tradelistCollection.fetch({reset:true});
      }); 
      
  },        
  render: function() {
  	app.tradelist.loadTradeList(this)    
  }       
});



app.onGetTradelist =function(viewid,paramhtml)
{

  if(!app.instance.dv.TradelistView)
  {    
   app.instance.dv.TradelistView=new app.dv.TradelistView({el:"#maincontent",paramhtml:paramhtml})
  }
  else
  {   
   app.dc._tradelistCollection.fetch({reset:true});
  } 

}

app.tradelist.loadTradeList=function (_this)    
{	
  var $this=_this, mainObj={};          
  $this.el.innerHTML = $this.tradelistpg;                 
  var tradelistobj=app.dc._tradelistCollection.toJSON(); 


  console.log(tradelistobj[0].data)

    mainObj={"view":tradelistobj[0].data}
    mainObj["commaSeparate"]=function () {
      return function (text, render) {
        return app.formatPrice.call(render(text));
      }
    }
  var vhtml=Mustache.to_html($this.tpl,mainObj);


  $("#maincontent").html(vhtml);  
    $('.tradeListing:first-child').trigger('click');
  //   $('.tradeListing').each(function(i){
  //   console.log(i)
  //   if(i==0){
  //     $(this).addClass('active');
  //   }
  // }, this);

}

app.dv.moreTradeListInfo = function(self){
 $('.compName .status').hide(300);
 $('.trade_dtl').slideDown();
 
 if(!$('.tradeListInfo', self).is(':visible')){
   $('.tradeListInfo').slideUp(300);
   $('.tradeListInfo', self).slideDown(300);
   $('.tradeListing').removeClass('active');
   $(self).addClass('active');
  // $('.trade_dtl', self).slideUp();
  // $('.compName .status', self).fadeIn(300);
 }else{
   $('.tradeListing').removeClass('active');
   $('.tradeListInfo', self).slideUp(300);
  // $('.trade_dtl', self).slideDown();
   //$('.compName .status', self).hide();
 }
}