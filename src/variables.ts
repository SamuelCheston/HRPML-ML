export interface CMCLConfig {
  cmclPath: string;
  shellApiUrl: string;
}

export interface LauncherConfig {
  defaultMaxMemory: string;
  defaultMinMemory: string;
  gameDirectory: string;
}

export const CMCL_CONFIG: CMCLConfig = {
  cmclPath: process.env.CMCL_PATH || 'cmcl',
  shellApiUrl: process.env.SHELL_API_URL || './shell.html'
};

export const LAUNCHER_CONFIG: LauncherConfig = {
  defaultMaxMemory: '4096',
  defaultMinMemory: '2048',
  gameDirectory: process.env.GAME_DIR || '~/.minecraft'
};
