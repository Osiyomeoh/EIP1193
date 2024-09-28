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
      // Return the balance as a string to preserve precision
      return (parseInt(balance, 16) / 1e18).toString();
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }, [ethereum]);

  const NETWORKS = {
    mainnet: {
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID'],
      blockExplorerUrls: ['https://etherscan.io'],
    },
    sepolia: {
      chainId: '0xaa36a7',
      chainName: 'Sepolia Testnet',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
      rpcUrls: ['https://sepolia.infura.io/v3/YOUR-PROJECT-ID'],
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    },
  };

  const switchNetwork = useCallback(async (networkName) => {
    if (!ethereum) {
      console.error('Ethereum object not found');
      return;
    }

    const network = NETWORKS[networkName];
    if (!network) {
      console.error('Invalid network name');
      return;
    }

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      } else {
        console.error('Failed to switch network:', error);
      }
    }
  }, [ethereum]);

  return {
    account,
    chainId,
    connectWallet,
    disconnectWallet,
    getBalance,
    switchNetwork,
  };
};