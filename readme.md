# SmartThings SmartApp with WebSockets and Companion WebApp

This repo contains a SmartThings SmartApp which allows you to listen to events from switches, locks and contact sensors on your SmartThings network then emit events over WebSockets. 

It includes an example companion webapp which connects to the websocket server and displays event status updates as they are recieved. **This SmartApp is designed to be run on your local network.** The websocket server which broadcast events is open for any device to connect to.

The companion webapp is basic in nature and meant to be customized to your to suite your preferences.


## Getting Started 

1. Install [NodeJS and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

2. Register a SmartApp in the [SmartThings Developer Workspace](https://smartthings.developer.samsung.com/workspace). 
	- Choose Automation for SmartApp  option.
	- Choose Webhook option under Hosting.
	- Configure the Webhook to point at your local machine. See next section for more details. 

3. Clone this repository. 

4. Run `npm install` to setup dependencies.

5. Open `config.json` and input the App ID, Client ID and Client Secret for your SmartApp. 

6. Add the details for your SSL certificate and key. 

7. Modify any other defaults as needed.

8. Run `npm run deploy` to build and deploy. 

9. Deploy the SmartApp to test in the SmartThings Developer Workspace.

10. Open the SmartThings app then find and configure your SmartApp. It should appear under the automations tab. Choose the devices which you'd like to recieve events for. 

11. You're done! 


## Connecting the ST Platform to Local Network 

SmartThings SmartApps are typically run within the cloud on a service like Lambda. You'll need to do some work to allow the ST Platform to communicate with the server on your local network.  [Google Domains](https://domains.google/) is a good one stop shop for all the things you need or you can use other services. 

1. You need a domain name that you can use for your local network. 

2. You need an SSL certificate for the domain name. This is required by the ST Platform. 

3. You need a Dynamic DNS service to keep your domain name pointing at your network. 

4. You need to configure port forwarding on your router to direct outside traffic to your local server. 

If you run into issues double check that DDNS is working properly and that your domain is resolving to your current IP then double check your port forwarding rule. I recommend using the same port on both ends for simplicity sake.


## Config.json File

| Property            | Description |
| ------------------- | ----------- |
| smartApp.appId      	  | The SmartThings App Id from Developer Workspace      	  	     |
| smartApp.clientId   	  | The SmartThings Client Id from Developer Workspace           	 |
| smartApp.clientSecret   | The SmartThings Client Secret from Developer Workspace     	     |
| smartApp.appPort 		  | Port listening for calls from SmartThings Platform   		     |
| smartApp.socketPort	  | Port for the socket server used by WebApp to receive events      |
|						  |																     |
| smartApp.ssl.keyFile	  | Path to your private key file for your certificate\*      	     |
| smartApp.ssl.certFile	  | Path to your certificate file for the your certificate\*         |
| smartApp.ssl.caFile	  | Path to your root certificate from your certificate authority\*  |
|						  |																     |
| webApp.port		 	  | Port for the webserver hosting the frontend webapp			     |
| webApp.location	 	  | The title you wish to display on the frontend webapp 		     |
| webApp.timeFormat	 	  | The timestamp display format in the frontend webapp\*\* 	     |
| webApp.eventLimit	 	  | How many events should show before the oldest gets removed 	     |
| webApp.deviceLabels 	  | Override how devices are named in the event log\*\*\* 		     |

\* If you use a relative path it needs to be relative to the directory where you execute the script. This is most likely the root folder where you cloned the repository.

\*\* Use format options from [MomentJS](https://momentjs.com/docs/#/displaying/). Default is "ago" which uses the "time from" option and displays like "a few secounds ago", "5 minutes ago", "1 hour ago", etc. 

\*\*\* This is useful if you want a different label to show than what's set on the device in SmartThings. For example if you use a contact sensor on your mailbox you could override and to have it say "Mailbox opened." Use the device ID from SmartThings. The verbs used by the app are "on/off" for lights and "was {value}" for other types of devices. Setting verb to false will exclude it. For example if you want to show "Doorbell pressed." instead of "Doorbell was open." if the doorbell sensor is a contact sensor.


## Miscellaneous

This application is not intended for commerical use. It was created as a personal project. Use the code contained in this repository at your own risk and liability. I have no affilation with Smart Things or Samsung. As the Smart Things developer account holder you assume liability for any code/applications connected/deployed to the SmartThings platform via your developer account.

You should only run this code on your local network. The application can be run in a cloud hosted enviroment but does not contain functionality to ensure it remains secure in a hosted enviroment.

I recommend using [PM2](https://pm2.keymetrics.io/) to manage and monitor these services. When using PM2 start each script separately like `pm2 start services/st-app.js` and `pm2 start services/web-app.js`. 

