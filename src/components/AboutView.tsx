import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import { Info, GitHub, Favorite } from '@mui/icons-material';

export default function AboutView() {
  return (
    <Box sx={{ p: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Info sx={{ fontSize: 40, color: '#4CAF50', mr: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              About Samuel Client
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Samuel Client is a powerful Minecraft launcher designed to provide a seamless gaming experience. 
            With support for multiple game versions, mod management, and intuitive controls, it offers 
            everything you need to enjoy Minecraft to the fullest.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Features
          </Typography>
          <ul style={{ marginLeft: 20, marginBottom: 4 }}>
            <li style={{ marginBottom: 8 }}>
              <Typography variant="body1">Multi-version support for Minecraft</Typography>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Typography variant="body1">Easy mod installation and management</Typography>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Typography variant="body1">User-friendly interface</Typography>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Typography variant="body1">Customizable settings</Typography>
            </li>
            <li>
              <Typography variant="body1">Secure account management</Typography>
            </li>
          </ul>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Contact
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <GitHub sx={{ mr: 2, color: '#4CAF50' }} />
            <Typography variant="body1">
              <a href="https://github.com/HRPAuth/HRPML" target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50', textDecoration: 'none' }}>
                GitHub Repository
              </a>
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: 'gray' }}>
              Made with <Favorite sx={{ color: '#ff4081', display: 'inline' }} /> by Samuel Cheston
            </Typography>
            <Typography variant="body2" sx={{ color: 'gray', mt: 1 }}>
              Version 0.3.0
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
