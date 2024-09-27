import React, { useState, useEffect } from 'react';

function App() {
    const [account, setAccount] = useState(null);
    const [ethereum, setEthereum] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [balance, setBalance] = useState(null);

    const supportedNetworks = {
        '0x1': 'Ethereum Mainnet',
        '0xaa36a7': 'Sepolia Testnet',  
    };

    useEffect(() => {
        if (window.ethereum) {
            setEthereum(window.ethereum);
            
            
            window.ethereum.request({ method: 'eth_accounts' })
                .then(handleAccountsChanged)
                .catch(console.error);
            
            window.ethereum.request({ method: 'eth_chainId' })
                .then(handleChainChanged)
                .catch(console.error);

            
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }

        
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, []);

    useEffect(() => {
        if (account) {
            getBalance();
        } else {
            setBalance(null);
        }
    }, [account, chainId]);

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            console.log('Please connect to MetaMask.');
            setAccount(null);
        } else if (accounts[0] !== account) {
            setAccount(accounts[0]);
        }
    };

    const handleChainChanged = (newChainId) => {
        setChainId(newChainId);
    };

    const connectWallet = async () => {
        if (!ethereum) {
            alert('Please install an Ethereum wallet like MetaMask');
            return;
        }

        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            handleAccountsChanged(accounts);
        } catch (error) {
            if (error.code === 4001) {
                console.log('User rejected the connection request.');
            } else {
                console.error('An error occurred while connecting:', error);
            }
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setBalance(null);
        console.log('Wallet disconnected');
    };

    const getBalance = async () => {
        if (!ethereum || !account) return;

        try {
            const balance = await ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest'],
            });
            setBalance(parseInt(balance, 16) / 1e18);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const changeNetwork = async (newChainId) => {
        if (!ethereum) return;

        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: newChainId }],
            });
        } catch (error) {
            
            if (error.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [getNetworkParams(newChainId)],
                    });
                } catch (addError) {
                    console.error('Error adding network:', addError);
                }
            } else {
                console.error('Error changing network:', error);
            }
        }
    };

    const getNetworkParams = (chainId) => {
        switch(chainId) {
            case '0x1':
                return {
                    chainId: '0x1',
                    chainName: 'Ethereum Mainnet',
                    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                 
                    blockExplorerUrls: ['https://etherscan.io'],
                };
            case '0xaa36a7':
                return {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
                  
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                };
          
            default:
                throw new Error('Unsupported network');
        }
    };

   

    return (
        <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif',
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ color: '#333' }}>Ethereum Wallet Connection</h1>
            {!account ? (
                <button onClick={connectWallet} style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    marginBottom: '10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}>
                    Connect Wallet
                </button>
            ) : (
                <div style={{
                    backgroundColor: '#e8f5e9',
                    padding: '20px',
                    borderRadius: '5px',
                    marginBottom: '20px'
                }}>
                    <p style={{ color: '#2E7D32', fontWeight: 'bold' }}>Connected</p>
                    <p>Account: <span style={{ fontWeight: 'bold' }}>{account}</span></p>
                    <p>Network: <span style={{ fontWeight: 'bold' }}>{supportedNetworks[chainId] || 'Unknown'}</span></p>
                    <p>Balance: <span style={{ fontWeight: 'bold' }}>{balance !== null ? `${balance.toFixed(4)} ETH` : 'Loading...'}</span></p>
                    <button onClick={disconnectWallet} style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        marginTop: '10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>
                        Disconnect Wallet
                    </button>
                </div>
            )}
            {account && (
                <div>
                    <h2 style={{ color: '#333', marginTop: '20px' }}>Switch Network</h2>
                    {Object.entries(supportedNetworks).map(([id, name]) => (
                        <button 
                            key={id}
                            onClick={() => changeNetwork(id)} 
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                margin: '5px',
                                backgroundColor: chainId === id ? '#4CAF50' : '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Switch to {name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
