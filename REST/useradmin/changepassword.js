var _changeUserPassword = function() {
    return {
        process: function(request, response, userObj) {
            try {
					log.info("User password change request");
					// return '{"status":"success","error":"","msg":"Password changed successfully.","passval":"1"}'
					var jstring,result;
					jstring = request.getParameter("jstring");					
					jstring = eval('('+jstring+')');
					result = this.doChangePassword( jstring,userObj );
					if( result.status == "unsuccess" )
					 {
						 if(result.passval)
							return '{"status":"unsuccess","error":"'+result.error+'","msg":"","passval":"'+result.passval+'"}';
						else
							return '{"status":"unsuccess","error":"'+result.error+'","msg":"","passval":"0"}';
					 } 
					 else
						 return '{"status":"success","error":"","msg":"Password changed successfully.","passval":"1"}';
					
            } catch (e) {
                log.error("Exception in change password process ." + e.toString());
                return "";
            }
        }
		,doChangePassword:function( o,userObj ){
			if( !o )
			{
				log.error("Invalid parameter in function doChangePassword.");
				return {"status":"unsuccess","error":"Invalid parameter in function doChangePassword.","msg":""};
			}
			
			var vSQL
				,result;
			if(!this.checkPasswordHistory( o,userObj ))
			{
				log.debug("Password history check failed.");
				vSQL = "select decode((SELECT Count(*) FROM iwz_parameter WHERE paramname='passwordhistorycount'),'0','3',(SELECT paramvalue FROM iwz_parameter WHERE paramname='passwordhistorycount')) passwordhistorycount from dual";
			
				vSQL=SQLResultset(vSQL);
				return {"status":"unsuccess","msg":"","error":"New Password should not match with your last "+vSQL.data[0][0] +" passwords."};
			}
			result = this.validateOldNewPassword( o,userObj );
			if( result.status == "unsuccess" )
				return {"status":"unsuccess","msg":"","error":result.error,"passval":result.passval};
			
			result = this.updateNewPassword( o,userObj );
			return result; 
			
		}
		,checkPasswordHistory:function( o,userObj ){
		
			var vSQL=[];
			vSQL[ vSQL.length ] = " SELECT * FROM ";
			vSQL[ vSQL.length ] = " ( ";
			vSQL[ vSQL.length ] = " SELECT * FROM ";
			vSQL[ vSQL.length ] = " ( ";
			vSQL[ vSQL.length ] = " SELECT password FROM audit_iwz_user_master u ";
			vSQL[ vSQL.length ] = " WHERE user_id='"+_encode( userObj.user_id )+"' ";
			vSQL[ vSQL.length ] = " AND lower(sys_auditreason) in ('password change','add') ";
			vSQL[ vSQL.length ] = " ORDER BY sys_auditdate DESC ";
			vSQL[ vSQL.length ] = " ) ";
			vSQL[ vSQL.length ] = " WHERE ROWNUM<=decode((SELECT Count(*) FROM iwz_parameter WHERE paramname='passwordhistorycount'),'0','3',(SELECT paramvalue FROM iwz_parameter WHERE paramname='passwordhistorycount'))) ";
			vSQL[ vSQL.length ] = " WHERE password ='"+_encode( o.newpass )+"' ";
			log.debug("Password history check query :: "+vSQL.join("\n"));
			vSQL = SQLResultset( vSQL.join("\n") );
			if( vSQL.recordcount == 0 )
				return true;
			else
				return false;
		}
		,validateOldNewPassword:function( o,userObj )
		{
			if( !o )
			{
				log.error("Invalid parameter in function validateOldNewPassword.");
				return {"status":"unsuccess","error":"Invalid parameter in function validateOldNewPassword.","msg":""};
			}
			var vSQL;
			vSQL=" select * from iwz_user_master where user_id ='"+_encode( userObj.user_id )+"' and password= '"+_encode(o.oldpass)+"' and active='Y' ";
	
			vSQL = SQLResultset( vSQL );
			log.debug("usermaster query :: "+vSQL);
			if( vSQL.recordcount == 0 )
			{
				log.info("Please check old password.");
				return {"status":"unsuccess","error":"Please check old password","passval":"2"};
			}
				
			if( o.oldpass == o.newpass )
			{
				log.info("New password should not be same as old password.");
				return {"status":"unsuccess","error":"New password should not be same as old password","msg":"","passval":"3"};
			}
			
			if( o.newpass != o.confirmpass )
			{
				log.info("New Password doesnt match.");
				return {"status":"unsuccess","error":"New Password doesnt match","msg":"","passval":"3"};
			}
			
			return {"status":"success","error":"","msg":""};	
		}
		,updateNewPassword:function( o,userObj ){
			if( !o )
			{
				log.error("Invalid parameter in function updateNewPassword.");
				return {"status":"unsuccess","error":"Invalid parameter in function updateNewPassword.","msg":""};
			}
			var vSQL
				,userdata
				,pSQL;
			vSQL = " select * from iwz_user_master where user_id ='"+_encode( userObj.user_id )+"' and password= '"+_encode(o.oldpass)+"' and active='Y' "	
			userdata = SQLResultset( vSQL );
			log.debug("vSQL :: "+vSQL);
			if( userdata.recordcount != 0 )
			{
				pSQL = makeAudit({
                        issql: true,
                        tab: "iwz_user_master",
                        opr: "modify",
                        res: "password change",
                        user: userObj.user_id,                        
                        sqlwhr: "1=1 and user_id = '" + _encode( userObj.user_id ) + "' "
                    }) + ";";
					
				pSQL = pSQL +" UPDATE iwz_user_master SET password='"+_encode( o.newpass )+"',lastpwd_updated=SYSDATE,password_expire='N' WHERE user_id='"+_encode( userObj.user_id )+"' ; ";
				pSQL = pSQL+ " insert into iwz_login_log (user_id,login_date,IP,failed) values('" + _encode( userObj.user_id ) + "',sysdate,'','') ; ";
				pSQL = " Begin "+pSQL+" End ; ";
				log.debug("Update password final SQL :: "+pSQL);
				pSQL = execSQLResultset( pSQL );
				if( pSQL.status == "unsuccess" )
					return {"status":"unsuccess","error":"Failed to execute update.","msg":"","passval":"2"};	
				return {"status":"success","error":"","msg":"","passval":"1"};	
			}
			return {"status":"unsuccess","error":"Failed to update password.","msg":"","passval":"2"};	
		}
		
    }
}
