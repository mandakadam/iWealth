var _fetchPasswordConfig = function() {
    return {
        process: function(request, response, userObj) {
            try {

					log.info("Fetching password configuration parameters");
					var result;
					result = this.getPasswordParameters();
					if( result.status == "unsuccess")
					{
						log.error("Failed to fetch password configuration parameters.");
						return '{"status":"unsuccess","error":"Failed to fetch password configuration parameters.","msg":""}';
					}
					else
						return '{"status":"success","error":"","msg":"","data":"'+JSON.stringify( result.data )+'"}';
							

            } catch (e) {
                log.error("Exception in fetching password configuration ." + e.toString());
				return '{"status":"unsuccess","error":"Failed to fetch password configuration parameters.'+e.toString()+'","msg":""}';
                return "";
            }
        }
		,getPasswordParameters:function(){
			
			var vObj={};
			var myPasswordParameters="select paramname,paramvalue from iwz_parameter where paramname in ('bshouldalphanumeric','bshouldcapitalize','minpasswordlength','maxpasswordlength','allowsspecialchr','matchpassworduserid','limitlength','checkpasswordhistory','passwordhistorycount','expiry_days','checkdateexist','checkconsecutivechar','shouldcontain1lowcaselet') ";
			log.debug("Password parameters query :: "+myPasswordParameters);
			myPasswordParameters=SQLResultset(myPasswordParameters);
			for(i=0;i<myPasswordParameters.recordcount;i++)
			{
				vObj[myPasswordParameters.data[i][0]]=myPasswordParameters.data[i][1];
			}
			return {"status":"success","error":"","msg":"","data":vObj};
		}
		
    }
}
