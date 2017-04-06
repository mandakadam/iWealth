app.instance.dv.WatchlistView=null;
app.getUserWatchList={};
app.onGetWatchlist={};
app.watchlist={}
// app.onGetUserWatchlist=function(viewid,paramhtml)
// {
//   console.log('onGetWatchlist function loaded');
//   /*if(!app.instance.dv.WatchlistView)
//    	app.instance.dv.WatchlistView=new app.dv.WatchlistView({el:"#maincontent",paramhtml:paramhtml})
//   else
//   {    
//   }*/
//   app.instance.dv.WatchlistView=new app.dv.WatchlistView({el:"#maincontent",paramhtml:paramhtml})
// }

// app.dv.WatchlistView = Backbone.View.extend({   
//   initialize: function(attrs) {
//     var $this=this;
    
//     $.get(attrs.paramhtml, function(template){
//       $this.template=template;
//     }).done(function(){
//       $this.render()
//     });

//   },      
//   events: {
//     'click .addWatchlist' : 'addWatchlist'
//   },  
//   render: function() {
//     var watchlistTpl =_.template(this.template);
//     this.$el.html(watchlistTpl());
//      var tpl ='';

//       $.getJSON( "app/js/watchlist/watchlist.json", function( response ) {
//         tpl += '<div class="tophd"><div class="col-xs-5">Company</div><div class="col-xs-3">Price</div><div class="col-xs-4 pull-right text-right">Changes %</div></div>'
//         tpl += '{{#view}}'
//          tpl += '<div class="watchlist_holding">'
//             tpl += '<div class="col-xs-8">'
//               tpl += '<span class="compName textWrap">{{company}}</span> '
//               tpl += '<span class="marketvalue"><i class="fa fa-rupee"></i> {{marketvalue}}</span>'
//                tpl += '<span class="accName">{{acc_name}} </span> | <span>{{date}}</span>'
//             tpl += '</div>'

          

//             tpl += '<div class="col-xs-4  pull-right text-right">'
//                 tpl += '<div class="listBlock bg-green">'
//                   tpl += '<span class="gainloss_amnt">{{gainloss_amnt}}</span>'
//                   tpl += '<span class="gainloss_perc">{{gainloss_perc}}</span>'
//                   tpl += '<i class="fa fa-caret-up"></i>'
//                 tpl += '</div>'
//               tpl += '</div>'
//           tpl += '</div>'
//         tpl += '{{/view}}'

//       Mustache.parse(tpl);
//       var rendered = Mustache.render(tpl, {"view": response.data});
//       $("#watchlist_listing", this.$el).html(rendered);

//     }).done(function() {

//     });


//     return this;
//   },
//   addWatchlist: function(){
//     $('#watchlistSearch').show();
//     $('#watchlist_listing').hide();

//     $('#watchlistSearch input').focus();

//     console.log('watchlistSearch');
    
//     $.getJSON( "app/js/watchlist/addWatchlist.json", function( response ) {
//        var  list = response.data.map(function(i) { return i.company; });
//         console.log(list)
//         new Awesomplete('input#watchlistInput', {
//           list: list,
//           filter: function(text, input) {
//             return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
//           },
//           replace: function(text) {
//             var before = this.input.value.match(/^.+,\s*|/)[0];
//             this.input.value = before + text + ", ";
//           },
//           autoFirst: true,
//           minChars: 1
//         });
//     });

//     document.querySelector('input#watchlistInput').addEventListener('awesomplete-select', function(evt){
//       console.log(this.value);
//     })


//   }    
// });




app.dc._getUserWatchListCollection=new (app.dc._generic(
  {   
    _reload:app._reload,
    data:{user_id:app.getData("_user_id")} 
    ,_methods: {
        read: "dataset/userwatchlist"
    }   
    ,parse:function(response){  
    if(response.status=="success" && response.vdata)                
          return response.vdata
    }      
  }))


app.dc._getWatchListCollection=new (app.dc._generic(
  {   
    data:{user_id:app.getData("_user_id")} 
    ,_methods: {
        read: "dataset/watchlist"
    }   
    ,parse:function(response){  
    if(response.status=="success" && response.vdata)                
          return response.vdata
    }      
  }))
app.onGetWatchlist =function()
{
 app.getWatchList._watchlistCol=new app.dc._getWatchListCollection();
 app.getWatchList._watchlistCol.fetch({
    success:function(model){
      var tpl=""
     
      tpl=Mustache.to_html(tpl,{"data":model.toJSON()})       
      $("#maincontent").html(tpl);   
    }
   });  
}


/*-------------------------------------------------------------------------------------------------*/
app.onGetUserWatchlist=function(viewid,paramhtml)
{
  console.log('onGetWatchlist function loaded');
  if(!app.instance.dv.WatchlistView)
  {
    console.log('onGetWatchlist function loaded if block');
   app.instance.dv.WatchlistView=new app.dv.WatchlistView({el:"#maincontent",paramhtml:paramhtml})
  }
  else
  {
    console.log('onGetWatchlist function loaded else block');
   app.dc._getUserWatchListCollection.fetch({reset:true});
  } 
}

app.dv.WatchlistView = Backbone.View.extend({   
  initialize: function(attrs) {
        var $this=this;    
        var tpl ='';
        tpl += '<div class="tophd"><div class="col-xs-5">Company</div><div class="col-xs-3">Price</div><div class="col-xs-4 pull-right text-right">Changes %</div></div>'
        tpl += '{{#view}}'
        tpl += '<div class="watchlist_holding">'
        tpl += '<div class="col-xs-8">'
        tpl += '<span class="compName textWrap">{{company}}</span> '
        tpl += '<span class="marketvalue"><i class="fa fa-rupee"></i> {{marketvalue}}</span>'
        tpl += '<span class="accName">{{acc_name}} </span> | <span>{{date}}</span>'
        tpl += '</div>'
        tpl += '<div class="col-xs-4  pull-right text-right">'
        tpl += '<div class="listBlock bg-green">'
        tpl += '<span class="gainloss_amnt">{{gainloss_amnt}}</span>'
        tpl += '<span class="gainloss_perc">{{gainloss_perc}}</span>'
        tpl += '<i class="fa fa-caret-up"></i>'
        tpl += '</div>'
        tpl += '</div>'
        tpl += '</div>'
        tpl += '{{/view}}'   
         this.tpl=tpl;                                       
        app.dc._getUserWatchListCollection.on('reset',this.render,this);
        
          $.get(attrs.paramhtml, function(template){  
          $this.watchlistpg=template;               
            app.dc._getUserWatchListCollection.fetch({reset:true});
          }); 
          //this.render()
  },      
  events: {
    'click .addWatchlist' : 'addWatchlist'
  },  
  render: function() {  
  console.log("hello in renderfunc")  
    app.watchlist.loadUserWatchlist(this)
   
  },
  addWatchlist: function(){
    $('#watchlistSearch').show();
    $('#watchlist_listing').hide();

    $('#watchlistSearch input').focus();

    console.log('watchlistSearch');
    
    app.dc._getWatchListCollection.fetch({reset:true})
    var watchlistobj=app.dc._getUserWatchListCollection.toJSON();  
    
       var  list = watchlistobj[0].data.map(function(i) { return i.company; });
        console.log(list)
        new Awesomplete('input#watchlistInput', {
          list: list,
          filter: function(text, input) {
            return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
          },
          replace: function(text) {
            var before = this.input.value.match(/^.+,\s*|/)[0];
            this.input.value = before + text + ", ";
          },
          autoFirst: true,
          minChars: 1
        });
    

    document.querySelector('input#watchlistInput').addEventListener('awesomplete-select', function(evt){
      console.log(this.value);
    })


  }    
});

app.watchlist.loadUserWatchlist=function(_this)
{
  console.log(app.dc._getUserWatchListCollection.toJSON()) 
  var $this=_this;            
  $this.el.innerHTML = $this.watchlistpg;                 
  var userwatchlisobj=app.dc._getUserWatchListCollection.toJSON();  
  var vhtml=Mustache.to_html($this.tpl,{"view":userwatchlisobj[0].data})
   $("#watchlist_listing").html(vhtml);
  
  
  
  
}