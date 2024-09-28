import { useState, useEffect, useCallback } from 'react';

export const useEthereumWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [ethereum, setEthereum] = useState(null);

  const connectWallet = useCallback(async () => {
    if (ethereum) {
      try {
        await ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      console.error('Ethereum object not found');
    }
  }, [ethereum]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
  }, []);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
      setAccount(null);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
    }
  }, [account]);

  const handleChainChanged = useCallback((chainId) => {
    setChainId(chainId);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      setEthereum(window.ethereum);
      window.ethereum.request({ method: 'eth_accounts' }).then(handleAccountsChanged);
      window.ethereum.request({ method: 'eth_chainId' }).then(handleChainChanged);

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  const getBalance = useCallback(async (address) => {
    if (!ethereum) return null;
    try {
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      return parseInt(balance, 16) / 1e18;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }, [ethereum]);

  return {
    account,
    chainId,
    connectWallet,
    disconnectWallet,
    getBalance,
  };
};