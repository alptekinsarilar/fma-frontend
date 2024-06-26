import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LandingPage.css'; // Create this CSS file for styling

const LandingPage = () => {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showCreateWalletForm, setShowCreateWalletForm] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [currency, setCurrency] = useState(0);
  const [activeSection, setActiveSection] = useState('wallets');

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
                  onClick={() => setSelectedWallet(wallet)}
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
            {/* Transfer functionality will go here */}
            <h3>Transfer Section</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
