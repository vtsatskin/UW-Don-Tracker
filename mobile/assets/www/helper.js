////////////////////////////////////////////////////////////////////////
//																	  //
//							Helper Functions:						  //
//																	  //
////////////////////////////////////////////////////////////////////////
var serveraddress = "http://10.0.0.78:4567"; //CHANGE
function updateuserloc()
{
	var userloc = "Unknown";
	if(window.localStorage.getItem("currentres") == "V1")
		{
			userloc = "V1 " + window.localStorage.getItem("currentarea") + 
				window.localStorage.getItem("currentbuilding") + " Floor " + window.localStorage.getItem("currentfloor");
		}
	else if (window.localStorage.getItem("currentres") != null)
		{
			userloc = window.localStorage.getItem("currentres");
			switch (window.localStorage.getItem("currentarea"))
			{
			case "N":
				userloc += " North Floor ";
				break;
			case "S":
				userloc += " South Floor ";
				break;
			case "W":
				userloc += " West Floor ";
				break;
			case "E":
				userloc += " East Floor ";
				break;
			default:
				userloc = " Error ";
				break;
			}
			userloc += window.localStorage.getItem("currentfloor");
		}
	$('#currentloc').html(userloc);
}

function refreshlist()
{
	
}