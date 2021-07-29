//Remove below line and add the values for each key directly 
//if you do not want store them in credentials.js
const {appId, developerId, appKey} = CREDENTIALS;

let appInfo = {
    appId,
    developerId,
    appKey
};

const onCaptureEvent = (e, handle) => {
    console.log('notification')
}

//to ensure the cdn is loaded before you try to use prefix
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

const updateStatus = (val, err) =>{
    var color = err ? 'red' : 'green'
    var innerText = err ? `${val} ${err}` : val
    document.getElementById('status').innerText = innerText
    document.getElementById('status').style.color = color
}

const updatelist = () => {

}