import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LandingPage.css';

const LandingPage = () => {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showCreateWalletForm, setShowCreateWalletForm] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [currency, setCurrency] = useState(0);
  const [activeSection, setActiveSection] = useState('wallets');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success or error
  const [recipientAccountId, setRecipientAccountId] = useState('');

  useEffect(() => {
    if (activeSection === 'wallets') {
      fetchWallets();
    }
  }, [activeSection]);

  const fetchWallets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5073/api/account/accounts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWallets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5073/api/account', {
        accountName,
        currency
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json'
        }
      });
      setWallets([...wallets, response.data]);
      setShowCreateWalletForm(false);
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  const handleDeposit = async () => {
    if (!selectedWallet) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5073/api/account/fund', {
        accountId: selectedWallet.id,
        amount: parseFloat(amount)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json'
        }
      });
      setMessage(response.data.message);
      setMessageType('success');
      setSelectedWallet(prev => ({
        ...prev,
        balance: prev.balance + parseFloat(amount)
      }));
      setAmount('');
      setWallets(prevWallets => 
        prevWallets.map(wallet => 
          wallet.id === selectedWallet.id ? { ...wallet, balance: wallet.balance + parseFloat(amount) } : wallet
        )
      );
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
        setMessageType('error');
      } else {
        setMessage('An error occurred while depositing money');
        setMessageType('error');
      }
    }
  };

  const handleWithdraw = async () => {
    if (!selectedWallet) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5073/api/account/withdraw', {
        accountId: selectedWallet.id,
        amount: parseFloat(amount)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json'
        }
      });
      setMessage(response.data.message);
      setMessageType('success');
      setSelectedWallet(prev => ({
        ...prev,
        balance: prev.balance - parseFloat(amount)
      }));
      setAmount('');
      setWallets(prevWallets => 
        prevWallets.map(wallet => 
          wallet.id === selectedWallet.id ? { ...wallet, balance: wallet.balance - parseFloat(amount) } : wallet
        )
      );
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
        setMessageType('error');
      } else {
        setMessage('An error occurred while withdrawing money');
        setMessageType('error');
      }
    }
  };

  const handleWalletSelection = (wallet) => {
    setSelectedWallet(wallet);
    setAmount('');
    setMessage('');
    setMessageType('');
  };

  const handleDeleteWallet = async () => {
    if (!selectedWallet) return;
    if (window.confirm(`Do you want to delete ${selectedWallet.accountName}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5073/api/account/${selectedWallet.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json-patch+json'
          }
        });
        setMessage('Wallet deleted successfully');
        setMessageType('success');
        setSelectedWallet(null);
        setWallets(wallets.filter(wallet => wallet.id !== selectedWallet.id));
      } catch (error) {
        if (error.response) {
          setMessage(error.response.data.message);
          setMessageType('error');
        } else {
          setMessage('An error occurred while deleting the wallet');
          setMessageType('error');
        }
      }
    }
  };

  

const handleTransferFunds = async () => {
  if (!selectedWallet) return;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5073/api/account/transfer', {
      senderAccountId: selectedWallet.id,
      recipientAccountId: parseInt(recipientAccountId),
      amount: parseFloat(amount)
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json-patch+json'
      }
    });
    setMessage(response.data.message);
    setMessageType('success');
    setSelectedWallet(prev => ({
      ...prev,
      balance: prev.balance - parseFloat(amount)
    }));
    setAmount('');
    setRecipientAccountId('');
  } catch (error) {
    if (error.response) {
      setMessage(error.response.data.message);
      setMessageType('error');
    } else {
      setMessage('An error occurred while transferring funds');
      setMessageType('error');
    }
  }
};


  return (
    <div className="landing-page">
      <div className="sidebar">
        <div className={`sidebar-item ${activeSection === 'wallets' ? 'active' : ''}`} onClick={() => setActiveSection('wallets')}>
          My Wallets
        </div>
        <div className={`sidebar-item ${activeSection === 'transfer' ? 'active' : ''}`} onClick={() => setActiveSection('transfer')}>
          Make Transfer
        </div>
        <div className="sidebar-username">{localStorage.getItem('username')}</div>
      </div>
      <div className="content">
        {activeSection === 'wallets' && (
          <div className="wallets-section">
            <div className="wallet-buttons">
              {wallets.map(wallet => (
                <button
                  key={wallet.id}
                  className={`wallet-button ${selectedWallet?.id === wallet.id ? 'active' : ''}`}
                  onClick={() => handleWalletSelection(wallet)}
                >
                  {wallet.accountName}
                </button>
              ))}
              <button className="create-wallet-button" onClick={() => setShowCreateWalletForm(true)}>
                Create Wallet
              </button>
            </div>
            {selectedWallet && (
              <div className="wallet-details">
                <h3>{selectedWallet.accountName}</h3>
                <p>Wallet ID: {selectedWallet.id}</p>
                <p>Balance: {selectedWallet.balance}</p>
                <p>Currency: {selectedWallet.currency === 0 ? 'TRY' : 'USD'}</p>
                <div className="transaction-section">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                  />
                  <button onClick={handleDeposit}>Deposit</button>
                  <button onClick={handleWithdraw}>Withdraw</button>
                  <button onClick={handleDeleteWallet} className="delete-button">Delete Wallet</button>
                  {message && <p className={`message ${messageType}`}>{message}</p>}
                </div>
              </div>
            )}
            {showCreateWalletForm && (
              <div className="create-wallet-form">
                <h3>Create Wallet</h3>
                <form onSubmit={handleCreateWallet}>
                  <div className="form-group">
                    <label>Account Name:</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency:</label>
                    <select value={currency} onChange={(e) => setCurrency(Number(e.target.value))} required>
                      <option value={0}>TRY</option>
                      <option value={1}>USD</option>
                    </select>
                  </div>
                  <button type="submit">Create</button>
                </form>
              </div>
            )}
          </div>
        )}
        {activeSection === 'transfer' && (
        <div className="transfer-section">
            <div className="wallet-buttons">
            {wallets.map(wallet => (
                <button
                key={wallet.id}
                className={`wallet-button ${selectedWallet?.id === wallet.id ? 'active' : ''}`}
                onClick={() => handleWalletSelection(wallet)}
                >
                {wallet.accountName}
                </button>
            ))}
            </div>
            {selectedWallet && (
            <div className="wallet-details">
                <h3>{selectedWallet.accountName}</h3>
                <p>Wallet ID: {selectedWallet.id}</p>
                <p>Balance: {selectedWallet.balance}</p>
                <p>Currency: {selectedWallet.currency === 0 ? 'TRY' : 'USD'}</p>
                <div className="transaction-section">
                <input
                    type="number"
                    value={recipientAccountId}
                    onChange={(e) => setRecipientAccountId(e.target.value)}
                    placeholder="Recipient Account ID"
                />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                />
                <button onClick={handleTransferFunds}>Transfer</button>
                {message && <p className={`message ${messageType}`}>{message}</p>}
                </div>
            </div>
            )}
        </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
