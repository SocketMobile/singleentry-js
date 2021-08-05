//Remove below line and add the values for each key directly 
//if you do not want store them in credentials.js
const {appId, developerId, appKey} = CREDENTIALS;
let capture, devices;
let decodedData = [];
let deviceMap = {}
let dataId = 10;

let appInfo = {
    appId,
    developerId,
    appKey
};

const onCaptureEvent = (e, handle) => {
    const {CaptureEventIds, Capture} = SocketMobile
    if (!e) {
        return;
    }
    switch (e.id) {
        // **********************************
        // Device Arrival Event
        //   a device needs to be opened in
        //   to receive the decoded data
        //  e = {
        //    id: CaptureEventIds.DeviceArrival,
        //    type: CaptureEventTypes.DeviceInfo,
        //    value: {
        //      guid: "b876d9a8-85b6-1bb5-f1f6-1bb5d78a2c6e",
        //      name: "Socket S740 [E2ABB4]",
        //      type: CaptureDeviceType.ScannerS740
        //    }
        //  }
        // **********************************
        case CaptureEventIds.DeviceArrival:
            const newDevice = new Capture();
            const {guid, name} = e.value;
            newDevice
                .openDevice(guid, capture)
                .then(result => {
                    updateStatus(`result of opening ${name} : ${result}`);
                    devices = devices || []
                    if (!deviceMap[name]){
                        devices.push({
                            guid,
                            name,
                            handle: newDevice.clientOrDeviceHandle,
                            device: newDevice,
                        });
                        deviceMap[name] = true
                    }
                    updateDevices()
                })
                .catch(err => {
                    updateStatus(`error opening a device: ${err}`);
                });
            break;
        // **********************************
        // Device Removal Event
        //   it is better to close the device
        //  e = {
        //    id: CaptureEventIds.DeviceRemoval,
        //    type: CaptureEventTypes.DeviceInfo,
        //    value: {
        //      guid: "b876d9a8-85b6-1bb5-f1f6-1bb5d78a2c6e",
        //      name: "Socket S740 [E2ABB4]",
        //      type: CaptureDeviceType.ScannerS740
        //    }
        //  }
        // **********************************
        case CaptureEventIds.DeviceRemoval:
            const removeDevice = devices.find(d => d.guid === e.value.guid);
            if (!removeDevice) {
                updateStatus(`no matching devices found for ${e.value.name}`)
                return;
            }
            removeDevice.device
                .close()
                .then(result => {
                    updateStatus(`result of closing ${removeDevice.name}: ${result}`);
                    devices = devices.filter(x=>x.guid !== removeDevice.guid)
                    updateDevices()
                })
                .catch(err => {
                    updateStatus(`error closing a device: ${err}`, err);
                });
          break;
        // **********************************
        // Decoded Data
        //   receive the decoded data from
        //   a specific device
        //  e = {
        //    id: CaptureEventIds.DecodedData,
        //    type: CaptureEventTypes.DecodedData,
        //    value: {
        //      data: [55, 97, 100, 57, 53, 100, 97, 98, 48, 102, 102, 99, 52, 53, 57, 48, 97, 52, 57, 54, 49, 97, 51, 49, 57, 50, 99, 49, 102, 51, 53, 55],
        //      id: CaptureDataSourceID.SymbologyQRCode,
        //      name: "QR Code"
        //    }
        //  }
        // **********************************
        case CaptureEventIds.DecodedData:
            const deviceSource = devices.find(d => d.handle === handle);
            
            if (!deviceSource) {
                updateStatus(`no matching devices found for ${e.value.name}`)
            }
            decodedData.push({id: dataId, name: e.value.name, data: String.fromCharCode.apply(null, e.value.data)})      
            updateData()
          break;
      }
}

//to ensure the cdn is loaded before you try to use prefix
window.addEventListener('DOMContentLoaded', ()=>{

    capture = new SocketMobile.Capture();

    capture.open(appInfo, onCaptureEvent)
        .then(result => {
            console.log('opening Capture result: ', result);
            updateStatus(`opening Capture result: ${result}`)
        })
        .catch(err => {
            var finalErr = err.error || err
            var val;
            // error code to watch for to check if the Companion service is running
            if(finalErr === SocketMobile.SktErrors.ESKT_UNABLEOPENDEVICE){
                val='not able to connect to the service, is it running?' + ` ${finalErr}`
                console.log('no able to connect to the service, is it running?');
            }
            else {
                val = `opening Capture error: ${finalErr}`;
            }
            console.log(val)
            updateStatus(val, finalErr)
        });
})

const updateStatus = (val, err) =>{
    var color = err ? 'red' : 'green'
    document.getElementById('status').innerText = val
    document.getElementById('status').style.color = color
}

const updateDevices = () =>{
   var table = document.getElementById('devices')
   table.children[0].innerHTML = `<tr>
        <th>Name</th>
        <th>GUID</th>
    </tr>`
   for (var i = 0; i < devices.length; ++i){
       var row = table.insertRow(i+1);
       var cell1 = row.insertCell(0);
       var cell2 = row.insertCell(1);
       cell1.innerText = devices[i].name
       cell2.innerText = devices[i].guid
   }
   if (devices.length > 0){
       document.getElementById("device-warning").style.visibility = 'hidden'
   } else {
       document.getElementById("device-warning").style.visibility = 'visible'
   }
}

const onClear = () => {
    dataId = 10
    decodedData = []
    document.getElementById('data-list').innerHTML = ""
    document.getElementById('decoded-data').value = ""
}

const updateData = () => {
    dataId++
    var list = document.getElementById('data-list')
    list.innerHTML = ""
    for (var i = 0; i < decodedData.length; ++i){
        var l = document.createElement("LI")
        l.innerText = `${decodedData[i].name.toUpperCase()} (${decodedData[i].data.length}): ${decodedData[i].data}`
        list.appendChild(l)
        if (i === decodedData.length - 1){
            //assign scanned value to input
            document.getElementById('decoded-data').value = l.innerText
        }
    }
}
