var _generateUserWebTicket = function() {
    var g_ctoken;
    var g_user_id;
    var g_password;
    return {
        process: function(request, response) {
            try {
                var result;
                this.g_user_id = request.getParameter("user_id").toLowerCase();
                log.debug("g_user_id :: " + this.g_user_id);
                this.g_password = request.getParameter("password");
                log.debug("g_password :: " + this.g_password);
                this.g_ctoken = request.getParameter("ctoken");
                log.debug("g_ctoken :: " + this.g_ctoken);
                result = this.validateUserSession();
                if (result.status == "unsuccess") {
                    log.error("webticket :: " + result.error);
                    return '{"status":"unsuccess","error":"' + result.error + '","msg":"","webticket":"","password_expire":""}';
                } else
                    return '{"status":"success","error":"","msg":"","webticket":"' + result.webticket + '","password_expire":"' + result.password_expire + '"}';
				//return "{'status':'success','error':'','msg':'','webticket':'" + result.webticket + "','password_expire':'" + result.password_expire + "'}";
            } catch (e) {
                log.error("Exception occurred in generating web ticket :" + e.toString());
                return '{"status":"unsuccess","error":"' + result.error + '","msg":"","webticket":"","password_expire":""}';
            }
        },
        generatesessionid: function() {
            var min = 100000000000000;
            var max = 999999999999999;
            var rawRandomNumber1 = (parseInt)(Math.random() * (max - min + 1)) + min;
            var rawRandomNumber2 = (parseInt)(Math.random() * (max - min + 1)) + min;
            var str = rawRandomNumber1.toString() + rawRandomNumber2.toString();
            var result = SQLResultset("select 1 from iwz_user_master where sessionid='" + str + "'");
            if (result.recordcount == 0)
                return str;
            else this.generatesessionid();
        },
        validateUserSession: function() {
            var vSQL, activchk, result, sessionid, updSQL, password_expire, login_attm_param, max_login_attempt;

            vSQL = "SELECT Count(*) total FROM iwz_user_master WHERE user_id='" + _encode(this.g_user_id) + "' AND inactive_applicable='Y' AND Trunc(inactive_date)<=Trunc(sysdate)";
            vSQL = SQLResultset(vSQL);
            activchk = vSQL.data[vSQL.recordno][vSQL.total];
            if(activchk != 0) {
                vSQL = " Begin UPDATE iwz_user_master SET active='N' WHERE user_id='" + _encode(this.g_user_id) + "' AND INACTIVE_APPLICABLE='Y' AND Trunc(INACTIVE_DATE)<=Trunc(sysdate); "
                vSQL = vSQL + " " + makeAudit({
                    issql: true,
                    tab: "iwz_user_master",
                    opr: "add",
                    res: "User Inactivated",
                    user: this.g_user_id,
                    sqlwhr: "1=1  and user_id = '" + _encode(this.g_user_id) + "'"
                }) + ";";
                vSQL = execSQL(vSQL);
                if (vSQL.status == "unsuccess") {
                  log.error("Failed to update inactive flag for user id " + this.g_user_id + "." + vSQL.error);
                  return {"status": "unsuccess","error": "User is inactive" + this.g_user_id,"msg": ""};
                }
            }
            
            // check pwd
            result = this.checkPwd(this.g_user_id, this.g_password)
            if (result.status == "success") {
                vSQL="select Round(To_Number((SYSDATE - LAST_ACCESSTIME) * 24 * 60)) as diff,decode((SELECT Count(*) FROM iwz_parameter WHERE paramname='timeout_interval'),0,60,(SELECT paramvalue FROM iwz_parameter WHERE paramname='timeout_interval')) timeinterval,t.*,nvl((SELECT lower(paramvalue) paramvalue FROM iwz_parameter WHERE paramname='allow-user-login'),'false') user_login_flag from iwz_user_master t where t.user_id ='" + _encode(this.g_user_id) + "'  and t.active='Y' "
                vSQL = SQLResultset(vSQL);
                if (vSQL.recordcount == 0) {
                    return {
                        "status": "unsuccess",
                        "error": "Invalid user id or password",
                        "msg": ""
                    };
                }
//                 if (vSQL.data[vSQL.recordno][vSQL.user_login_flag] == "false") {
//                     if (vSQL.data[vSQL.recordno][vSQL.sessionid] != "" && vSQL.data[vSQL.recordno][vSQL.login_flag] != "N" && Math.round(parseFloat(vSQL.data[vSQL.recordno][vSQL.timeinterval]) > parseFloat(vSQL.data[vSQL.recordno][vSQL.diff] + 1))) {
//                         return {
//                             "status": "unsuccess",
//                             "error": "This userid is already logged in!!!<BR> Try to login after " + Math.round(parseFloat(vSQL.data[vSQL.recordno][vSQL.timeinterval]) - parseFloat(vSQL.data[vSQL.recordno][vSQL.diff] + 1)) + " minutes <BR> Please contact the administrator.",
//                             "msg": ""
//                         };
//                     }
//                 }
//                 if (vSQL.data[vSQL.recordno][vSQL.locked] != "N")
//                     return {
//                         "status": "unsuccess",
//                         "error": "This userid is locked!!!\nPlease contact the administrator",
//                         "msg": ""
//                     };


                sessionid = this.generatesessionid();
                updSQL ="update iwz_user_master set sessionid = '" + _encode(sessionid) + "',last_accesstime =sysdate,login_flag='Y' where user_id='" + _encode(this.g_user_id) + "'; ";
                updSQL = updSQL + makeAudit({
                    issql: true,
                    tab: "iwz_user_master",
                    opr: "add",
                    user: this.g_user_id,
                    res: "updating session id",
                    sqlwhr: "1=1 and user_id = '" + _encode(this.g_user_id) + "' "
                }) + ";";                
                updSQL = "Begin " + updSQL + " End ;";
                updSQL = execSQLResultset(updSQL);
                if (updSQL.status == "unsuccess") {
                    log.error("Failed to update session for user.SQLException occurred : " + updSQL.error);
                    return {
                        "status": "unsuccess",
                        "error": "Failed to login.",
                        "msg": ""
                    };
                }

                password_expire = vSQL.data[vSQL.recordno][vSQL.password_expire];
                vSQL = "insert into iwz_login_log (user_id,login_date,IP,failed) values('" + _encode(this.g_user_id) + "',sysdate,'','') ;";
                vSQL = " Begin " + vSQL + " End ;";
                vSQL = execSQLResultset(vSQL);
                if (vSQL.status == "unsuccess")
                    log.error("Failed to update login log.SQLException occurred @@: " + updSQL.error);
                return {
                    "status": "success",
                    "error": "",
                    "msg": "User " + this.g_user_id + " logged in successfully.",
                    webticket: sessionid,
                    password_expire: password_expire
                };
            } else {
                vSQL = "insert into iwz_login_log (user_id,login_date,IP,failed) values('" + _encode(this.g_user_id) + "',SYSDATE ,'','N')";
                vSQL = execSQLResultset(vSQL);
                if (vSQL.status == "unsuccess")
                    log.error("Failed to update login log.SQLException occurred : " + vSQL.error);

                vSQL = "SELECT Count(*) total FROM iwz_login_log WHERE user_id ='" + _encode(this.g_user_id) + "' AND failed is NULL ";
                vSQL = SQLResultset(vSQL);
                if (vSQL.data[vSQL.recordno][vSQL.total])
                    vSQL = " SELECT count(*) cnt FROM iwz_login_log WHERE user_id ='" + _encode(this.g_user_id) + "' AND failed ='N' ";
                else
                    vSQL = " SELECT count(*) cnt FROM iwz_login_log WHERE user_id ='" + _encode(this.g_user_id) + "' AND failed ='N' AND login_date >=(SELECT Max(login_date) FROM iwz_login_log WHERE user_id ='" + _encode(this.g_user_id) + "' AND failed is null) "

                vSQL = SQLResultset(vSQL);
                login_attm_param = " select paramvalue from iwz_parameter where  paramname='max_failed_attempts' "
                login_attm_param = SQLResultset(login_attm_param);
                if (login_attm_param.recordcount == 0)
                    max_login_attempt = 2;
                else
                    max_login_attempt = parseFloat(login_attm_param.data[login_attm_param.recordno][login_attm_param.paramvalue]);

                if (parseFloat(vSQL.data[vSQL.recordno][vSQL.cnt]) > max_login_attempt) {
                    vSQL =" update iwz_user_master set locked='Y' where user_id ='" + _encode(this.g_user_id) + "';";
                    vSQL = vSQL + makeAudit({
                        issql: true,
                        tab: "iwz_user_master",
                        opr: "modify",
                        res: "User locked",
                        user: this.g_user_id,
                        sqlwhr: "1=1 and user_id = '" + _encode(this.g_user_id) + "' "
                    }) + ";";
                    vSQL = "Begin " + vSQL + " End ;";
                    vSQL = execSQLResultset(vSQL);
                    if (vSQL.status == "unsuccess")
                        log.error("Failed to update login log .SQLException occurred : " + vSQL.error);
                    return {
                        "status": "unsuccess",
                        "error": "User is locked.",
                        "msg": "",
                        "password_expire": ""
                    };
                }
                return {
                    "status": "unsuccess",
                    "error": "Invalid email address or password.",
                    "msg": "",
                    "password_expire":""
                };
            }


        },
        checkPwd: function(vUser, vPass) {
            var chkPwd,vSQL;
            vSQL = "select user_id,password,active from iwz_user_master where user_id ='" + _encode(vUser) + "'  and deleted ='N'";
            vSQL = SQLResultset(vSQL);
            if (vSQL.recordcount == 0)
                return {
                    "status": "unsuccess",
                    "error": "Invalid user id or password.",
                    "msg": ""
                };

            if(vSQL.data[vSQL.recordno][vSQL.active] == "N")
                return {
                    "status": "unsuccess",
                    "error": "This user id is not active.<br>Please contact the administrator to activate it <br> and then try to login again.",
                    "msg": ""
                };

            chkPwd = vSQL.data[vSQL.recordno][vSQL.password];
            chkPwd = this.convertIntoHash(chkPwd);
//            log.info(vPass +"\n"+chkPwd)
            if(vPass != chkPwd)
                return {
                    "status": "unsuccess",
                    "error": "Invalid user id or password",
                    "msg": ""
                };

            return {
                "status": "success",
                "error": "",
                "msg": "Ok to login"
            };
        },
        convertIntoHash: function(txt) {
            var hashObj = txt;
            log.debug("hashed password "+hashObj)
            hashObj = hashObj + this.g_ctoken;
            log.debug("password + token "+hashObj)
            hashObj = new jsSHA(hashObj, "TEXT");
            hashObj = hashObj.getHash("SHA-512", "HEX");
            log.debug("hashed password "+hashObj)
            return hashObj;
        }


    }
}
