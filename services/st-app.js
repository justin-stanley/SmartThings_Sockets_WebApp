/* #############################################
##                                            ##
##    SmartThings SmartApp 		              ##
##    Webhook and Socket Server               ##
##                                            ##
############################################# */

const SmartApp = require('@smartthings/smartapp');
const fs = require('fs');
const path = require('path');
const https = require('https');
const ws = require('ws');
const express = require('express');

const app = {
	init: () => {
		app.config = app.getConfigs();
		if(app.config){
			app.initSmartApp();
			app.initSocketServer();
		}else{
			console.log('Invalid Configuration File!');
		}
	},
	getConfigs: () => {
		let config = fs.readFileSync(path.join(__dirname, '../config.json'));
		if(!config){ return false; }
		try{ config = JSON.parse(config); }catch{ return false;	}
		return app.validConfigs(config) ? config.smartApp : false;
	},
	validConfigs: (config) => {
		if('smartApp' in config === false){ return false; }
		if('appId' in config.smartApp === false || 
			!config.smartApp.appId){ return false; }
		if('clientId' in config.smartApp === false || 
			!config.smartApp.clientId){ return false; }
		if('clientSecret' in config.smartApp === false || 
			!config.smartApp.clientSecret){ return false; }
		if('appPort' in config.smartApp === false || 
			isNaN(config.smartApp.appPort)){ return false; }
		if('socketPort' in config.smartApp === false || 
			isNaN(config.smartApp.appPort)){ return false; }
		if('ssl' in config.smartApp === false){ return false; }
		if('keyFile' in config.smartApp.ssl === false || 
			!fs.existsSync(config.smartApp.ssl.keyFile)){ return false; }
		if('certFile' in config.smartApp.ssl === false || 
			!fs.existsSync(config.smartApp.ssl.certFile)){ return false; }
		if('caFile' in config.smartApp.ssl === false || 
			!fs.existsSync(config.smartApp.ssl.caFile)){ return false; }
		return true;
	},
	initSmartApp: () => {
		app.smartApp = new SmartApp()
		    .enableEventLogging(2)
		    .appId(app.config.appId)
		    .clientId(app.config.clientId)
		    .clientSecret(app.config.clientSecret)
		    .page('mainPage', (context, page, configData) => {
		        page.section('sensors', section => {
		            section
		                .deviceSetting('contactSensor')
		                .capabilities(['contactSensor'])
		                .permissions('r')
		                .multiple(true);
		        });
		        page.section('lights', section => {
		            section
		                .deviceSetting('lights')
		                .capabilities(['switch'])
		                .permissions('r')
		                .multiple(true);
		        });
		        page.section('locks', section => {
		            section
		                .deviceSetting('lock')
		                .capabilities(['lock'])
		                .permissions('r')
		                .multiple(true);
		        });
		    })
		    .updated(app.handleSmartAppUpdate)
		    .subscribedEventHandler('eventHandler', app.handleSmartAppEvent);
		app.initSmartAppHook();
	},
	initSmartAppHook: () => {
		let key = fs.readFileSync(app.config.ssl.keyFile),
			cert = fs.readFileSync(app.config.ssl.certFile),
			ca = fs.readFileSync(app.config.ssl.caFile),
			port = app.config.appPort;
		express()
			.use(express.json())
			.post('/', function (req, res, next) {
			    app.smartApp.handleHttpCallback(req, res);
			});
		https
			.createServer({ key: key, cert: cert, ca: ca }, express)
			.listen(port, () => { console.log(`SmartApp is up on ${port}`); });
	},
	initSocketServer: () => {
		app.wsServer = new ws.Server({ port:app.config.socketPort, perMessageDeflate: false });
		app.wsServer.broadcast = app.handleEventBroadCast;
		console.log(`Socket server is up on ${app.config.socketPort}`);
	},
	handleSmartAppUpdate: async (context, updateData) => {
		const sub = context.api.subscriptions;
		await sub.unsubscribeAll()
        await sub.subscribeToDevices(context.config.lights, 'switch', 'switch', 'eventHandler');
        await sub.subscribeToDevices(context.config.contactSensor, 'contactSensor', 'contact', 'eventHandler');
        await sub.subscribeToDevices(context.config.lock, 'lock', 'lock', 'eventHandler');
	},
	handleSmartAppEvent: (context, event) => {
	    app.wsServer.broadcast({
	    	'deviceId' : event.deviceId,
	    	'label' : event.label,
	    	'value' : event.value,
	    	'time' : new Date().toISOString() 
	    });
	},
	handleEventBroadCast: (data) => {
		app.wsServer.clients.forEach(function each(client) {
		    if (client.readyState === ws.OPEN) {
		      client.send(data);
		    }
	  	});
	}
}

app.init();