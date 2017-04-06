app.fp={}
app.instance.dv.financialPView=null;

app.dv.financialPView = Backbone.View.extend({   
 initialize: function(attrs) {   
 	var $this=this;
    $.get(attrs.paramhtml, function(template){
      $this.template=template;
      $this.render();     
      app.fp.risktpl()
      app.dc.riskmaster.fetch();
    });
    //Create route for risk profile result

  _app_route.route("FinancialPlanning/result/:riskprofile","FinancialPlanning/result",function(riskprofile){
    app.instance.dv.RPAllocation=new app.dv.RPAllocation({"riskprofile":riskprofile,el:"#maincontent"})
  });
     
    
  },        
  render: function() {    	       
    this.$el.html(this.template);  
    return this;
  },
  events:{
    "click #btnRPNext":"goToNextQuest",
    "click #btnRPPrev":"goToPrevQuest",
    "click #frmriskprofile input":"calculateProgress",
    "click #frmriskprofile #btnRPSubmit":"onSubmitRiskProfile"
  },
  goToNextQuest:function(){
    app.fp.goToNextQuest();
  },
  goToPrevQuest:function(){
    app.fp.goToPrevQuest();
  },
  calculateProgress:function(e){
    app.fp.calculateProgress(e);
  },
  onSubmitRiskProfile:function(e)
  {
    app.fp.onSubmitRiskProfile();
  }
})

app.dv.RPAllocation = Backbone.View.extend({   
 initialize: function(attrs) {   
 	  var $this=this;
    this.riskprofile=attrs.riskprofile
    $.get(app.applicationurl+"app/template/financialplanning/ModelPortfolio.html", function(template){
      $this.template=template;
      $this.render();
    });
  },        
  render: function() {    	       
    this.$el.html(this.template);
    app.fp.createRPAllocationCharts(this,this.riskprofile);  
    return this;
  },
  events:{
    "click #btnRecalculate":"onRecalculate"
  },
  onRecalculate:function()
  {
    _app_route.navigate('FinancialPlanning/V3', { trigger: true });
  }
})

//Model portfolio allocation
app.dc.RPAllocation=(app.dc._generic(
{   
  _methods: {
      read: "dataset/riskprofileallocation"
  }   
  ,parse:function(response){
        if(response.vdata.status && response.vdata.status=="unsuccess")
          return {}
        else return response.vdata.data
  }      
}))

//Risk Profile Question Collection
app.dc._financialPQuestion=new (app.dc._generic(
  {   
    data:{user_id:app.getData("_user_id")} 
    ,_methods: {
        read: "dataset/riskquestion"
    }   
    ,parse:function(response){
          if(response.vdata.status && response.vdata.status=="unsuccess")
            return {}
          else return response.vdata.data
    }      

  }))
  
//Risk Profile Question Collection
app.dc.riskmaster=new (app.dc._generic(
{   
  _methods: {
      read: "dataset/riskdefn"
  }   
  ,parse:function(response){
        if(response.vdata.status && response.vdata.status=="unsuccess")
          return {}
        else return response.vdata.data
  }      
}))

  
  
//Risk Profile Answer Collection  
app.dc._financialPAnswer=new (app.dc._generic(
{  
  data:{user_id:app.getData("_user_id")} 
  ,_methods: {
      read: "dataset/riskanswer"
  }
  ,parse:function(response){    
      if(response.status=="success" && response.vdata)
      {
        if(response.vdata.status && response.vdata.status=="unsuccess")
          return {}
        else return response.vdata.data
      }
      
  }   
}))

app.onGetFinancialPlanning=function(viewid,paramhtml)
{ 
   if(!app.instance.dv.financialPView) 
    app.instance.dv.financialPView=new app.dv.financialPView({el:"#maincontent",paramhtml:paramhtml})
   else
   {
    app.instance.dv.financialPView.render();
    app.fp.risktpl()
    app.dc.riskmaster.fetch();
   } 
}

app.fp.risktpl=function(_this)
{
  var riskqtn;
  app.dc._financialPQuestion.fetch(
  {
    success:function(model,response)
    {
       riskqtn=model.toJSON()
       app.dc._financialPAnswer.fetch(
       {            
          success:function(model,response)
          {
            var html="",divRef=null
//            _this.render();
            html=app.fp.createQAhtml(riskqtn,model)
            $("#riskprofile").html(html)
            $("#qtn_attempt").html("0 of "+riskqtn.length+" answered");   
            divRef=$("#frmriskprofile .cls-rp-qtnansblock").first()
            if(divRef.length!=0)
              divRef.addClass("active");
             /*$('html, body').animate({
                  scrollTop:divRef.offset().top-50
              }, 100);   */ 
            return html;
          }
       })      
     }
  })
}


app.fp.createQAhtml=function(qmodel,amodel)
{
  var vhtml=[]
  var riskAnsArr=[]
  for(var i=0;i<qmodel.length;i++)
  {
    vhtml[vhtml.length]='<div class="cls-rp-qtnansblock" id="Q'+qmodel[i].option_id+'">'
    vhtml[vhtml.length]='<label class="cls-rp-qtn">'+(i+1)+". "+qmodel[i].option_name+'</label>' 
    riskAnsArr=_.filter(amodel.toJSON(),function(vObj){if(vObj.option_id==this.option_id)return true;},{option_id:qmodel[i].option_id})
    for(var j=0;j<riskAnsArr.length;j++)
    {
      if(qmodel[i].multi_select=="Y")
        vhtml[vhtml.length]='<div class="mtForm col-xs-12 checkbox cls-rp-ans"><input type="checkbox" _others="'+riskAnsArr[j].is_others+'" name="AQ'+qmodel[i].option_id+'" id="AQ'+riskAnsArr[j].srno+'" class="cls-rp-inptcntrl" value="'+riskAnsArr[j].weight+'"><label for="AQ'+riskAnsArr[j].srno+'">'+riskAnsArr[j].value_name+'</label>'
      else
        vhtml[vhtml.length]='<div class="mtForm col-xs-12 radio cls-rp-ans"> <input type="radio" class="cls-rp-inptcntrl"  _others="'+riskAnsArr[j].is_others+'" name="AQ'+qmodel[i].option_id+'" id="AQ'+riskAnsArr[j].srno+'" value="'+riskAnsArr[j].weight+'"> <label for="AQ'+riskAnsArr[j].srno+'"> '+riskAnsArr[j].value_name+'</label> '

      if(riskAnsArr[j].is_others=="Y")
          vhtml[vhtml.length]='<br ><br ><input class="form-control col-sm-6" type="text"  name="txtAQ'+qmodel[i].option_id+'" id="txtAQ'+riskAnsArr[j].srno+'" value="">'
      vhtml[vhtml.length]='</div>'
    }
    if(qmodel[i].multi_select=="Y")
    {
      vhtml[vhtml.length]='<div class="mtForm col-xs-12"><input type="button" onclick="app.fp.goToNextQuest();" value="OK" name="btnok'+qmodel[i].option_id+'" id="btnok'+qmodel[i].option_id+'" class="btn btn-mt yellow"></div>'      
    }  

    if(qmodel.length-1==i)
      vhtml[vhtml.length]='<div class="col-sm-4 col-sm-offset-4 col-xs-12" id="divsubmit"><br /><button type="button" id="btnRPSubmit" class="btn btn-mt btn-success btn-block">Submit</button></div>'
    vhtml[vhtml.length]='</div>'
  }
  return   vhtml.join(" ");
}


/**
 *@event      app.fp.goToNextQuest.
 *@desc       Go to next question
 *@author     Mohini
 *@dated      28-09-2016 12:25:12 PM
 **/
app.fp.goToNextQuest=function(currID)
{
  var nextRefid="",nextRef=null,activeRef=null;
  if(currID)
    nextRef=$("#frmriskprofile #"+currID).next(".cls-rp-qtnansblock");
  else
  {
    activeRef=$("#frmriskprofile .cls-rp-qtnansblock.active");
    nextRef=activeRef.next(".cls-rp-qtnansblock")
  }
  if(nextRef.length!=0)
  {
    $("#frmriskprofile .cls-rp-qtnansblock").removeClass("active");
    nextRef.addClass("active");
    nextRefid=nextRef.attr("id");
    $('html, body').animate({
        scrollTop:$("#"+nextRefid).offset().top
    }, 1000);    
  }
  else
  {
    $('html, body').animate({
      scrollTop:$("#divsubmit").offset().top
    }, 500);    
  }
}

/**
 *@event      app.fp.goToNextQuest.
 *@desc       Go to next question
 *@author     Mohini
 *@dated      28-09-2016 12:25:12 PM
 **/
app.fp.goToPrevQuest=function()
{
  var prevRefid="";
  var prevRef=$("#frmriskprofile .cls-rp-qtnansblock.active").prev(".cls-rp-qtnansblock")
  if(prevRef.length!=0)
  {
    $("#frmriskprofile .cls-rp-qtnansblock").removeClass("active");
    prevRef.addClass("active");
    prevRefid=prevRef.attr("id");
    $('html, body').animate({
        scrollTop:$("#"+prevRefid).offset().top
    }, 1000);    
  }
}

/**
 *@event      app.fp.calculateProgress.
 *@desc       Calcualte progress
 *@author     Mohini
 *@dated      28-09-2016 2:48:49 PM
**/
app.fp.calculateProgress=function(e)
{
  var QACount=app.dc._financialPQuestion.length
  var ansCount=0,ansflag=false;
  var targetRef=null,otherRef;
  targetRef=$("#"+e.target.id);
  $("#frmriskprofile .cls-rp-qtnansblock").removeClass("active");
  targetRef.parents(".cls-rp-qtnansblock").addClass("active")
  $("#frmriskprofile .cls-rp-qtnansblock").each(function( index ) {
    ansflag=$("#frmriskprofile [name=A"+this.id+"]").is(":checked");
    if(ansflag)
      ansCount++;
  });
  $("#frmriskprofile #txtanswercount").prop("value",ansCount)
  var progressperc=Math.ceil(ansCount/QACount*100)
  $("#progressbar").css("width",progressperc+"%")
  $("#qtn_attempt").html(ansCount+" of "+QACount+" answered");  
  
  if(targetRef.attr("_others")=="Y" || targetRef.attr("type")=="checkbox")
  {
    otherRef=$("#txt"+e.target.id)
    if(otherRef.length!=0)
      otherRef.focus();
  }
  else  
    app.fp.goToNextQuest(this.id);   
}

app.fp.onSubmitRiskProfile=function()
{
  var ref=null,weight=0,riskprofile=""
  var riskmaster=app.dc.riskmaster.toJSON();
  var ansCnt=$("#frmriskprofile #txtanswercount").prop("value")
  
  if(ansCnt!=app.dc._financialPQuestion.length)
  {
    alert("Please answer all the question.");
    return;
  }
  
  $("#frmriskprofile input").each(function( index ) {
    ref=$(this);
    if(ref.is(":checked"))
      weight=weight+ Number(ref.prop("value"))
  });
  
  for(var i=0;i<riskmaster.length;i++)
  {
    if(weight>riskmaster[i].weight_min && weight<riskmaster[i].weight_max)
    {
      riskprofile=riskmaster[i].riskprofile_name
      break;    
    }
  }
  _app_route.navigate('FinancialPlanning/result/'+riskprofile, { trigger:true });
//  app.fp.RPAllocation=new app.dv.RPAllocation({"riskprofile":riskprofile,el:"#maincontent"})
}

app.fp.createRPAllocationCharts=function(_viewRef,riskprofile)
{
  app.fp.RPAllocationCol=new app.dc.RPAllocation()
  app.fp.RPAllocationCol.fetch({
   data:{"riskprofile":riskprofile}
  ,success:function(model,response){
    var secwise=[],sectorwise=[],assetwise=[],chartObj={};
    
    //securitywise allocation
    var groups=_.groupBy(model.toJSON(),'securitysymbol');
    var totalweight=0;
    for(var key in groups)
    {
      for(var i=0;i<groups[key].length;i++)
      {
        totalweight=Number(Big(totalweight).plus(groups[key][i].sec_weight))
      }
      
      secwise[secwise.length]={"name":groups[key][0].securitysymbol,"y":totalweight}            
    }
    
    //sectorwise allocation
    groups=_.groupBy(model.toJSON(),'industry');
    totalweight=0;
    for(var key in groups)
    {
      for(var i=0;i<groups[key].length;i++)
        totalweight=Number(Big(totalweight).plus(groups[key][i].sec_weight))
      sectorwise[sectorwise.length]={"name":groups[key][0].industryname,"y":totalweight}            
    }
    
    //assetwise allocation
    groups=_.groupBy(model.toJSON(),'asset_class_code');
    totalweight=0;
    for(var key in groups)
    {
      for(var i=0;i<groups[key].length;i++)
        totalweight=Number(Big(totalweight).plus(groups[key][i].sec_weight))
      assetwise[assetwise.length]={"name":groups[key][0].asset_class_name,"y":totalweight}            
    }
    $("#info_riskprofile").html(riskprofile)
    chartObj={"id":"#securitywise_chart","data":secwise}
    app.createPieChart(chartObj);
    chartObj={"id":"#sectorwise_chart","data":sectorwise}
    app.createPieChart(chartObj);
    chartObj={"id":"#asset_chart","data":assetwise}
    app.createPieChart(chartObj);    
   }
  })  
}

