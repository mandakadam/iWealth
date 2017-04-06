function test(objParamData)
{
	// dlog(objParamData["permitted_through"]);
	return false;
}

function chkBlankData(data)
{
	if( data == null || data.trim() == "" )
		return false;
	else
		return true;
}

function chkPermittedThrough(objParamData)
{
	if( objParamData.permitted_through.toLowerCase().trim() == "rating" )
	{
		if (objParamData.rating_agency.trim() == "" || objParamData.rating_code.trim() == "" )
			return false;
		return true;
	}
	else
		return true;
}

function chkEffectiveDate(objParamData)
{
	if ( Date.parse(objParamData.effective_till) < Date.parse(objParamData.effective_from) )
		return false;
	else
		return true;
}

function chkAccExists(objParamData)
{
	var cnt_dataset = SQLResultset("select count(*) count from approval_master where approval_acc = '" + objParamData.approval_acc + "'")
	if ( parseFloat(cnt_dataset.fieldbyname("count")) > 0 )
		return false;
	else
		return true;
}

function chkCodeExists(objParamData)
{
	var cnt_dataset = SQLResultset("select count(*) count from approval_master where upper(trim(approval_acc)) = '" + objParamData.approval_acc.toUpperCase().trim() + "'")
	if ( parseFloat(cnt_dataset.fieldbyname("count")) > 0 )
		return false;
	else
		return true;
}

function chkDescExists(objParamData)
{
	var cnt_dataset = SQLResultset("select count(*) count from approval_master where upper(trim(approval_desc)) = '" + objParamData.approval_desc.toUpperCase().trim() + "'")
	if ( parseFloat(cnt_dataset.fieldbyname("count")) > 0 )
		return false;
	else
		return true;
}


function chkModActive(objParamData)
{
	var adataset = SQLResultset("Select subproduct from contractmaster where security_desc = '" + objParamData.approval_code + "' and nvl(Deletionstatus,'ND') = 'ND' and transaction_type_code = '16'")
	if ( adataset.recordcount <= 0 ) return true;
	if (getSysParameter("AllowCreditLineModification","").indexOf(adataset.subproduct) < 0 )
		if (objParamData.active.toUpperCase() == "T")
			return false;
	return true;
}

function chkDelActive(objParamData)
{
	if (objParamData.active.toUpperCase() == "T")
		return false;
	else
		return true;
}

function chkCLAmount(objParamData)
{
	var adataset = SQLResultset("Select subproduct from contractmaster where security_desc = '" + objParamData.approval_code + "' and nvl(Deletionstatus,'ND') = 'ND' and transaction_type_code = '16'")
	if ( adataset.recordcount <= 0 ) return true;
	if (getSysParameter("AllowCreditLineModification","").indexOf(adataset.subproduct) < 0 )
	{
		var adataset = SQLResultset("Select Amount_leg1 from contractmaster where security_desc = '" + objParamData.approval_code + "' and nvl(Deletionstatus,'ND') = 'ND' and transaction_type_code = '16'")
		if ( adataset.recordcount <= 0 ) return true;
		if ( parseFloat(adataset.amount_leg1) < objParamData.amount )
			return false;
	}
	return true;
}

function chkModEffDate(objParamData)
{
	var adataset = SQLResultset("Select matdate from contractmaster where security_desc = '" + objParamData.approval_code + "' and nvl(Deletionstatus,'ND') = 'ND' and transaction_type_code = '16'")
	if ( adataset.recordcount <= 0 ) return true;
	If ( Date.parse(adataset.matdate) <= objParamData.effective_till )
		return false;
}

function chkModEffDate(objParamData)
{
	var adataset = SQLResultset("Select matdate from contractmaster where security_desc = '" + objParamData.approval_code + "' and nvl(Deletionstatus,'ND') = 'ND' and transaction_type_code = '16'")
	if ( adataset.recordcount <= 0 ) return true;
	If ( Date.parse(adataset.matdate) <= objParamData.effective_till )
		return false;
}

function chkMakerChecker(objParamData)
{
	
}

function approval_master_auth_validate(paramobj)
{
	return approval_master_validate("auth",paramobj)
}

function approval_master_unauth_validate(paramobj)
{
	return approval_master_validate("unauth",paramobj)
}

function approval_master_validate(actionname,paramobj)
{
	var valmsg = "";
	// if actionname == "auth"
	if ( chkBlankData(paramobj) )
		valmsg = valmsg + "Kindly enter the Credit Line Code";
	if ( chkBlankData(paramobj) )
		valmsg = valmsg + "Kindly enter the Credit Line Description";
	if ( chkModActive(paramobj) )
		valmsg = valmsg + "Credit Line is Authorised, cannot Modify";
	if ( chkModEffDate(paramobj) )
		valmsg = valmsg + "Effective_Till date cannot be less than end date of sanction posted against this Credit Line, cannot Modify";
	if ( chkPermittedThrough(paramobj) )
		valmsg = valmsg + "RATING_AGENCY and RATING_CODE cannot be blank";
	if ( chkCLAmount(paramobj) )
		valmsg = valmsg + "Amount cannot be less than amount of Sanction posted against this Credit Line, cannot Modify";
	if (valmsg != "")
		return {"status":"unsuccess","error":"","msg": valmsg };
	else 
		return {"status":"success","error":"","msg":""};
}