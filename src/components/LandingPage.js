import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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

  const [exchangeAmount, setExchangeAmount] = useState('');
const [exchangeMessage, setExchangeMessage] = useState('');
const [exchangeMessageType, setExchangeMessageType] = useState(''); // success or error
const [exchangeRecipientAccountId, setExchangeRecipientAccountId] = useState('');

const [transactions, setTransactions] = useState([]);
const [loadingTransactions, setLoadingTransactions] = useState(false);
const [transactionError, setTransactionError] = useState('');

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
      await axios.post('http://localhost:5073/api/account', {
        accountName,
        currency
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json'
        }
      });
      fetchWallets();
      setShowCreateWalletForm(false);
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };
  
  // When showing the create wallet form, deselect the selected wallet
  const showCreateWalletFormHandler = () => {
    setShowCreateWalletForm(true);
    setSelectedWallet(null);
  };
  

  const handleDeposit = async () => {
    if (!selectedWallet) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5073/api/account/fund', {
        accountId: selectedWallet.id,
        amount: parseFloat(amount)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json'
        }
      });
      setMessage('Deposit successful');
      setMessageType('success');
      setSelectedWallet(prev => ({
        ...prev,
        balance: prev.balance + parseFloat(amount)
      }));
      setAmount('');
      fetchWallets();
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
      await axios.post('http://localhost:5073/api/account/withdraw', {
        accountId: selectedWallet.id,
        amount: parseFloat(amount)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json'
        }
      });
      setMessage('Withdraw successful');
      setMessageType('success');
      setSelectedWallet(prev => ({
        ...prev,
        balance: prev.balance - parseFloat(amount)
      }));
      setAmount('');
      fetchWallets();
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
    setExchangeAmount(''); // Add this line
  setExchangeRecipientAccountId(''); // Add this line
  setExchangeMessage(''); // Add this line
  setExchangeMessageType(''); // Add this line
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
        fetchWallets();
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
      await axios.post('http://localhost:5073/api/account/transfer', {
        senderAccountId: selectedWallet.id,
        recipientAccountId: parseInt(recipientAccountId),
        amount: parseFloat(amount)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json'
        }
      });
      setMessage('Transfer successful');
      setMessageType('success');
      setSelectedWallet(prev => ({
        ...prev,
        balance: prev.balance - parseFloat(amount)
      }));
      setAmount('');
      setRecipientAccountId('');
      fetchWallets();
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

  const getUsernameFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      return decodedToken.given_name;
    }
    return null;
  };

  const handleExchangeFunds = async () => {
    if (!selectedWallet) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5073/api/account/exchange', {
        senderAccountId: selectedWallet.id,
        recipientAccountId: parseInt(exchangeRecipientAccountId),
        amount: parseFloat(exchangeAmount)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json-patch+json'
        }
      });
      setExchangeMessage('Exchange successful');
      setExchangeMessageType('success');
      setSelectedWallet(prev => ({
        ...prev,
        balance: prev.balance - parseFloat(exchangeAmount) // Update balance
      }));
      setExchangeAmount('');
      setExchangeRecipientAccountId('');
      fetchWallets();
    } catch (error) {
      if (error.response) {
        setExchangeMessage(error.response.data.message);
        setExchangeMessageType('error');
      } else {
        setExchangeMessage('An error occurred while exchanging funds');
        setExchangeMessageType('error');
      }
    }
  };
  
  const fetchTransactions = async (accountId) => {
    setLoadingTransactions(true);
    setTransactionError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5073/api/account/transactions/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTransactions(response.data);
    } catch (error) {
      if (error.response) {
        setTransactionError(error.response.data.message);
      } else {
        setTransactionError('An error occurred while fetching transactions');
      }
    } finally {
      setLoadingTransactions(false);
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
        <div className={`sidebar-item ${activeSection === 'exchange' ? 'active' : ''}`} onClick={() => setActiveSection('exchange')}>
            Exchange Currency
        </div>
        <div className={`sidebar-item ${activeSection === 'transactions' ? 'active' : ''}`} onClick={() => setActiveSection('transactions')}>
        Past Transactions
        </div>

        <div className="sidebar-username">{getUsernameFromToken()}</div>
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
              <button className="create-wallet-button" onClick={showCreateWalletFormHandler}>
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
                  <div className="input-group">
                    <label htmlFor="amount">Amount:</label>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount"
                    />
                  </div>
                  <button onClick={handleDeposit}>Deposit</button>
                  <button onClick={handleWithdraw}>Withdraw</button>
                  <button onClick={handleDeleteWallet} className="delete-button">Delete Wallet</button>
                  {message && <p className={`message ${messageType}`}>{message}</p>}
                </div>
              </div>
            )}
            {!selectedWallet && showCreateWalletForm && (
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
                  <div className="input-group">
                    <label htmlFor="recipientAccountId">Recipient Account ID:</label>
                    <input
                      type="number"
                      id="recipientAccountId"
                      value={recipientAccountId}
                      onChange={(e) => setRecipientAccountId(e.target.value)}
                      placeholder="Recipient Account ID"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="amount">Amount:</label>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount"
                    />
                  </div>
                  <button onClick={handleTransferFunds}>Transfer</button>
                  {message && <p className={`message ${messageType}`}>{message}</p>}
                </div>
              </div>
            )}
          </div>
        )}
        {activeSection === 'exchange' && (
        <div className="exchange-section">
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
                <div className="input-group">
                    <label htmlFor="exchangeRecipientAccountId">Recipient Account ID:</label>
                    <input
                    type="number"
                    id="exchangeRecipientAccountId"
                    value={exchangeRecipientAccountId}
                    onChange={(e) => setExchangeRecipientAccountId(e.target.value)}
                    placeholder="Recipient Account ID"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="exchangeAmount">Amount:</label>
                    <input
                    type="number"
                    id="exchangeAmount"
                    value={exchangeAmount}
                    onChange={(e) => setExchangeAmount(e.target.value)}
                    placeholder="Amount"
                    />
                </div>
                <button onClick={handleExchangeFunds}>Exchange</button>
                {exchangeMessage && <p className={`message ${exchangeMessageType}`}>{exchangeMessage}</p>}
                </div>
            </div>
            )}
        </div>
        )}
        {activeSection === 'transactions' && (
        <div className="transactions-section">
            <div className="wallet-buttons">
            {wallets.map(wallet => (
                <button
                key={wallet.id}
                className={`wallet-button ${selectedWallet?.id === wallet.id ? 'active' : ''}`}
                onClick={() => {
                    handleWalletSelection(wallet);
                    fetchTransactions(wallet.id);
                }}
                >
                {wallet.accountName}
                </button>
            ))}
            </div>
            {selectedWallet && (
            <div className="transaction-list">
                <h3>Past Transactions for {selectedWallet.accountName}</h3>
                {loadingTransactions ? (
                <p>Loading transactions...</p>
                ) : transactionError ? (
                <p className="error">{transactionError}</p>
                ) : transactions.length === 0 ? (
                <p>No transactions found.</p>
                ) : (
                <div className="transaction-items">
                    {transactions.map(transaction => (
                    <div key={transaction.id} className="transaction-item">
                        <p>{transaction.description}</p>
                        <p>{transaction.amount}</p>
                        <p>{transaction.category}</p>
                        <p>{new Date(transaction.transactionDate).toLocaleString()}</p>
                    </div>
                    ))}
                </div>
                )}
            </div>
            )}
        </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
