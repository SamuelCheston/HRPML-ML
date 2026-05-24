import { LAUNCHER_CONFIG } from '../variables';

const CONFIG_FILE = 'smcl.json';

export interface ConfigData {
  authlibAddress?: string;
  maxMemory?: string;
  minMemory?: string;
  gameDirectory?: string;
  [key: string]: unknown;
}

const defaultConfig: ConfigData = {
  authlibAddress: 'https://backend.auth.samuelcheston.com',
  maxMemory: LAUNCHER_CONFIG.defaultMaxMemory,
  minMemory: LAUNCHER_CONFIG.defaultMinMemory,
  gameDirectory: LAUNCHER_CONFIG.gameDirectory,
};

export const ConfigAPI = {
  async readConfig(): Promise<ConfigData> {
    try {
      const stored = localStorage.getItem(CONFIG_FILE);
      if (stored) {
        return JSON.parse(stored);
      }
      await this.writeConfig(defaultConfig);
      return { ...defaultConfig };
    } catch {
      return { ...defaultConfig };
    }
  },

  async writeConfig(config: ConfigData): Promise<void> {
    try {
      localStorage.setItem(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to write config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getConfig(key: string): Promise<unknown> {
    const config = await this.readConfig();
    return config[key];
  },

  async setConfig(key: string, value: unknown): Promise<void> {
    const config = await this.readConfig();
    config[key] = value;
    await this.writeConfig(config);
  },

  async deleteConfig(key: string): Promise<void> {
    const config = await this.readConfig();
    delete config[key];
    await this.writeConfig(config);
  },

  async clearConfig(): Promise<void> {
    localStorage.removeItem(CONFIG_FILE);
  },

  async resetToDefaults(): Promise<void> {
    await this.writeConfig({ ...defaultConfig });
  },
};