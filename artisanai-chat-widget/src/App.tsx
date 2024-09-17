import logo from './logo.svg';
import './App.scss';
import ChatWidget from './components/ChatWidget';
import { useState } from 'react';
import ErrorToast from './components/ErrorToast';

function App() {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleError = (message: string) => {
      setErrorMessages([...errorMessages, message]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          ArtisanAI Chatbot
        </p>
      </header>
      <div className="App-messages-tray">
          {errorMessages.map((message, index) => (
              <ErrorToast key={index} message={message} />
          ))}
      </div>
      <div className="App-body">
        <ChatWidget onError={handleError} />
      </div>
    </div>
  );
}

export default App;
