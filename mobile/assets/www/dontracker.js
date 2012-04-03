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
		/*$.post('10.0.0.7/sighting', { quad: , floor: , build: , residence: ,});*/
		var residence = $('#residence_s').val();
		var building = null;
		var floor = null;
		if (residence == "V1")
			{
				building = $('#buildingv1_s').val();
				floor = $('#floorv1_s').val();
			}
		else if (residence == "MKV")			
				floor = $('#floormkv_s').val();
		else if (residence == "REV")
			{
				floor $('#floorrev_s').val();
			}
			
		debugger;
		$.post(serveraddress + "/sighting", {residence: "V1", area: "S"/*$('#area_s').val()*/ , building: "4", floor: 5,}, 'json')
		.success(function(){
			alert("worked bro");					
		})
		.error(function(err){
			alert(err);
		});
	});
});



