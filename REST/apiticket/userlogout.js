var onUserLogOut = function() {
    return {
        process: function(request, response) {
            try {
                var sid = request.getParameter("_ticket");
                log.info("Processing logout request for web ticket " + sid);
                var vSQL;
                var userid;
                vSQL = "select user_id  from iwz_user_master where sessionid = '" + _encode(sid) + "' ";  
                 log.info("vSQL " + vSQL);                               
                vSQL = SQLResultset(vSQL);
                if (vSQL.recordcount == 0) {
                    log.info("No valid web session for ticket " + sid);
                    return '{"status": "unsuccess","error": "No valid web session for ticket '+sid+'","msg": ""}';

                }


                userid = vSQL.data[vSQL.recordno][vSQL.loginid];
                vSQL = makeAudit({
                    issql: true,
                    tab: "iwz_user_master",
                    opr: "add",
                    res: "Logout user",
                    user: this.g_user_id,                    
                    sqlwhr: "1=1  and sessionid = '" + _encode(sid) + "' "
                }) + ";";
                vSQL = vSQL + " update iwz_user_master set sessionid = '',last_accesstime=sysdate,login_flag='N' where sessionid = '" + _encode(sid) + "' ; ";
                vSQL = vSQL + " update iwz_login_log set LOGOUT =sysdate WHERE user_id ='" + _encode(userid) + "' AND login_date =(SELECT Max(login_date) FROM iwz_login_log WHERE user_id ='" + _encode(userid) + "');";

                vSQL = " Begin " + vSQL + " End ;";
                vSQL = execSQLResultset(vSQL);
                if (vSQL.status == "unsuccess") {
                    log.error("Failed to logout web session for ticket " + sid + "." + vSQL.error);
                    return '{"status": "unsuccess","error": "Failed to logout web session for ticket '+ sid+'","msg": ""}';
                }

                return '{"status": "success","error": "","msg": "Session logout successful."}';

            } catch (e) {
                log.error("Exception in log out service." + e.toString());
                return "";
            }
        }
    }
}
