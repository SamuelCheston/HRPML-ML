import { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, CardContent, TextField, Alert, CircularProgress, List, ListItem, ListItemButton, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { Login, Refresh } from '@mui/icons-material';
import { HRPAuthAPI, CMCLConfigAPI, HRPAuthAccount } from '../services/shellApi';
import { ConfigAPI } from '../services/configApi';

export default function AccountManager() {
  const [accounts, setAccounts] = useState<HRPAuthAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const savedAddress = await ConfigAPI.getConfig('authlibAddress');
      if (savedAddress) {
        setServerUrl(savedAddress as string);
      }
    };
    loadConfig();
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await CMCLConfigAPI.getCmclConfig();
      if (result.success && result.data) {
        const config = result.data as Record<string, unknown>;
        setAccounts((config.accounts as HRPAuthAccount[]) || []);
      } else {
        setAccounts([]);
      }
    } catch {
      setError('Failed to load accounts');
      setAccounts([]);
    }
    setIsLoading(false);
  };

  const handleLoginHRPAuth = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    if (!serverUrl.trim()) {
      setError('Please enter server address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await HRPAuthAPI.loginAndSave(serverUrl, email, password);

      if (result.success) {
        setSuccessMessage(result.message);
        await ConfigAPI.setConfig('authlibAddress', serverUrl);
        await loadAccounts();
        setEmail('');
        setPassword('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    }

    setIsLoading(false);
  };

  const handleSelectAccount = async (index: number) => {
    const account = accounts[index];
    if (!account) return;

    setIsLoading(true);
    setError(null);
    try {
      const updatedAccounts = accounts.map((acc, i) => ({
        ...acc,
        selected: i === index,
      }));

      const result = await CMCLConfigAPI.updateCmclAccounts(updatedAccounts);
      if (result.success) {
        setSelectedAccount(index);
        setAccounts(updatedAccounts);
      } else {
        setError('Failed to select account');
      }
    } catch {
      setError('Failed to select account');
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 4 }}>HRPAuth Account Management</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Login with HRPAuth (Yggdrasil)</Typography>
                startIcon={<Login />}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
              <TextField
                label="Server Address"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="e.g., https://auth.example.com"
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<Login />}
                onClick={handleLoginHRPAuth}
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? <CircularProgress size={20} /> : 'Login with HRPAuth'}
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Accounts</Typography>
            <Button onClick={loadAccounts} disabled={isLoading} sx={{ mb: 2 }}>
              <Refresh sx={{ mr: 1 }} />
              {isLoading ? 'Loading...' : 'Refresh List'}
            </Button>
            <List>
              {accounts.map((account, index) => (
                <ListItem key={account.uuid}>
                  <ListItemButton onClick={() => handleSelectAccount(index)} selected={selectedAccount === index}>
                    <ListItemText primary={account.playerName} secondary={`${account.username} | ${account.serverName}`} />
                    <ListItemSecondaryAction>
                      {selectedAccount === index && (
                        <Typography variant="body2" color="primary">Selected</Typography>
                      )}
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {accounts.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                No accounts found. Login with HRPAuth above.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
  }