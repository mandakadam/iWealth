var authcolnames =
{
	"approval_master" : 
	{
		"auth_status" : {"column_name" : "active","column_value" : {"auth" : "T","unauth" : "F"} },
		"auth_by" : {"column_name" : "approval_authby"},
		"auth_on" : {"column_name" : "approval_authdate"}
	}
	,"holding_pattern" : 
	{
		"auth_status" : {"column_name" : "authstatus","column_value" : {"auth" : "T","unauth" : "F"} },
		"auth_by" : {"column_name" : "authstatusby"},
		"auth_on" : {"column_name" : "authstatuson"}
	}
}