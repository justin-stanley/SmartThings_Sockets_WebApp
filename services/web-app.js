/* #############################################
##                                            ##
##    Webapp Server for	 		              ##
##    Static Frontend App                     ##
##                                            ##
############################################# */

const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

const app = {
	init: () => {
		app.config = app.getConfigs();
		if(app.config){
			let wsPort = app.config.smartApp.socketPort;
			app.config = app.config.webApp;
			app.config.wsPort = wsPort;
			app.initWebServer();
		}else{
			console.log('Invalid Configuration File!');
		}
	},
	getConfigs: () => {
		let config = fs.readFileSync(path.join(__dirname, '../config.json'));
		if(!config){ return false; }
		try{ config = JSON.parse(config); }catch{ return false;	}
		return app.validConfigs(config) ? config : false;
	},
	validConfigs: (config) => {
		if('webApp' in config === false){ return false; }
		if('locationName' in config.webApp === false || 
			!config.webApp.locationName){ return false; }
		if('timeFormat' in config.webApp === false || 
			!config.webApp.timeFormat){ return false; }
		if('port' in config.webApp === false || 
			isNaN(config.webApp.port)){ return false; }
		return true;
	},
	initWebServer: () => {
		express()
			.use(express.static(path.join(__dirname, '../web-app')))
			.get('/config.json', app.serveConfig)
			.listen(app.config.port, () => console.log(`WebApp is up on ${app.config.port}`));
	},
	serveConfig: (req, res) => {
		res.setHeader('content-type', 'application/json');
		res.send(JSON.stringify({
			'locationName' : app.config.locationName,
			'timeFormat' : app.config.timeFormat,
			'wsPort' : app.config.wsPort,
			'eventLimit' : app.config.eventLimit,
			'deviceLabels' : app.config.deviceLabels
		}));
	}
}

app.init();