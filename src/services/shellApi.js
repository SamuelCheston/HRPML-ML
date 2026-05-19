import { CMCL_CONFIG } from '../variables';

const { shellApiUrl, cmclPath } = CMCL_CONFIG;

export const ShellAPI = {
  async execute(command) {
    if (!command || typeof command !== 'string') {
      return { success: false, error: 'Invalid command' };
    }

    try {
      const response = await fetch(`${shellApiUrl}/shell.html?cmd=${encodeURIComponent(command)}`);
      
      if (!response.ok) {
        const text = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${text || response.statusText}`,
        };
      }

      const responseText = await response.text();
      if (!responseText) {
        return {
          success: false,
          error: 'Empty response from server',
        };
      }

      const result = JSON.parse(responseText);
      return {
        success: result.exitCode === 0,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: result.exitCode || 0,
        error: result.error || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to execute command',
      };
    }
  },
};

export const CMCLAPI = {
  async listVersions() {
    const command = `${cmclPath} --list`;
    const result = await ShellAPI.execute(command);
    if (result.success) {
      const lines = result.stdout.trim().split('\n');
      return lines.filter(line => line.trim()).map(line => line.trim());
    }
    return [];
  },

  async selectVersion(version) {
    const command = `${cmclPath} --select=${version}`;
    return await ShellAPI.execute(command);
  },

  async startGame(version = null) {
    const command = version ? `${cmclPath} ${version}` : cmclPath;
    return await ShellAPI.execute(command);
  },

  async installVersion(version, options = {}) {
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

  async uninstallVersion(version) {
    const command = `${cmclPath} version ${version} --delete`;
    return await ShellAPI.execute(command);
  },

  async getVersionInfo(version) {
    const command = `${cmclPath} version ${version} --info`;
    return await ShellAPI.execute(command);
  },

  async listAccounts() {
    const command = `${cmclPath} account --list`;
    const result = await ShellAPI.execute(command);
    if (result.success) {
      const lines = result.stdout.trim().split('\n');
      return lines.filter(line => line.trim()).map(line => line.trim());
    }
    return [];
  },

  async selectAccount(index) {
    const command = `${cmclPath} account --select=${index}`;
    return await ShellAPI.execute(command);
  },

  async loginOffline(username) {
    const command = `${cmclPath} account --login=offline --name=${username}`;
    return await ShellAPI.execute(command);
  },

  async loginMicrosoft() {
    const command = `${cmclPath} account --login=microsoft`;
    return await ShellAPI.execute(command);
  },

  async getConfig(key = null) {
    const command = key ? `${cmclPath} config ${key}` : `${cmclPath} config -a`;
    return await ShellAPI.execute(command);
  },

  async setConfig(key, value) {
    const command = `${cmclPath} config ${key} ${value}`;
    return await ShellAPI.execute(command);
  },

  async installMod(url) {
    const command = `${cmclPath} mod --url=${url}`;
    return await ShellAPI.execute(command);
  },

  async searchMod(name) {
    const command = `${cmclPath} mod --info --name=${name}`;
    return await ShellAPI.execute(command);
  },

  async installModpack(url) {
    const command = `${cmclPath} modpack --url=${url}`;
    return await ShellAPI.execute(command);
  },

  async searchModpack(name) {
    const command = `${cmclPath} modpack --info --name=${name}`;
    return await ShellAPI.execute(command);
  },

  async checkForUpdates() {
    const command = `${cmclPath} --check-for-updates`;
    return await ShellAPI.execute(command);
  },

  async getAboutInfo() {
    const command = `${cmclPath} --about`;
    return await ShellAPI.execute(command);
  }
};