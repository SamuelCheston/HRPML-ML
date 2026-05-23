import express, { Express, Request, Response } from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app: Express = express();
const PORT: number = 34501;

app.use(cors());
app.use(express.json());

interface ShellRequest {
  command: string;
}

interface ShellResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  error: string | null;
}

app.post('/api/execute', (req: Request<{}, {}, ShellRequest>, res: Response<ShellResponse>) => {
  const { command } = req.body;
  
  if (!command || typeof command !== 'string') {
    return res.status(400).json({
      success: false,
      stdout: '',
      stderr: '',
      error: 'Invalid JSON body provided'
    });
  }

  const child = spawn(command, [], { shell: true });
  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  child.on('close', (code) => {
    res.json({
      success: code === 0,
      stdout: stdout || '',
      stderr: stderr || '',
      error: null
    });
  });

  child.on('error', (error) => {
    res.json({
      success: false,
      stdout: stdout || '',
      stderr: stderr || '',
      error: error.message
    });
  });
});

app.listen(PORT, () => {
  console.log(`Shell API server running on http://localhost:${PORT}`);
  console.log('POST /api/execute with { command: "your command" }');
});
