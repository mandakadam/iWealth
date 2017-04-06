var _onForgotPassword = function() {
    return {
        process: function(request, response) {
            try {
                var vSQL, userid, hpass, uSQL, vdata, vObj, result;

                log.info("Processing forgot password request.");
                userid = request.getParameter("user_id");
                vSQL = "select * from iwz_user_master where user_id ='" + _encode(userid) + "'";
                log.info("vSQL"+vSQL);
                vSQL = SQLResultset(vSQL);
                if (vSQL.recordcount == 0) {
                    log.info("Invalid user id.Please check user id.");
                    return '{"status": "unsuccess","error": "Invalid user id.Please check user id.","msg": ""}';
                }

                if (vSQL.data[vSQL.recordno][vSQL.isactive] == "N") {
                    log.info("This user is not active.Please contact administrator.");
                    return '{"status": "unsuccess","error": "This user is not active.Please contact administrator.","msg": ""}';
                }

                if (vSQL.data[vSQL.recordno][vSQL.email_id] == "") {
                    log.info("Email ID does not exists for this user.Please contact administrator.");
                    return '{"status": "unsuccess","error": "Email ID does not exists for this user.Please contact administrator.","msg": ""}';
                }

                hpass = this.doUserPasswordHashing(userid);
                if (hpass.status == "unsuccess") {
                    log.info("Failed to generated new password. " + hpass.error);
                    return '{"status": "unsuccess","error": "Failed to generated new password.","msg": ""}';
                }

                hpass = hpass.hashpass;
                uSQL = makeAudit({
                    issql: true,
                    tab: "iwz_user_master",
                    opr: "modify",
                    res: "User locked",
                    user: userid,                    
                    sqlwhr: "1=1 and user_id = '" + _encode(userid) + "' "
                }) + ";";

                uSQL = uSQL + " update iwz_user_master set password = '" + _encode(hpass) + "',password_expire ='Y' where lower(user_id) = '" + _encode(userid) + "' ; "
                uSQL = " Begin " + uSQL + " End ; ";
                 log.info("uSQL::::."+uSQL);
                uSQL = execSQLResultset(uSQL);

                if (uSQL.status == "unsuccess") {
                    log.error("Failed to update new password. " + uSQL.error);
                    return '{"status": "unsuccess","error": "Failed to update new password.","msg": ""}';
                }

                vdata = "{'user_id':'" + userid + "','user_name':'" + vSQL.data[vSQL.recordno][vSQL.user_name] + "','email_id':'" + vSQL.data[vSQL.recordno][vSQL.email_id] + "','pwd':'" + hpass + "'}";
                vObj = {
                    "event_id": "E3",
                    "level": "1",
                    "vdata": vdata
                };
                
                result = iEN.onProcessNotification(vObj);                
                result = eval('(' + result + ')');
                if (result.status == "unsuccess") {
                    log.error("Failed to send event notification." + result.error);
                    return '{"status": "unsuccess","error": "Failed to send event notification.","msg": ""}';
                }

                return '{"status": "success","error": "Password changed for user id ' + userid + '. Event notification sent.","msg": ""}';

            } catch (e) {
                log.error("Exception in generating user token." + e.toString());
                return "";
            }
        },
        doUserPasswordHashing: function(user_id) {
            if (!user_id)
                return {
                    "status": "unsuccess",
                    "error": "Invalid user ID.Cannot perform password hashing",
                    "msg": ""
                };

            var randomstr, _esapiutils, es, hashObj;
            _esapiutils = Java.type('custom.classes.EsapiUtils');
            es = new _esapiutils();
            randomstr = "" + es.getRandomString();
            hashObj = new jsSHA(randomstr, "TEXT");
            hashObj = hashObj.getHash("SHA-512", "HEX");
            
            return {
                "status": "success",
                "error": "",
                "msg": "",
                "hashpass": hashObj
            };

        }
    }
}
