import express, { Express, Request, Response } from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

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

interface JfsGetResponse {
  success: boolean;
  data: object | Array<any>;
  path: string;
}

app.get('/api/jfs/', (req: Request, res: Response<JfsGetResponse | { success: boolean; error: string }>) => {
  const filePath = req.query.file as string;
  
  if (!filePath) {
    return res.status(400).json({ success: false, error: 'File path not provided' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    res.json({ success: true, data, path: filePath });
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    return res.status(400).json({ success: false, error: 'Invalid JSON in file' });
  }
});

interface JfsPostRequest {
  file: string;
  content: object;
}

interface JfsPostResponse {
  success: boolean;
  message: string;
  path: string;
}

app.post('/api/jfs/', (req: Request<{}, {}, JfsPostRequest>, res: Response<JfsPostResponse | { success: boolean; error: string }>) => {
  const { file, content } = req.body;
  
  if (!file || typeof file !== 'string') {
    return res.status(400).json({ success: false, error: 'File path not provided' });
  }
  
  if (!content || typeof content !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  }

  try {
    fs.writeFileSync(file, JSON.stringify(content, null, 2));
    res.json({ success: true, message: 'File written successfully', path: file });
  } catch (err) {
    return res.status(400).json({ success: false, error: (err as Error).message });
  }
});

interface JfsPatchRequest {
  file: string;
  modify: object;
}

interface JfsPatchResponse {
  success: boolean;
  message: string;
  path: string;
  data: object | Array<any>;
}

app.patch('/api/jfs/', (req: Request<{}, {}, JfsPatchRequest>, res: Response<JfsPatchResponse | { success: boolean; error: string }>) => {
  const { file, modify } = req.body;
  
  if (!file || typeof file !== 'string') {
    return res.status(400).json({ success: false, error: 'File path not provided' });
  }
  
  if (!modify || typeof modify !== 'object') {
    return res.status(400).json({ success: false, error: 'Modify object invalid' });
  }

  try {
    const content = fs.readFileSync(file, 'utf-8');
    const data = JSON.parse(content);
    
    if (typeof data === 'object' && data !== null) {
      Object.assign(data, modify);
    }
    
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'File modified successfully', path: file, data });
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    return res.status(400).json({ success: false, error: 'Invalid JSON in file' });
  }
});

interface JfsDeleteResponse {
  success: boolean;
  message: string;
  path: string;
}

app.delete('/api/jfs/', (req: Request, res: Response<JfsDeleteResponse | { success: boolean; error: string }>) => {
  const filePath = req.query.file as string;
  
  if (!filePath) {
    return res.status(400).json({ success: false, error: 'File path not provided' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted successfully', path: filePath });
  } catch (err) {
    return res.status(500).json({ success: false, error: (err as Error).message });
  }
});

interface FsGetResponse {
  success: boolean;
  content: string;
  path: string;
}

app.get('/api/fs/', (req: Request, res: Response<FsGetResponse | { success: boolean; error: string }>) => {
  const filePath = req.query.path as string;
  
  if (!filePath) {
    return res.status(400).json({ success: false, error: 'File path not provided' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ success: true, content, path: filePath });
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    return res.status(500).json({ success: false, error: (err as Error).message });
  }
});

interface FsPostRequest {
  path: string;
  content?: string;
  action: 'create' | 'content-add' | 'content-replace' | 'content-rewrite';
  search?: string;
  replaceWith?: string;
}

interface FsPostResponse {
  success: boolean;
  message: string;
  path: string;
}

app.post('/api/fs/', (req: Request<{}, {}, FsPostRequest>, res: Response<FsPostResponse | { success: boolean; error: string }>) => {
  const { path: filePath, content, action, search, replaceWith } = req.body;
  
  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({ success: false, error: 'File path not provided' });
  }
  
  const validActions: string[] = ['create', 'content-add', 'content-replace', 'content-rewrite'];
  if (!action || !validActions.includes(action)) {
    return res.status(400).json({ success: false, error: 'Invalid action' });
  }

  try {
    let resultContent = '';
    
    switch (action) {
      case 'create':
      case 'content-rewrite':
        if (content === undefined || typeof content !== 'string') {
          return res.status(400).json({ success: false, error: 'Content is required for create or content-rewrite' });
        }
        fs.writeFileSync(filePath, content);
        break;
        
      case 'content-add':
        if (content === undefined || typeof content !== 'string') {
          return res.status(400).json({ success: false, error: 'Content is required for content-add' });
        }
        fs.appendFileSync(filePath, content);
        break;
        
      case 'content-replace':
        if (search === undefined || typeof search !== 'string') {
          return res.status(400).json({ success: false, error: 'Search string is required for content-replace' });
        }
        const existingContent = fs.readFileSync(filePath, 'utf-8');
        resultContent = existingContent.split(search).join(replaceWith || '');
        fs.writeFileSync(filePath, resultContent);
        break;
    }
    
    res.json({ success: true, message: 'Operation completed successfully', path: filePath });
  } catch (err) {
    return res.status(500).json({ success: false, error: (err as Error).message });
  }
});

interface FsDeleteResponse {
  success: boolean;
  message: string;
  path: string;
}

app.delete('/api/fs/', (req: Request, res: Response<FsDeleteResponse | { success: boolean; error: string }>) => {
  const filePath = req.query.path as string;
  
  if (!filePath) {
    return res.status(400).json({ success: false, error: 'File path not provided' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted successfully', path: filePath });
  } catch (err) {
    return res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Shell API server running on http://localhost:${PORT}`);
  console.log('POST /api/execute with { command: "your command" }');
  console.log('GET/POST/PATCH/DELETE /api/jfs/ for JSON file operations');
  console.log('GET/POST/DELETE /api/fs/ for text file operations');
});