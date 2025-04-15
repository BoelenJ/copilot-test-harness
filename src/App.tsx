import { useState } from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { DirectLine } from 'botframework-directlinejs';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const App = () => {
  const [url, setUrl] = useState('');
  const [directLine, setDirectLine] = useState<DirectLine | null>(null);
  const [customEvent, setCustomEvent] = useState('');
  const [customEventValue, setCustomEventValue] = useState('{}');
  const [customEventValueType, setCustomEventValueType] = useState<'string' | 'json'>('string');
  const [isChatReady, setIsChatReady] = useState(false);

  const handleStartChat = async () => {
    if (url) {
      try {
        const response = await axios.get(url);
        const token = response.data.token;
        const newDirectLine = createDirectLine({ token });
        setDirectLine(newDirectLine);
        setIsChatReady(true);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    }
  };

  const handleSendEvent = () => {
    if (directLine && customEvent) {
      let valueToSend = customEventValue;

      if (customEventValueType === 'json') {
        try {
          valueToSend = JSON.parse(customEventValue);
        } catch (error) {
          console.error('Invalid JSON structure for custom event value:', error);
          return;
        }
      }

      directLine.postActivity({
        type: 'event',
        name: customEvent,
        value: valueToSend,
        from: { id: 'user1', name: 'User' },
      }).subscribe();
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setCustomEventValue(value || '{}');
  };

  return (
    <div className="flex h-screen justify-center items-center p-4">
      <div className="flex w-full max-w-5xl h-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/3 bg-gray-100 p-4">
          <h2 className="text-lg font-bold mb-4">Configuration</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Token Endpoint URL</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter the token endpoint URL"
            />
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={handleStartChat}
          >
            Start Chat
          </button>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Custom Event</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              placeholder="Enter custom event name"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Custom Event Value Type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={customEventValueType}
              onChange={(e) => setCustomEventValueType(e.target.value as 'string' | 'json')}
            >
              <option value="string">String</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Custom Event Value</label>
            {customEventValueType === 'json' ? (
              <Editor
                height="200px"
                defaultLanguage="json"
                value={customEventValue}
                onChange={handleEditorChange}
                options={{ minimap: { enabled: false } }}
              />
            ) : (
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                value={customEventValue}
                onChange={(e) => setCustomEventValue(e.target.value)}
                placeholder="Enter custom event value as a string"
                rows={4}
              />
            )}
          </div>
          <button
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2"
            onClick={handleSendEvent}
          >
            Send Event
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-2/3 bg-white p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Chat</h2>
          <div className="flex-1 border border-gray-300 rounded overflow-hidden">
            {isChatReady && directLine ? (
              <ReactWebChat directLine={directLine} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Start a chat to see the conversation here.
              </div>
            )}
          </div>
          <button
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mt-4"
            onClick={() => {
              setDirectLine(null);
              setIsChatReady(false);
            }}
          >
            Reset Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;