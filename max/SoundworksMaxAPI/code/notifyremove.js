function notifydeleted(){
	post('StateManager has been cleared');post();
	messnamed('statemanagerkilled', 'bang');
	outlet("statemanagerkilled");
	
}