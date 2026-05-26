import { CMCL_CONFIG } from '../variables';

const { shellApiUrl, cmclPath, cmclJsonPath } = CMCL_CONFIG;

export interface ShellResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error: string | null;
}

export interface JFSResult<T = unknown> {
  success: boolean;
  data?: T;
  path?: string;
  message?: string;
  error?: string;
}

export interface InstallOptions {
  fabric?: boolean;
  fabricVersion?: string;
  forge?: boolean;
  forgeVersion?: string;
  optifine?: boolean;
  optifineVersion?: string;
  quilt?: boolean;
  quiltVersion?: string;
  select?: boolean;
}

export const ShellAPI = {
  async execute(command: string): Promise<ShellResult> {
    if (!command || typeof command !== 'string') {
      return { success: false, stdout: '', stderr: '', error: 'Invalid command' };
    }

    try {
      const response = await fetch(`${shellApiUrl}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        try {
          const json = await response.json();
          return {
            success: false,
            stdout: '',
            stderr: '',
            error: json.error || `HTTP ${response.status}: ${response.statusText}`,
          };
        } catch {
          const text = await response.text();
          return {
            success: false,
            stdout: '',
            stderr: '',
            error: `HTTP ${response.status}: ${text || response.statusText}`,
          };
        }
      }

      const result = await response.json();
      return {
        success: result.success || false,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        error: result.error || null,
      };
    } catch (err) {
      return {
        success: false,
        stdout: '',
        stderr: '',
        error: err instanceof Error ? err.message : 'Failed to execute command',
      };
    }
  },
};

export const CMCLAPI = {
  async listVersions(): Promise<string[]> {
    const command = `${cmclPath} --list`;
    const result = await ShellAPI.execute(command);
    if (result.success) {
      const lines = result.stdout.trim().split('\n');
      return lines.filter(line => line.trim()).map(line => line.trim());
    }
    return [];
  },

  async selectVersion(version: string): Promise<ShellResult> {
    const command = `${cmclPath} --select=${version}`;
    return await ShellAPI.execute(command);
  },

  async startGame(version?: string): Promise<ShellResult> {
    const command = version ? `${cmclPath} ${version}` : cmclPath;
    return await ShellAPI.execute(command);
  },

  async installVersion(version: string, options: InstallOptions = {}): Promise<ShellResult> {
    let command = `${cmclPath} install ${version}`;
    
    if (options.fabric) {
      command += ` --fabric${options.fabricVersion ? `=${options.fabricVersion}` : ''}`;
    }
    if (options.forge) {
      command += ` --forge${options.forgeVersion ? `=${options.forgeVersion}` : ''}`;
    }
    if (options.optifine) {
      command += ` --optifine${options.optifineVersion ? `=${options.optifineVersion}` : ''}`;
    }
    if (options.quilt) {
      command += ` --quilt${options.quiltVersion ? `=${options.quiltVersion}` : ''}`;
    }
    if (options.select) {
      command += ' -s';
    }

    return await ShellAPI.execute(command);
  },

  async uninstallVersion(version: string): Promise<ShellResult> {
    const command = `${cmclPath} version ${version} --delete`;
    return await ShellAPI.execute(command);
  },

  async getVersionInfo(version: string): Promise<ShellResult> {
    const command = `${cmclPath} version ${version} --info`;
    return await ShellAPI.execute(command);
  },

  async listAccounts(): Promise<string[]> {
    const command = `${cmclPath} account --list`;
    const result = await ShellAPI.execute(command);
    if (result.success) {
      const lines = result.stdout.trim().split('\n');
      return lines.filter(line => line.trim()).map(line => line.trim());
    }
    return [];
  },

  async selectAccount(index: number): Promise<ShellResult> {
    const command = `${cmclPath} account --select=${index}`;
    return await ShellAPI.execute(command);
  },

  async loginOffline(username: string): Promise<ShellResult> {
    const command = `${cmclPath} account --login=offline --name=${username}`;
    return await ShellAPI.execute(command);
  },

  async loginMicrosoft(): Promise<ShellResult> {
    const command = `${cmclPath} account --login=microsoft`;
    return await ShellAPI.execute(command);
  },

  async loginAuthlib(address: string): Promise<ShellResult> {
    const command = `${cmclPath} account --login=authlib --address=${address}`;
    return await ShellAPI.execute(command);
  },

  async getConfig(key?: string): Promise<ShellResult> {
    const command = key ? `${cmclPath} config ${key}` : `${cmclPath} config -a`;
    return await ShellAPI.execute(command);
  },

  async setConfig(key: string, value: string): Promise<ShellResult> {
    const command = `${cmclPath} config ${key} ${value}`;
    return await ShellAPI.execute(command);
  },

  async installMod(url: string): Promise<ShellResult> {
    const command = `${cmclPath} mod --url=${url}`;
    return await ShellAPI.execute(command);
  },

  async searchMod(name: string): Promise<ShellResult> {
    const command = `${cmclPath} mod --info --name=${name}`;
    return await ShellAPI.execute(command);
  },

  async installModpack(url: string): Promise<ShellResult> {
    const command = `${cmclPath} modpack --url=${url}`;
    return await ShellAPI.execute(command);
  },

  async searchModpack(name: string): Promise<ShellResult> {
    const command = `${cmclPath} modpack --info --name=${name}`;
    return await ShellAPI.execute(command);
  },

  async checkForUpdates(): Promise<ShellResult> {
    const command = `${cmclPath} --check-for-updates`;
    return await ShellAPI.execute(command);
  },

  async getAboutInfo(): Promise<ShellResult> {
    const command = `${cmclPath} --about`;
    return await ShellAPI.execute(command);
  }
};

export const JFSAPI = {
  async readFile(filePath: string): Promise<JFSResult> {
    try {
      const response = await fetch(`${shellApiUrl}/api/jfs/?file=${encodeURIComponent(filePath)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const json = await response.json();
        return { success: false, error: json.error || `HTTP ${response.status}` };
      }

      const result = await response.json();
      return {
        success: result.success,
        data: result.data,
        path: result.path,
        error: result.error,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to read file',
      };
    }
  },

  async writeFile(filePath: string, content: unknown): Promise<JFSResult> {
    try {
      const response = await fetch(`${shellApiUrl}/api/jfs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: filePath, content }),
      });

      if (!response.ok) {
        const json = await response.json();
        return { success: false, error: json.error || `HTTP ${response.status}` };
      }

      const result = await response.json();
      return {
        success: result.success,
        message: result.message,
        path: result.path,
        error: result.error,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to write file',
      };
    }
  },

  async modifyFile(filePath: string, modify: Record<string, unknown>): Promise<JFSResult> {
    try {
      const response = await fetch(`${shellApiUrl}/api/jfs/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: filePath, modify }),
      });

      if (!response.ok) {
        const json = await response.json();
        return { success: false, error: json.error || `HTTP ${response.status}` };
      }

      const result = await response.json();
      return {
        success: result.success,
        message: result.message,
        path: result.path,
        data: result.data,
        error: result.error,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to modify file',
      };
    }
  },

  async deleteFile(filePath: string): Promise<JFSResult> {
    try {
      const response = await fetch(`${shellApiUrl}/api/jfs/?file=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const json = await response.json();
        return { success: false, error: json.error || `HTTP ${response.status}` };
      }

      const result = await response.json();
      return {
        success: result.success,
        message: result.message,
        path: result.path,
        error: result.error,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete file',
      };
    }
  },
};

export const RelayAPI = {
  async get(url: string): Promise<Response> {
    return await fetch(`${shellApiUrl}/api/relay`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
  },

  async post(url: string, data?: unknown): Promise<Response> {
    const body: Record<string, unknown> = { url };
    if (data !== undefined) {
      body.data = data;
    }

    return await fetch(`${shellApiUrl}/api/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },
};

export const CMCLConfigAPI = {
  async getCmclConfig(): Promise<JFSResult> {
    return await JFSAPI.readFile(cmclJsonPath);
  },

  async saveCmclConfig(config: unknown): Promise<JFSResult> {
    return await JFSAPI.writeFile(cmclJsonPath, config);
  },

  async updateCmclAccounts(accounts: unknown[]): Promise<JFSResult> {
    return await JFSAPI.modifyFile(cmclJsonPath, { accounts });
  },
};

export interface HRPAuthLoginResponse {
  success: boolean;
  accessToken: string;
  clientToken: string;
  availableProfiles: Array<{
    id: string;
    name: string;
    model?: string;
  }>;
  selectedProfile: {
    id: string;
    name: string;
    model?: string;
  };
  user?: {
    id: string;
    email: string;
    username: string;
    properties: unknown[];
  };
  error?: string;
  errorMessage?: string;
}

export interface HRPAuthAccount {
  loginMethod: number;
  playerName: string;
  clientToken: string;
  serverName: string;
  accessToken: string;
  metadataEncoded: string;
  uuid: string;
  selected: boolean;
  url: string;
  username: string;
}

export const HRPAuthAPI = {
  async login(
    baseUrl: string,
    email: string,
    password: string
  ): Promise<HRPAuthLoginResponse> {
    try {
      const response = await RelayAPI.post(`${baseUrl}/authserver/authenticate`, {
        username: email,
        password: password,
        agent: {
          name: 'Minecraft',
          version: 1,
        },
        clientToken: Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        requestUser: true,
      });

      if (!response.ok) {
        const json = await response.json();
        return {
          success: false,
          accessToken: '',
          clientToken: '',
          availableProfiles: [],
          selectedProfile: { id: '', name: '' },
          error: json.error,
          errorMessage: json.errorMessage,
        };
      }

      const result = await response.json();
      return {
        success: true,
        accessToken: result.accessToken,
        clientToken: result.clientToken,
        availableProfiles: result.availableProfiles || [],
        selectedProfile: result.selectedProfile || { id: '', name: '' },
        user: result.user,
      };
    } catch (err) {
      return {
        success: false,
        accessToken: '',
        clientToken: '',
        availableProfiles: [],
        selectedProfile: { id: '', name: '' },
        error: 'NetworkError',
        errorMessage: err instanceof Error ? err.message : 'Failed to login',
      };
    }
  },

  async getServerMetadata(baseUrl: string): Promise<{
    success: boolean;
    meta?: unknown;
    skinDomains?: string[];
    signaturePublickey?: string;
    error?: string;
  }> {
    try {
      const response = await RelayAPI.get(baseUrl);

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const result = await response.json();
      return {
        success: true,
        meta: result.meta,
        skinDomains: result.skinDomains,
        signaturePublickey: result.signaturePublickey,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch metadata',
      };
    }
  },

  generateMetadataEncoded(
    serverMetadata: unknown,
    serverName: string
  ): string {
    const metadata = {
      meta: {
        serverName: serverName,
        ...(serverMetadata as Record<string, unknown>),
      },
      skinDomains: [],
      signaturePublickey: '',
    };
    return Buffer.from(JSON.stringify(metadata)).toString('base64');
  },

  async createAccountFromLogin(
    loginResponse: HRPAuthLoginResponse,
    serverUrl: string,
    serverName: string = 'HRPAuth'
  ): Promise<HRPAuthAccount> {
    const profile = loginResponse.selectedProfile || loginResponse.availableProfiles[0];
    const user = loginResponse.user;

    return {
      loginMethod: 1,
      playerName: profile?.name || '',
      clientToken: loginResponse.clientToken,
      serverName: serverName,
      accessToken: loginResponse.accessToken,
      metadataEncoded: this.generateMetadataEncoded({}, serverName),
      uuid: profile?.id || user?.id || '',
      selected: true,
      url: serverUrl,
      username: user?.email || user?.username || '',
    };
  },

  async loginAndSave(
    serverUrl: string,
    email: string,
    password: string,
    serverName: string = 'HRPAuth'
  ): Promise<{
    success: boolean;
    message: string;
    account?: HRPAuthAccount;
    error?: string;
  }> {
    const loginResponse = await this.login(serverUrl, email, password);

    if (!loginResponse.success) {
      return {
        success: false,
        message: loginResponse.errorMessage || 'Login failed',
        error: loginResponse.error,
      };
    }

    const account = await this.createAccountFromLogin(
      loginResponse,
      serverUrl,
      serverName
    );

    const configResult = await CMCLConfigAPI.getCmclConfig();
    let currentAccounts: HRPAuthAccount[] = [];

    if (configResult.success && configResult.data) {
      const config = configResult.data as Record<string, unknown>;
      currentAccounts = (config.accounts as HRPAuthAccount[]) || [];
    }

    currentAccounts = currentAccounts.filter(
      acc => acc.uuid !== account.uuid
    );
    currentAccounts.push(account);

    const updateResult = await CMCLConfigAPI.updateCmclAccounts(currentAccounts);

    if (!updateResult.success) {
      return {
        success: false,
        message: 'Failed to save account',
        error: updateResult.error,
      };
    }

    return {
      success: true,
      message: 'Login successful',
      account,
    };
  },
};
