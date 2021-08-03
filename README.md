# SingleEntryJS

SingleEntryJS is a very simple HTML and JS boilerplate app using the Socket Mobile JavaScript Capture Module.

It shows how to use the Socket Mobile CaptureJS SDK to receive the decoded data from the Socket Mobile devices into an input box.

The connection state of the Socket Mobile device is shown in a status field at the top of the app.

## Requirements
1. You will need your Socket Mobile developer ID as well as an app ID. Your developer ID can be found under your developer profile when you log into the [Socket Mobile Developer Portal](https://www.socketmobile.com/developers/portal). Then you need to [create your appKey](https://www.socketmobile.com/developers/portal/application-details/appkey-registration). For platform, select Web. For Language/Capture Client, select JavaScript. Your bundleId needs to be in the format of `socketmobile.com.yourappname`.
2. The scanner needs to be paired with your devices in Application Mode. This can be done using the Socket Mobile Companion app (recommended), which can be downloaded from the [App Store](https://apps.apple.com/us/app/socket-mobile-companion/id1175638950). To pair your scanner in Application Mode without using Companion app, follow the instructions at: ConfigureInAppMode.

## Install

You shouldn't need to install anything in order to use this boilerplate. However, if you want to temporarily host your app securely, you can install `ngrok` and follow the directions from this blog post (link to my blog post about using SimpleHTTPServer and ngrok).

## Usage
To run web app on your laptop, connect an android device to your laptop so you can use `adb`. More in a moment. Then, use the Socket Mobile Companion app to connect your scanner to your attached device. Once you have successfully connected your scanner to your device, configure your credentials for your app (see below) and then in your terminal, in the project root run `adb forward tcp:18481 tcp:18481`. 

The boilerplate HTML references the file `credentials.js`. The `.gitignore` file ignores this file as it is meant to act as an environment variable file, protecting your credentials from being exposed in a public GitHub repository. In this file is where you are to include your developerId, appKey and appId. See an example `credentials.js` file below.

```
const CREDENTIALS = {
    appId: "web:socketmobile.com.yourappname",
    developerId: 'your-d3v-id',
    appKey: 'alphanum3r1cappk3y'
}
```

Then you can access those variables in your `index.js` like so...
```
const {appId, developerId, appKey} = CREDENTIALS;

let appInfo = {
    appId,
    developerId,
    appKey
};
```

NOTE: This usage is optional and you can remove references to `credentials.js` and `CREDENTIALS` and use your credentials directly in your `index.js` file like so...

```
let appInfo = {
    appId: "web:socketmobile.com.yourappname",
    developerId: "your-d3v-id",
    appKey: 'ALPHAnum3r1cAPPk3y'
};
```

The capture initialization takes place in an `DOMContentLoaded` event listener to ensure the cdn is loaded before you try to use the SocketMobile prefix.

```
window.addEventListener('DOMContentLoaded', ()=>{

    var capture = new SocketMobile.Capture();

    capture.open(appInfo, onCaptureEvent)
        .then(result => {
            console.log('opening Capture result: ', result);
            updateStatus(`opening Capture result: ${result}`)
        })
        .catch(err => {
            var val;
            // error code to watch for to check if the Companion service is running
            if(err === SocketMobile.SktErrors.ESKT_UNABLEOPENDEVICE){
                val='not able to connect to the service, is it running?'
                console.log('no able to connect to the service, is it running?');
            }
            else {
                val = `opening Capture error: ${err}`;
            }
            console.log(val)
            updateStatus(val, err)
        });
})
```

Finally, `onCaptureEvent` is used to handle the data that comes back from a successfully opened capture instance.

```
const onCaptureEvent = (e, handle) => {
    console.log('notification')
}
```
NOTE: The second argument of the `onCaptureEvent` callback is a handle to identify the source of the Capture event.