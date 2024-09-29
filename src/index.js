import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { EthereumWalletProvider } from './hooks/useEthereumWallet';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <EthereumWalletProvider>
      <App />
    </EthereumWalletProvider>
  </React.StrictMode>
);