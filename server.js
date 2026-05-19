const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/shell', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.json({
      success: false,
      error: 'No command provided'
    });
  }

  exec(command, (error, stdout, stderr) => {
    res.json({
      success: !error,
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: error ? error.code : 0,
      error: error ? error.message : null
    });
  });
});

app.listen(PORT, () => {
  console.log(`Shell API server running on http://localhost:${PORT}`);
  console.log('POST /api/shell with { command: "your command" }');
});
