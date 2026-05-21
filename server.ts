import express, { Express, Request, Response } from 'express';
import { exec } from 'child_process';
import cors from 'cors';

const app: Express = express();
const PORT: number = 3000;

app.use(cors());
app.use(express.json());

interface ShellRequest {
  command: string;
}

interface ShellResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  error: string | null;
}

app.post('/api/shell', (req: Request<{}, {}, ShellRequest>, res: Response<ShellResponse>) => {
  const { command } = req.body;
  
  if (!command) {
    return res.json({
      success: false,
      stdout: '',
      stderr: '',
      exitCode: 1,
      error: 'No command provided'
    });
  }

  exec(command, (error, stdout, stderr) => {
    res.json({
      success: !error,
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: error ? error.code || 1 : 0,
      error: error ? error.message : null
    });
  });
});

app.listen(PORT, () => {
  console.log(`Shell API server running on http://localhost:${PORT}`);
  console.log('POST /api/shell with { command: "your command" }');
});
