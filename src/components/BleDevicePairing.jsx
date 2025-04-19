import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/useAuth";

export default function BleDevicePairing() {
  const { currentUser } = useAuth();
  const [bleState, setBleState] = useState("Disconnected");
  const [bleStateClass, setBleStateClass] = useState("text-red-600");
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [timestamp, setTimestamp] = useState("");
  
  // Use refs to persist BLE objects between renders
  const bleServerRef = useRef(null);
  const bleServiceRef = useRef(null);

  // Define BLE Device Specs
  const deviceName = 'Smart Flashcard ESP32';
  const serviceUUID = '19b10000-e8f2-537e-4f6c-d104768a1214';
  const ssidCharacteristicUUID = '041675c7-d7e3-4b75-90f9-0c690823f847';
  const passwordCharacteristicUUID = '7589f9d3-eb44-423b-ba32-664e40da9ac2';
  const tokenCharacteristicUUID = 'e6d7c837-879f-4139-8834-ceb5f7e3bafe';

  // Check if BLE is available in Browser
  const isWebBluetoothEnabled = () => {
    if (!navigator.bluetooth) {
      console.log("Web Bluetooth API is not available in this browser!");
      setBleState("Web Bluetooth API is not available in this browser!");
      setBleStateClass("text-red-600");
      return false;
    }
    console.log('Web Bluetooth API supported in this browser.');
    return true;
  };

  // Connect to BLE Device
  const connectToDevice = () => {
    if (!isWebBluetoothEnabled()) return;
    
    console.log('Initializing Bluetooth...');
    showStatus('Connecting to device...', 'info');
    
    navigator.bluetooth.requestDevice({
      filters: [{name: deviceName}],
      optionalServices: [serviceUUID]
    })
    .then(device => {
      console.log('Device Selected:', device.name);
      setBleState('Connected to ' + device.name);
      setBleStateClass("text-green-600");
      device.addEventListener('gattservicedisconnected', onDisconnected);
      return device.gatt.connect();
    })
    .then(gattServer => {
      bleServerRef.current = gattServer;
      console.log("Connected to GATT Server");
      return bleServerRef.current.getPrimaryService(serviceUUID);
    })
    .then(service => {
      bleServiceRef.current = service;
      console.log("Service discovered:", service.uuid);
      
      setIsConnected(true);
      showStatus('Connected. Ready to configure.', 'success');
    })
    .catch(error => {
      console.log('Error: ', error);
      showStatus(`Connection error: ${error.message}`, 'error');
      setBleState("Connection failed");
      setBleStateClass("text-red-600");
    });
  };

  const onDisconnected = (event) => {
    console.log('Device Disconnected:', event.target.device.name);
    setBleState("Disconnected");
    setBleStateClass("text-red-600");
    setIsConnected(false);
    showStatus('Device disconnected', 'warning');
    bleServerRef.current = null;
    bleServiceRef.current = null;
  };

  const writeConfigToDevice = async (e) => {
    e.preventDefault();
    
    if (!bleServerRef.current || !bleServerRef.current.connected) {
      showStatus('Error: Bluetooth is not connected. Please connect first.', 'error');
      return;
    }
    
    try {
      // Write SSID
      await writeCharacteristic(ssidCharacteristicUUID, ssid);
      console.log("SSID written successfully");
      
      // Write Password
      await writeCharacteristic(passwordCharacteristicUUID, password);
      console.log("Password written successfully");
      
      // Write Token (user ID)
      await writeCharacteristic(tokenCharacteristicUUID, currentUser.uid);
      console.log("Token written successfully");
      
      showStatus('Configuration saved successfully!', 'success');
    } catch (error) {
      showStatus(`Error saving configuration: ${error.message}`, 'error');
      console.error('Error saving configuration:', error);
    }
  };

  const writeCharacteristic = async (characteristicUUID, value) => {
    const characteristic = await bleServiceRef.current.getCharacteristic(characteristicUUID);
    console.log(`Found characteristic: ${characteristicUUID}`);
    
    // Convert string to bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    
    // Write the value
    await characteristic.writeValue(data);
    console.log(`Value written to characteristic ${characteristicUUID}`);
  };

  const disconnectDevice = () => {
    console.log("Disconnect Device.");
    if (bleServerRef.current && bleServerRef.current.connected) {
      bleServerRef.current.disconnect()
        .then(() => {
          console.log("Device Disconnected");
          setBleState("Disconnected");
          setBleStateClass("text-red-600");
          setIsConnected(false);
          showStatus('Device disconnected', 'info');
          bleServerRef.current = null;
          bleServiceRef.current = null;
        })
        .catch(error => {
          console.log("An error occurred:", error);
          showStatus(`Disconnection error: ${error.message}`, 'error');
        });
    } else {
      console.error("Bluetooth is not connected.");
      showStatus("Bluetooth is not connected", 'warning');
    }
  };

  const showStatus = (message, type = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    setTimestamp(getDateTime());
  };

  const getDateTime = () => {
    const currentdate = new Date();
    const day = ("00" + currentdate.getDate()).slice(-2);
    const month = ("00" + (currentdate.getMonth() + 1)).slice(-2);
    const year = currentdate.getFullYear();
    const hours = ("00" + currentdate.getHours()).slice(-2);
    const minutes = ("00" + currentdate.getMinutes()).slice(-2);
    const seconds = ("00" + currentdate.getSeconds()).slice(-2);

    return `${day}/${month}/${year} at ${hours}:${minutes}:${seconds}`;
  };

  // Style mapping for status messages
  const statusStyles = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-center mb-6">ESP32 BLE Configuration</h1>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="mb-2">BLE state: <strong><span className={bleStateClass}>{bleState}</span></strong></p>
        <div className="flex space-x-2">
          <button 
            onClick={connectToDevice}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
          >
            Connect
          </button>
          <button 
            onClick={disconnectDevice}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition"
          >
            Disconnect
          </button>
        </div>
      </div>
      
      {/* Configuration Form */}
      {isConnected && (
        <div>
          <h2 className="text-xl font-semibold mb-4">WiFi Configuration</h2>
          <form onSubmit={writeConfigToDevice} className="space-y-4">
            <div>
              <label htmlFor="ssid" className="block text-sm font-medium text-gray-700 mb-1">WiFi SSID</label>
              <input 
                type="text" 
                id="ssid" 
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                required 
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">WiFi Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                required 
              />
            </div>
            
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
              <input 
                type="password" 
                id="token" 
                value={currentUser.uid}
                className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm cursor-not-allowed" 
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Token được tự động sử dụng từ ID tài khoản của bạn</p>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}
      
      {/* Status Messages */}
      {statusMessage && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p>Status: <span className={statusStyles[statusType]}>{statusMessage}</span></p>
          <p className="text-xs text-gray-500 mt-2">Last updated: <span>{timestamp}</span></p>
        </div>
      )}
    </div>
  );
} 