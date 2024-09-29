import React, { useState, useCallback, useEffect } from 'react';
import { useEthereumWallet } from './hooks/useEthereumWallet';
import { ethers } from 'ethers';

function App() {
    const { 
        account, 
        chainId, 
        connectWallet, 
        disconnectWallet, 
        getBalance, 
        switchNetwork, 
        isDisconnected 
    } = useEthereumWallet();

    const [addressInput, setAddressInput] = useState('');
    const [balance, setBalance] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Add this function to get the network name
    const getNetworkName = (chainId) => {
        switch (chainId) {
            case '0x1':
                return 'Ethereum Mainnet';
            case '0xaa36a7':
                return 'Sepolia Testnet';
            default:
                return 'Unknown Network';
        }
    };

    useEffect(() => {
        setIsConnected(!!account && !isDisconnected);
    }, [account, isDisconnected]);

    const handleConnect = async () => {
        try {
            await connectWallet();
            // The isConnected state will be updated by the useEffect hook
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnectWallet();
            // The isConnected state will be updated by the useEffect hook
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    };

    const handleNetworkChange = useCallback(async (networkName) => {
        try {
            await switchNetwork(networkName);
        } catch (error) {
            console.error('Failed to switch network:', error);
        }
    }, [switchNetwork]);

    const handleGetBalance = useCallback(async () => {
        if (ethers.utils.isAddress(addressInput)) {
            try {
                const balance = await getBalance(addressInput);
                if (balance !== null) {
                    // The balance is already in Ether, so we can set it directly
                    setBalance(balance);
                } else {
                    setBalance('Error');
                }
            } catch (error) {
                console.error('Failed to get balance:', error);
                setBalance('Error');
            }
        } else {
            alert('Please enter a valid Ethereum address');
        }
    }, [addressInput, getBalance]);

    const buttonStyle = {
        padding: '10px 20px',
        margin: '5px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        color: 'white',
        backgroundColor: '#4CAF50',
    };

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '5px',
        border: '1px solid #ddd',
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
                {!isConnected ? (
                    <button onClick={handleConnect} style={buttonStyle}>Connect Wallet</button>
                ) : (
                    <div>
                        <p><strong>Connected Account:</strong> {account}</p>
                        <p><strong>Network:</strong> {getNetworkName(chainId)} (Chain ID: {chainId})</p>
                        <button onClick={handleDisconnect} style={{...buttonStyle, backgroundColor: '#f44336'}}>
                            Disconnect Wallet
                        </button>
                        <div style={{ marginTop: '10px' }}>
                            <button onClick={() => handleNetworkChange('mainnet')} style={{...buttonStyle, backgroundColor: '#2196F3'}}>
                                Switch to Mainnet
                            </button>
                            <button onClick={() => handleNetworkChange('sepolia')} style={{...buttonStyle, backgroundColor: '#FF9800'}}>
                                Switch to Sepolia
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div style={cardStyle}>
                <h2>Check Balance</h2>
                <input 
                    type="text" 
                    value={addressInput} 
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Enter Ethereum address"
                    style={inputStyle}
                />
                <button onClick={handleGetBalance} style={buttonStyle}>Get Balance</button>
                {balance !== null && (
                    <p><strong>Balance:</strong> {balance} ETH</p>
                )}
            </div>
        </div>
    );
}

export default App;
