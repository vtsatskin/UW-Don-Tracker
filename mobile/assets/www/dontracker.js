$(function(){
	////////////////////////////////////////////////////////////////////////
	//																	  //
	//						Main Screen Functions:						  //
	//																	  //
	////////////////////////////////////////////////////////////////////////
	$('#refresh_btn').click = refreshlist();
	
	
	////////////////////////////////////////////////////////////////////////
	//																	  //
	//						User's Location Functions:					  //
	//																	  //
	////////////////////////////////////////////////////////////////////////
	//Set the user's location on the main screen
	updateuserloc();
	//Change contextual menu based on what the user has selected
	$('#residence').change(function(){
		$("#buildingselectorv1").css('display', 'none');
		$('#floorselectormkv, #floorselectorrev, #floorselectorv1').css('display', 'none');
		if($('#residence').val() == "V1")
			{
				$("#buildingselectorv1").css('display', 'block');
				$("#floorselectorv1").css('display', 'block');
			}
		else if($('#residence').val() == "MKV")
			{
				$("#floorselectormkv").css('display', 'block');
			}
		else if($('#residence').val() == "REV")
		{
			$("#floorselectorrev").css('display', 'block');
		}
			
	});
	
	//Add the "Save" button when a user finishes entering data
	$('#floorselectormkv, #floorselectorrev, #floorselectorv1').change(function(){
		$('#savediv').css('display', 'block');
	});
	
	//Save data, update mainscreen, return to mainscreen
	$('#save').click(function(){
		/*$.post('10.0.0.7/sighting', { quad: , floor: , build: , residence: ,});*/
		window.localStorage.setItem("currentres", $('#residence').val());
		window.localStorage.setItem("currentarea", $('#area').val());
		if($('#residence').val() == "V1")
		{
			window.localStorage.setItem("currentbuilding", $('#buildingv1').val());
			window.localStorage.setItem("currentfloor", $('#floorv1').val());
		}
		else if($('#residence').val() == "MKV")
		{
			window.localStorage.setItem("currentbuilding", null);
			window.localStorage.setItem("currentfloor", $('#floormkv').val());
		}
		else if($('#residence').val() == "REV")
		{
			window.localStorage.setItem("currentbuilding", null);
			window.localStorage.setItem("currentfloor", $('#floorrev').val());
		}
		updateuserloc();
		window.location = "#main";
	});
	
	////////////////////////////////////////////////////////////////////////
	//																	  //
	//						Add Sighting Functions:						  //
	//																	  //
	////////////////////////////////////////////////////////////////////////
	//Change menu based on residence of sighting
	$('#residence_s').change(function(){
		$("#buildingselectorv1_s").css('display', 'none');
		$('#floorselectormkv_s, #floorselectorrev_s, #floorselectorv1_s').css('display', 'none');
		if($('#residence_s').val() == "V1")
			{
				$("#buildingselectorv1_s").css('display', 'block');
				$("#floorselectorv1_s").css('display', 'block');
			}
		else if($('#residence_s').val() == "MKV")
			{
				$("#floorselectormkv_s").css('display', 'block');
			}
		else if($('#residence_s').val() == "REV")
		{
			$("#floorselectorrev_s").css('display', 'block');
		}
			
	});
	$('#dangerlevel').change(function(){
		$('#submitdiv').css('display', 'block');
	});
	$('#submit').click(function(){
		//TODO implement db functionality
	});
});



////////////////////////////////////////////////////////////////////////
//																	  //
//							Helper Functions:						  //
//																	  //
////////////////////////////////////////////////////////////////////////
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