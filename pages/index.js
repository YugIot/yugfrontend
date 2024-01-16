import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios'; // Ensure axios is installed

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
  const [mqttMessage, setMqttMessage] = useState(""); // New state for MQTT message
  const [mqttTopic, setMqttTopic] = useState(""); // New state for MQTT topic
  const [topicName, setTopicName] = useState(""); // New state for topic name

  const socket = io.connect('https://yuiot.tech:5000');

  const sendToBackend = (value) => {
    socket.emit('sendToBackend', { topic: mqttTopic, message: value });
  };

  const sendToMQTT = (value) => {
    socket.emit('sendToMQTT', { topic: mqttTopic, message: value });
  };

  const subscribeToTopic = async () => {
    try {
      await axios.post('https://yugiot.tech:5000/subscribe', { topic: topicName });
      alert(`Subscribed to ${topicName}`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      alert('Error subscribing to topic');
    }
  };

  const unsubscribeFromTopic = async () => {
    try {
      await axios.post('https://yugiot.tech:5000/unsubscribe', { topic: topicName });
      alert(`Unsubscribed from ${topicName}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      alert('Error unsubscribing from topic');
    }
  };

  useEffect(() => {
    socket.emit('subscribeData', { topic: mqttTopic });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);

      try {
        const jsonData = JSON.parse(message);
        if (jsonData && typeof jsonData === 'object') {
          const keys = Object.keys(jsonData);
          const values = Object.values(jsonData);
          const table = (
            <table style={tableStyle}>
              <thead>
                <tr>
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
  }, [mqttTopic]);

  const handleSendToBackend = () => {
    sendToBackend(inputMessage);
    setInputMessage("");
  };

  const handleSendToMQTT = () => {
    sendToMQTT(mqttMessage);
    setMqttMessage("");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold my-4">Yug IOT Sensor Readings</h1>

      {tableData}

      {/* MQTT message sending section */}
      <div>
        <input
          type="text"
          value={mqttTopic}
          onChange={(e) => setMqttTopic(e.target.value)}
          placeholder="Enter MQTT topic"
        />
        <input
          type="text"
          value={mqttMessage}
          onChange={(e) => setMqttMessage(e.target.value)}
          placeholder="Enter MQTT message"
        />
        <button onClick={handleSendToMQTT}>Send to MQTT</button>
      </div>

      {/* Backend message sending section */}
      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Enter a message"
        />
        <button onClick={handleSendToBackend}>Send Message to Backend</button>
      </div>

      {/* Subscription section */}
      <div>
        <input
          type="text"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="Enter topic name"
        />
        <button onClick={subscribeToTopic}>Subscribe</button>
        <button onClick={unsubscribeFromTopic}>Unsubscribe</button>
      </div>
    </div>
  );
};

export default MQTTPage;
