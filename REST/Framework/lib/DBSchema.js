var iwebz = iwebz || {};

function With(o, p) {
    for (var prop in p) {
        o[prop] = p[prop];
    }
}

var DBSchema = {
    paramdata: null,
    readonly: {},
    primarykey: {
        iwz_cust_metadata: "cust_table_name,col_name",
        iwz_parameter: "paramname",
        iwz_user_master: "user_id",
        iwz_outbox: "msg_refno",
        if_transaction_req:"req_id",
        iwz_usernotification:"user_id,alertid"
    },
    foreignkey: {
        // student1: // master tables
        // {
        // student2:
        // {
        // keys:["s_id=s_id","name1=name1"] // master table field first and then child table field
        // }
        // },


    },
    validation: {
        // student1:[{rule:"paramdata.data[paramdata.age] < 100",msg:"Age Cannot be more than 100"}]
        // mfx_demo_master:[
        // {rule:"paramdata.curr_code!='USD'",msg:"USD Currency Code is not Allowed!"},
        // {rule:"paramdata.curr_code!='JPY'",msg:"JPY Currency Code is not Allowed!"}
        // ]
    },
    validate: function(paramdata, vTableName) {
        var vMsg = true;

        if (this["validation"]) {
            if (this["validation"][vTableName]) {
                var vLength = this["validation"][vTableName].length;
                for (var vCnt = 0; vCnt < vLength; vCnt++) {
                    var objTemp = this["validation"][vTableName][vCnt];

                    if (!eval(objTemp["rule"])) {
                        if (vMsg == true) vMsg = "";
                        vMsg += objTemp["msg"];
                    }
                }
            }
        }
        return vMsg;
    },
    getforiegnkey: function(vFT, vST) {
        if (this["foreignkey"][vFT]) {
            if (this["foreignkey"][vFT][vST]) {
                return this["foreignkey"][vFT][vST]["keys"];
            } else return null;
        } else if (this["foreignkey"][vST]) {
            if (this["foreignkey"][vST][vFT]) {
                return this["foreignkey"][vST][vFT]["keys"];
            } else return null;
        } else return null;

    },
    getprimarykey: function(vTablename) {
        return this["primarykey"][vTablename];
    },
    JoinCondition: {
        student1: {
            student2: "s_id=s_id" // firstchildtable field then master table field
        }

    },
    SystemKey: {
        // student1:{s_id : "this.incrementseq('student1','s_id')"},
        iwz_outbox: {
            msg_refno: "this.incrementseq('iwz_outbox','msg_refno')"
        },
        parameter: {
            srno: "this.incrementseq('parameter','srno')"
        },
        if_transaction_req:{req_id:"'seq_trans_reqno.NEXTVAL'"}                
    },

    getSystemkey: function(vTN, vFN, vPN) {
        this.paramdata = vPN;
        if (this["SystemKey"]) {
            if (this["SystemKey"][vTN]) {
                var vValue = eval(this["SystemKey"][vTN][vFN]);
                if (vValue) {
                    return vValue;
                } else {
                    return null;
                }
            } else
                return null;
        } else
            return null;

    },
    getjoincondition: function(vFirstTable, vSecondTable) {
        if (this["JoinCondition"][vFirstTable]) {
            return this["JoinCondition"][vFirstTable][vSecondTable];
        } else if (this["JoinCondition"][vSecondTable]) {
            return this["JoinCondition"][vSecondTable][vFirstTable];
        } else return false;
    },
    // specify the not null columns with table name in this way
    isNull: function(vCname) {
        var Msg = new Array();
        var colArray = vCname.split(',');
        for (var v = 0; v < colArray.length; v++) {
            if (!this.paramdata[colArray[v]] || this.paramdata[colArray[v]] == "") {
                Msg[Msg.length] = colArray[v];
            }
        }
        return Msg.join(',');
    },
    isValOk: function(vCname) {
        var Msg = new Array();
        var tempVal = "";
        var tempCol = "";
        var tempMsg = "";
        var colArray = vCname.split(',');
        for (var v = 0; v < colArray.length; v++) {
            tempCol = "";
            tempVal = "";
            tempMsg = colArray[v].split(':')
            tempCol = tempMsg[0];
            tempVal = tempMsg[1];
            ///return this.paramdata[tempCol];
            if (tempVal.indexOf(this.paramdata[tempCol]) == -1) {
                Msg[Msg.length] = tempCol + " Can Be " + tempVal;
            }
        }
        return Msg.join(',');
    },
    isKeyOk: function(vCname) {
        var Msg = new Array();
        var tempVal = "";
        var tempCol = "";
        var tempMsg = "";
        var tempTab = "";
        var vSQL = "";

        var colArray = vCname.split(',');
        for (var v = 0; v < colArray.length; v++) {
            tempCol = "";
            tempVal = "";
            tempTab = "";
            tempMsg = colArray[v].split(':')
            tempCol = tempMsg[0];
            tempTab = tempMsg[1];
            tempVal = tempMsg[2];
            vSQL = "select count(*) from " + tempTab + " where " + tempVal + "='" + this.paramdata[tempCol] + "'";

            vSQL = SQLResultset(vSQL);
            if (vSQL.status == "unsuccess") {
                Msg[Msg.length] = tempCol + " Foreign key " + tempTab + "(" + tempVal + ") not Available";
                continue;
            } else if (vSQL.data[0][0] == 0) {
                Msg[Msg.length] = tempCol + " Foreign key " + tempTab + "(" + tempVal + ") not Available";
            }
        }
        return Msg.join(',');
    },
    TransValidation: {
        version: {
            add: {
                notNullFields: "patch_no,codebase,prev_patch_no,released_by,total_no_objects,authorised_by,parentaddon,qa_certified",
                enumListFields: "codechanges:yes/Yes/YES/yES/no/No/NO,dbchanges:yes/Yes/YES/yES/no/No/NO,isaddon:yes/Yes/YES/yES/no/No/NO,qa_certified:yes/Yes/YES/yES/no/No/NO",
                recordConfig: [{
                        rule: "iVer.chkFmt(this.paramdata);",
                        msg: "Date format for (release_date) Should be Proper"
                    }, {
                        rule: "iVer.chkObjLength(this.paramdata);",
                        msg: "Total No of Objects does not match with object specified"
                    }, {
                        rule: "iVer.chkTirLength(this.paramdata);",
                        msg: "Total No of Tirs does not match with tir specified"
                    }, {
                        rule: "iVer.chkImpLength(this.paramdata);",
                        msg: "Total No of Impacts does not match with Impact specified"
                    }, {
                        rule: "iVer.chkColmnLength('patch_no','ver_patch_master',this.paramdata);",
                        msg: "patch_no does not match with column"
                    }, {
                        rule: "iVer.chkColmnLength('codebase','ver_patch_master',this.paramdata);",
                        msg: "codebase does not match with column"
                    }, {
                        rule: "iVer.chkColmnLength('prev_patch_no','ver_patch_master',this.paramdata);",
                        msg: "codebase does not match with column"
                    }, {
                        rule: "iVer.chkColmnLength('released_by','ver_patch_master',this.paramdata);",
                        msg: "codebase does not match with column"
                    }, {
                        rule: "iVer.chkObjectLength(this.paramdata);",
                        msg: "object length does not match with column in database"
                    }, {
                        rule: "iVer.chkTirObjectLength(this.paramdata);",
                        msg: "tir length does not match with column in database"
                    }, {
                        rule: "iVer.chkImpactObjectLength(this.paramdata);",
                        msg: "impact length does not match with column"
                    }

                ]
            }
        }


    },
    transValidate: function(vTname, vAname, vParam) {
        LogDebug("DBSchema.js - vSQL : " + vTname + "---" + vAname + "--" + vParam)
        var vMsg = "";
        this.paramdata = vParam;
        var tmpMsg = "";
        if (this["TransValidation"][vTname]) {
            // 					 appendFileText(serverPath+"/Durgesh.txt","\n vSQL : 1");
            if (this["TransValidation"][vTname][vAname]) {
                ///appendFileText(serverPath+"/Append.txt","\n vSQL : 2");
                if (this["TransValidation"][vTname][vAname]['notNullFields']) {
                    //appendFileText(serverPath+"/Append.txt","\n vSQL : 3");
                    tmpMsg = "";
                    tmpMsg = this.isNull(this["TransValidation"][vTname][vAname]['notNullFields']);
                    if (tmpMsg != "") {
                        vMsg = vMsg + "<BR/>Following Fields Cannot be Null : " + tmpMsg;
                    }
                }
                if (this["TransValidation"][vTname][vAname]['enumListFields']) {
                    // 							appendFileText(serverPath+"/Durgesh.txt","\n vSQL : 4");
                    tmpMsg = "";
                    tmpMsg = this.isValOk(this["TransValidation"][vTname][vAname]['enumListFields']);
                    if (tmpMsg != "") {
                        vMsg = vMsg + "<BR/>Following Fields Values Should be as Following : " + tmpMsg;
                    }
                }
                if (this["TransValidation"][vTname][vAname]['foreignKeyFields']) {
                    // 							appendFileText(serverPath+"/Durgesh.txt","\n vSQL : 5");
                    tmpMsg = "";
                    tmpMsg = this.isKeyOk(this["TransValidation"][vTname][vAname]['foreignKeyFields']);
                    if (tmpMsg != "") {
                        vMsg = vMsg + "<BR/>Following Fields Should be Available: " + tmpMsg;
                    }
                }
                if (this["TransValidation"][vTname][vAname]['recordConfig']) {
                    // 							appendFileText(serverPath+"/Durgesh.txt","\n vSQL : 6");
                    var vLength = this["TransValidation"][vTname][vAname]["recordConfig"].length;
                    for (var vCnt = 0; vCnt < vLength; vCnt++) {
                        // 								appendFileText(serverPath+"/Durgesh.txt","\n vSQL : 7");
                        var objTemp = this["TransValidation"][vTname][vAname]["recordConfig"][vCnt];
                        tmpMsg = "";
                        // 								appendFileText(serverPath+"/Durgesh.txt","\n"+objTemp["rule"]);
                        LogDebug("DBSchema.js - " + objTemp["rule"]);
                        try {
                            tmpMsg = eval(objTemp["rule"]);
                        } catch (e) {
                            //appendFileText(serverPath+"/log/framewrk.txt","\n Exception "+e);
                            vMsg = vMsg + "<BR/>" + e;
                        }

                        if (!tmpMsg) {
                            vMsg = vMsg + "<BR/>" + objTemp["msg"]
                        }
                    }

                }
            } else
                return vMsg;
        }
        return vMsg;
    },
    transColumnValue: "",
    transColumn: {
        //iwz_user_master:{password:"'toolkit.encrypt('+this.transColumnValue+')'"},
        // if_od_int_det:{od_int_seqno:"'od_int_seqno.NEXTVAL'"},
        positions: {
            operationdate: "'sysdate'"
        },
        if_transaction_req:{req_id:"'seq_trans_reqno.NEXTVAL'"}

    },
    transform: function(vTN, vCN, vCV) {
        this.transColumnValue = vCV;
        if (this["transColumn"][vTN]) {
            if (this["transColumn"][vTN][vCN]) {
                return eval(this["transColumn"][vTN][vCN]);

            } else
                return this.transColumnValue;
        } else
            return this.transColumnValue;
    },
    getcurseq: function(vTN, vFN) {

        var vSql = "select * from sequencetable where context='" + vTN + "." + vFN + "'";
        //return vSql ;

        var vSQL = SQLResultset(vSql);
        var vTp = 0;
        var vS = "";
        var vP = "";
        //return vSQL.recordcount;
        if (vSQL.recordcount > 0) {
            vTp = vSQL.fieldbyname('seq');
            return vTp;
        }

    },
    incrementseq: function(vTN, vFN) {
        var vSql = "select * from sequencetable where upper(context)=upper('" + vTN + "." + vFN + "')";
        //return vSql ;

        var vSQL = SQLResultset(vSql);
        var vTp = 0;
        var vS = "";
        var vP = "";
        //return vSQL.recordcount;
        if (vSQL.recordcount > 0) {
            vTp = vSQL.fieldbyname('seq');
            // 							vP = vSQL.fieldbyname('prefix');
            vS = "update sequencetable set seq = seq+1 where upper(context)=upper('" + vTN + "." + vFN + "')";
            //return vS ;
            vS = execSQLResultset(vS);
            //return vS.status;
            if (vS.status == "success") {
                vTp++;
                return vTp;
                // 								return vP+""+vTp;
            } else return "";
        } else {
            //added by mohsin 23/06/2014 - to start counter from max+1 instead of 1
            vSEQ = getCode("select nvl(max(to_number(" + vFN + ")),0)+1 from " + vTN);
            vS = "insert into sequencetable values(upper('" + vTN + "." + vFN + "'),'" + vSEQ + "')";

            //							vS = "insert into sequencetable values('" + vTN + "." + vFN + "',1)";
            vS = execSQLResultset(vS);

            if (vS.status == "success")
                return vSEQ;
            //								return (1);
            else return "5555";
        }
    },
    decrementseq: function(vTN, vFN) {
        objSeqTb = new Packages.jade.Table();
        objSeqTb.setconnection(application);
        var vSql = "select * from sequencetable where context='" + vTN + "." + vFN + "'";
        objSeqTb.open(vSql);
        var vTp = 0;
        var vS = "";
        if (objSeqTb.recordcount() > 0) {
            objSeqTb.first();
            //return objSeqTb.fieldasdouble(2);
            vTp = objSeqTb.fieldasint(2);
            if (vTp > 0) {
                vS = "update sequencetable  set seq = seq-1 where context='" + vTN + "." + vFN + "'";
                if (objSeqTb.execute(vS)) {
                    objSeqTb.execute("commit");
                    return (vTp - 1);
                } else {
                    return objSeqTb.errorstring();
                }
            } else {
                return 0;
            }
        } else {
            vS = "insert into sequencetable values('" + vTN + "." + vFN + "',0)";
            if (objSeqTb.execute(vS)) {
                objSeqTb.execute("commit");
                return (1);
            } else {
                return objSeqTb.errorstring();
            }
        }
    },
    duplicateRecChk: function(paramdata, tablename) {
        if (this.primarykey[tablename]) {
            var whereClause = [];
            var pkey = this.primarykey[tablename];
            pkey = pkey.split(',');

            for (var i = 0, len = pkey.length; i < len; i++) {
                whereClause[whereClause.length] = "and " + pkey[i] + "='" + _encode(paramdata[pkey[i]]) + "'";
            }
            if (whereClause.length != 0) {
                var vSQL = "Select count(*) cnt from " + tablename + " where 1=1 " + whereClause.join(" ");
                try {
                    vSQL = SQLResultset(vSQL);
                    if (vSQL.fieldbyname('cnt') == 0)
                        return true;
                    else
                        return false;
                } catch (error) {
                    return false
                }
            } else
                return true;
        } else
            return true;
    },
    createLike: {
        //"wm_security_master":["security_type","rating1","rating2"] //Definition
        "wm_client_ac_master": ["created_on"] //Definition
    },
    dataset: {
        // "ds_user":{"query":"select * from iwz_user_master","datefield":"creation_date","name":"Ds user","column_list":["ds_user.user_id","ds_user.user_name","ds_user.password","ds_user.branch_code","ds_user.profile_id","ds_user.expiry_days","ds_user.creation_date","ds_user.lastpwd_updated","ds_user.active","ds_user.created_by","ds_user.user_short_code","ds_user.ip_address","ds_user.locked","ds_user.sessionid","ds_user.last_login_time","ds_user.lastloginip","ds_user.last_accesstime","ds_user.location","ds_user.login_flag","ds_user.counter","ds_user.limits","ds_user.reports_to","ds_user.visible","ds_user.isadmin","ds_user.deleted","ds_user.email_id","ds_user.entity_code","ds_user.password_expire","ds_user.inactive_applicable","ds_user.inactive_date","ds_user.mac_address"]}

    }
}

DBSchema.primarykey.mfx_viewmaster = 'viewid';
DBSchema.primarykey.mfx_actionsdef = 'actionid';
DBSchema.primarykey.iwz_accessrights = 'roleid,user_id,sysobjname,sysobjtype';
DBSchema.primarykey.ver_patch_master = 'patch_no';
DBSchema.primarykey.iwz_eod_process = 'eod_process_id';
DBSchema.primarykey.iwz_eod_jobs = 'eod_sr_no';
DBSchema.primarykey.iwz_role_master = 'roleid';
DBSchema.TransValidation.parameter = {
    deleted: {},
    add: {},
    modify: {}
};
With(DBSchema.TransValidation.parameter.add, {
    notNullFields: "paramname",
    enumListFields: "",
    foreignKeyFields: "",
    recordConfig: [{
        rule: "parameterExists(this.paramdata.paramname,this.paramdata.entity_code,'add')",
        msg: "<B>Parameter Name already exists</B>"
    }]
});

With(DBSchema.TransValidation.parameter.modify, {
    notNullFields: "paramname",
    enumListFields: "",
    foreignKeyFields: "",
    recordConfig: [{
        rule: "parameterExists(this.paramdata.paramname,this.paramdata.entity_code,'modify')",
        msg: "<B>Parameter Name already exists. </B>"
    }]
});


DBSchema.TransValidation.iwz_accessrights = {
    add: {}
};
With(DBSchema.TransValidation.iwz_accessrights.add, {

    recordConfig: [{
        rule: "isAccessExst(this.paramdata);",
        msg: "Record cannot be added.<br>Access Right Already Added For Selected Entity."
    }]

});


for (key in DBSchema.primarykey) {
    DBSchema.primarykey[iwebz.table_prefix + "" + key] = DBSchema.primarykey[key];
}

function getDbFkey(pt, ct, pk) {
    if (pt == "" || ct == "" || pk == "") return "";
    //get fkey list from dbschema
    var fkeys = DBSchema.getforiegnkey(pt, ct)
    if (!fkeys) {
        if (DBSchema.primarykey[ct])
            return DBSchema.primarykey[ct]
        else
            return pk;

    }
    var fkey_ind = "";
    //Loop thru the fkey list
    for (var idx = 0; idx < fkeys.length; idx++) {
        //get the parent child key pair
        fkey_ind = fkeys[idx].split("=")
            //check if key pair defined properly
        if (fkey_ind.length < 2) continue;
        else if (fkey_ind[0] == pk) return fkey_ind[1]; // check for parent key
    }
    //if no fk then return parent key by default
    return pk
}
