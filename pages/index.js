import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const tableStyle = {
  borderCollapse: 'collapse',
  width: '100%',
  margin: '20px 0',
  border: '2px solid #333',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};

const thStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left',
  background: '#f2f2f2',
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '8px',
};

const MQTTPage = () => {
  const [messages, setMessages] = useState([]);
  const [tableData, setTableData] = useState(null);
  const [inputMessage, setInputMessage] = useState("");

  const MQTT_TOPIC = 'esp32/pub';
  const socket = io.connect('https://yugiot.tech:5000');

  const sendToBackend = (value) => {
    socket.emit('sendToBackend', { topic: MQTT_TOPIC, message: value });
  };

  const sendToMQTT = (value) => {
    socket.emit('sendToMQTT', { topic: MQTT_TOPIC, message: value });
  };

  useEffect(() => {
    socket.emit('subscribeData', { topic: MQTT_TOPIC });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);

      try {
        const jsonData = JSON.parse(message);

        if (jsonData && typeof jsonData === 'object') {
          const keys = Object.keys(jsonData);
          const values = Object.values(jsonData);
          const table = (
            <table className="w-full table-fixed border-collapse" style={tableStyle}>
              <thead>
                <tr className="bg-primary text-white">
                  {keys.map((key, index) => (
                    <th key={index} style={thStyle}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {values.map((value, index) => (
                    <td key={index} style={tdStyle}>
                      {value}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          );
          setTableData(table);
        }
      } catch (error) {
        console.error('Failed to parse JSON:', error);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = () => {
    sendToBackend(inputMessage);
    setInputMessage("");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold my-4">Yug IOT Sensor Readings</h1>

      {tableData}

      <div>
        <button onClick={() => sendToMQTT("1")}>Send 1 to MQTT</button>
        <button onClick={() => sendToMQTT("0")}>Send 0 to MQTT</button>
      </div>

      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Enter a message"
        />
        <button onClick={handleSend}>Send Message to Backend</button>
      </div>
    </div>
  );
};

export default MQTTPage;
