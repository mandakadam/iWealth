app.newsfeed={}
app.dc._newsfeed=(app.dc._generic(
  {   
    data:{user_id:app.getData("_user_id")} 
    ,_methods: {
        read: "dataset/newsfeed"
    }   
    ,parse:function(response){  
		if(response.status=="success" && response.vdata)                
          return response.vdata
    }      
  }))
app.onGetNewsFeed =function()
{
 app.newsfeed._newsfeedCol=new app.dc._newsfeed();
 app.newsfeed._newsfeedCol.fetch({
   	success:function(model){
   		var vhtml=""
      vhtml += '<ul class="cls-newsfeed-ul">'
      vhtml += '{{#data}}'
      vhtml += '<li>'
        vhtml += '<a href="{{url}}" target="_blank" class="list-group-item">'
            vhtml += '<div class="media">'
                vhtml += '<div class="media-left">'
                    vhtml += '<img src="{{img}}" style="width:70px; "/>'
                vhtml += '</div>'
                vhtml += '<div class="media-body">'
                vhtml += '<h3>{{title}}</h3>'
                      vhtml += '<p>{{description}}</p>'
                vhtml += '</div>'
            vhtml += '</div>'
          vhtml += '</a>'
        vhtml += '</li>'
    vhtml += '{{/data}}'
    vhtml += '</ul>'


   	  /*vhtml += '<ul class="cls-newsfeed-ul">{{#data}}<li><a href="{{url}}" target="_blank">{{title}}</a></li>{{/data}}</ul>'*/
   		vhtml=Mustache.to_html(vhtml,{"data":model.toJSON()})   		
   		$("#maincontent").html(vhtml);   
   	}
   });	
}
