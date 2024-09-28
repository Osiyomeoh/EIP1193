import React, { useState, useEffect, useCallback } from 'react';
import { useEthereumWallet } from './hooks/useEthereumWallet';

function App() {
    const { account, chainId, connectWallet, disconnectWallet, getBalance } = useEthereumWallet();
    const [addressInput, setAddressInput] = useState('');
    const [balance, setBalance] = useState(null);

    const handleAddressChange = useCallback((e) => {
        setAddressInput(e.target.value);
    }, []);

    const fetchBalance = useCallback(async () => {
        if (addressInput) {
            const fetchedBalance = await getBalance(addressInput);
            setBalance(fetchedBalance);
        }
    }, [addressInput, getBalance]);

    useEffect(() => {
        if (account) {
            setAddressInput(account);
            fetchBalance();
        } else {
            setBalance(null);
        }
    }, [account, fetchBalance]);

    const buttonStyle = {
        backgroundColor: '#4CAF50',
        border: 'none',
        color: 'white',
        padding: '15px 32px',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'inline-block',
        fontSize: '16px',
        margin: '4px 2px',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 20px',
        margin: '8px 0',
        display: 'inline-block',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
    };

    const cardStyle = {
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
        transition: '0.3s',
        borderRadius: '5px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
    };

    return (
        <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto', 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f0f0f0',
            minHeight: '100vh',
        }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>Ethereum Wallet Connection</h1>
            
            <div style={cardStyle}>
                {!account ? (
                    <button onClick={connectWallet} style={buttonStyle}>Connect Wallet</button>
                ) : (
                    <div>
                        <p><strong>Connected Account:</strong> {account}</p>
                        <p><strong>Chain ID:</strong> {chainId}</p>
                        <button onClick={disconnectWallet} style={{...buttonStyle, backgroundColor: '#f44336'}}>
                            Disconnect Wallet
                        </button>
                    </div>
                )}
            </div>

            <div style={cardStyle}>
                <h2 style={{ color: '#333' }}>Check Balance</h2>
                <input 
                    type="text" 
                    value={addressInput} 
                    onChange={handleAddressChange} 
                    placeholder="Enter Ethereum address"
                    style={inputStyle}
                />
                <button onClick={fetchBalance} style={buttonStyle}>Get Balance</button>
                {balance !== null && (
                    <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '20px' }}>
                        Balance: {balance.toFixed(4)} ETH
                    </p>
                )}
            </div>
        </div>
    );
}

export default App;
