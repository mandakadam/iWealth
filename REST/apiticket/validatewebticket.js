var validateWebTicket = function() {
    return {
        process: function(request, response) {
            try {

                var sid = request.getParameter("_ticket");
                log.debug("Validationg ticket :" + sid);
                if ("".equalsIgnoreCase(sid) || "null".equalsIgnoreCase(sid) || !sid) {
                    log.error("Invalid web ticket "+sid+" .");
                    return {
                        "status": "unsuccess",
                        "error": "Invalid web ticket",
                        "msg": "",
                        "userObj": ""
                    };
                }
                var vSQL = " SELECT (timeinterval-diff) timediff ,u.* FROM (select Round(To_Number((SYSDATE - LAST_ACCESSTIME) * 24 * 60)) as diff,decode((SELECT Count(*) FROM iwz_parameter WHERE paramname='timeout_interval'),0,60,(SELECT paramvalue FROM iwz_parameter WHERE paramname='timeout_interval')) timeinterval,u.USER_ID,u. USER_NAME,u. BRANCH_CODE,u. PROFILE_ID,u. USER_SHORT_CODE,u. SESSIONID,u. LOCATION,u. COUNTER,u. REPORTS_TO,u. ENTITY_CODE,u.isadmin from iwz_user_master u where sessionid ='"+ _encode(sid) +"' and active='Y') u";
//                 vSQL = vSQL + " FROM ";
//                 vSQL = vSQL + " ( ";
//                 vSQL = vSQL + "   select Round(To_Number((SYSDATE - lastconnectedtime) * 24 * 60)) as diff ";
//                 vSQL = vSQL + "   ,decode((SELECT Count(*) FROM iwz_parameter WHERE paramname='timeout_interval'),0,60,(SELECT paramvalue FROM iwz_parameter WHERE paramname='timeout_interval')) timeinterval ";
//                 vSQL = vSQL + "   ,u.loginid USER_ID,u.username USER_NAME,u.cl_branch_code branch_code,u.profileid PROFILE_ID,u.cl_user_short_code user_short_code,u.cl_web_ticket ";
//                 vSQL = vSQL + "   ,u.cl_location location ";
//                 vSQL = vSQL + "   ,u.cl_counter COUNTER,u.cl_reports_to reports_to,u.cl_entity_code ENTITY_CODE,u.cl_isadmin isadmin  ";
//                 vSQL = vSQL + "   from userlist u ";
//                 vSQL = vSQL + "   where cl_web_ticket ='" + _encode(sid) + "'  ";
//                 vSQL = vSQL + "   and active='T' ";
//                 vSQL = vSQL + " ) u ";

                vSQL = SQLResultset(vSQL);
                if (vSQL.recordcount == 0) {
                    log.error("No data found for the web ticket.Invalid web ticket "+sid);
                    return {
                        "status": "unsuccess",
                        "error": "No data found for the web ticket.Invalid web ticket",
                        "msg": "",
                        "userObj": {}
                    };
                }
                if (vSQL.fieldbyname("timediff") <= 0) {

                    var vSQL = "update iwz_user_master set sessionid='',LAST_LOGIN_TIME='',LAST_ACCESSTIME=sysdate,login_flag='N',LASTLOGINIP='' where sessionid=" + _encode(sid) + "";
                    vSQL = execSQL(vSQL);
                    log.debug("Ticket session expired.");
                    return {
                        "status": "unsuccess",
                        "error": "Ticket session expired.",
                        "msg": "",
                        "userObj": ""
                    };
                }

                for (var i = 0; i < vSQL.fields.length; i++) {
                    userObj[vSQL.fields[i]] = vSQL.fieldbyname(vSQL.fields[i]);
                }
                userObj.sessionid = sid;
                userObj.profileid = vSQL.fieldbyname("profile_id");
                userObj.userid = vSQL.fieldbyname("user_id");
                userObj.branchcode = vSQL.fieldbyname("branch_code");
                //userObj.user_name=adataset.fieldbyname("user_name");


                var vRoleSQL = "SELECT um.roleid ,rm.visibility,rm.rolename FROM iwz_user_role_master um,iwz_role_master rm WHERE user_id='" + _encode(userObj.userid) + "' AND  um.roleid=rm.roleid"
                vRoleSQL = SQLResultset(vRoleSQL);
                for (var k = 0; k < vRoleSQL.recordcount; k++) {
                    vRoleSQL.recordno = k;
                    userObj['roles'][userObj['roles'].length] = {
                        role: vRoleSQL.fieldbyname('roleid'),
                        rolename: vRoleSQL.fieldbyname('rolename'),
                        visibility: vRoleSQL.fieldbyname('visibility')
                    };
                }
                vSQL = null;

                var vSql = "update iwz_user_master set last_accesstime=sysdate where sessionid='" + _encode(sid) + "'";
                var res = execSQL(vSql);
                log.debug("Web Ticket " + sid + " is valid.");
                return {
                    "status": "success",
                    "error": "",
                    "msg": "Valid webticket",
                    "userObj": userObj
                };

            } catch (e) {
                log.error("Error in Validating ticket:" + e.toString());
                return {
                    "status": "unsuccess",
                    "error": e.toString(),
                    "msg": "Invalid webticket",
                    "userObj": {}
                };
            }
        }
    }
}
