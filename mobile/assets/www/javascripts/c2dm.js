////
// C2DM Features
////
//alert( localStorage.site );
gApp = new Array();

gApp.deviceready = false;
gApp.c2dmregid = '';

window.onbeforeunload  =  function(e) {

		if ( gApp.c2dmregid.length > 0 )
		{
			// The same routines are called for success/fail on the unregister. You can make them unique if you like
			window.plugins.C2DM.unregister( C2DM_Success, C2DM_Fail );			// close the C2DM 

		}
};


	$("#app-status-ul").append( '<li>Mobileinit event received' );



//});

function 
C2DM_Event(e)
{
	var li = '';
	li = '<li>EVENT -> RECEIVED:' + e.event;
	$("#app-status-ul").append( li )

	switch( e.event )
	{
	case 'registered':
		// the definition of the e variable is json return defined in C2DMReceiver.java
		// In my case on registered I have EVENT and REGID defined
		gApp.c2dmregid = e.regid;
		if ( gApp.c2dmregid.length > 0 )
		{

			// ==============================================================================
			// ==============================================================================
			// ==============================================================================
			//
			// This is where you would code to send the REGID to your server for this device (e.regid)
			//
			// ==============================================================================
			// ==============================================================================
			// ==============================================================================

		}

		break

	case 'message':
		// the definition of the e variable is json return defined in C2DMReceiver.java
		// In my case on registered I have EVENT, MSG and MSGCNT defined

		// You will NOT receive any messages unless you build a HOST server application to send 
		// Messages to you, This is just here to show you how it might work
		
		//TODO: deal with messages!!

		break;


	case 'error':

		li = '<li>ERROR -> MSG:' + e.msg;
		$("#app-status-ul").append( li )
		break;



	default:
		li = '<li>EVENT -> Unknown, an event was received and we do not know what it is';
		$("#app-status-ul").append( li )
		break;
	}
}

function 
C2DM_Success(e)
{
	li = '<li>C2DM_Success -> We have successfully registered and called the C2DM plugin, waiting for C2DM_Event:reistered -> REGID back from Google';
	$("#app-status-ul").append( li )
}

function 
C2DM_Fail(e)
{
	li = '<li>C2DM_Fail -> C2DM plugin failed to register';
	$("#app-status-ul").append( li )
	li = '<li>C2DM_Fail -> ' + e.msg;
	$("#app-status-ul").append( li )
}


	
