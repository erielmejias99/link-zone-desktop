export default class LinkZone {
  proxyURL = "/api";
  NETWORKS_TYPES = ['NO_SERVICE', '2G', '2G', '3G', '3G', '3G', '3G+', '3G+', '4G', '4G+']
  
  constructor() { }

  sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  linkZoneRequest(payload) {

    return fetch(this.proxyURL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        return data
      })
      .catch(err => {
        return err
      })
  }

  getSystemStatus () {

    const data = {
      jsonrpc: "2.0",
      method: "GetSystemStatus",
      id: "13.4"
    }

    return this.linkZoneRequest(data).then(res => {
      const result = {
        "Connected": res?.result?.ConnectionStatus == 2,
        "NetworkName": res?.result?.NetworkName,
        "NetworkType": this.NETWORKS_TYPES[res?.result?.NetworkType],
        "SignalStrength": res?.result?.SignalStrength,
        "TotalConnNum": res?.result?.TotalConnNum,
        "BatCap": res?.result?.bat_cap,
        "ChargeState": res?.result?.chg_state,
      }
      console.log('getSystemStatus', result)
      return result
    })
  }

  getNetworkSettings () {

    const data = {
      jsonrpc: "2.0",
      method: "GetNetworkSettings",
      id: "4.6"
    }

    return this.linkZoneRequest(data).then(res => {
      let result = {
        "NetworkMode": res?.result?.NetworkMode,
        "NetSelectionMode": res?.result?.NetselectionMode
      }

      result.NetworkMode = (result.NetworkMode == 255) ? 0 : res.result.NetworkMode

      console.log('getNetworkSettings', result)
      return result
    })
  }

  setNetworkSettings(networkMode) {

    const data = {
      jsonrpc:"2.0",
      method:"SetNetworkSettings",
      params: {
        NetworkMode: +networkMode,
        NetselectionMode: 0
      },
      id:"4.7"
    }

    return this.linkZoneRequest(data).then(res => {
      console.log('setNetworkSettings', JSON.stringify(res))
    })
  }

  connect(){

    const data = {
      jsonrpc:"2.0",
      method:"Connect",
      id:"3.2"
    }

    return this.linkZoneRequest(data).then(res => {
      // if(res.error)
      //   return newError(res.error.message, "500")
      
      return this.sleep(5000).then(r => {
        console.log('finish connect', res)
        return res
      })

    }, err => {
      console.log('error connect', err)
    });
  }

  disconnect(){

    const data = {
      jsonrpc:"2.0",
      method:"DisConnect",
      id:"3.2"
    }

    return this.linkZoneRequest(data).then(res => {
      return this.sleep(5000).then(r => {
        console.log('finish disconnect', res)
        return res
      })
    })
  }

  getConnectionState(){

    const data = {
      jsonrpc:"2.0",
      method:"GetConnectionState",
      id:"3.1"
    }
    return this.linkZoneRequest(data).then(res => {
      const state = {
        ConnectionStatus: res?.result.ConnectionStatus
      }
      console.log('getConnectionState', state)
      return state
    });
  }

  sendUSSD(code){
    const data = {
      jsonrpc: "2.0",
      method: "SendUSSD",
      params: {
        UssdContent: code,
        UssdType: 1
      },
      id: "8.1"
    }
    return this.linkZoneRequest(data).then(res => {
      console.log('sendUSSD', res)
      return res;
    });
  }

  async setNetwork(networkMode) {
    
    return this.getConnectionState().then(res => {
      if(res.ConnectionStatus == 2){ // si esta conectado
        return this.disconnect().then(res => {
          this.setNetworkSettings(networkMode).then(res => {
              this.connect().then(res => {
                console.log('finish setNetwork')
              })
          })
        });
      }
      return this.setNetworkSettings(networkMode).then(res => {
        console.log('finish setNetwork')
      });
    })
  }
  
  async getUSSDSendResult() {

    const data = {
      jsonrpc: "2.0",
      method: "GetUSSDSendResult",
      id: "8.2"
    }
    return this.linkZoneRequest(data).then(res => {
      return res.result.UssdContent
    })
    // if (!res.ok)
    //   return null

    // if (res.result['SendState'] === 1)
    //   return await this.getUSSDSendResult()

    // if (res.result['SendState'] === 2)
    //   return res.result['UssdContent']

    // return null
  }

  sendUssdCode(code) {
    
    console.log(code)

    return this.sendUSSD(code).then(res => {
      return this.getUSSDSendResult().then(res => {
        console.log('sendUssdCode', res)
        return res
      })
    })
    
  }
}