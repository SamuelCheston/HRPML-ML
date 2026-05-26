export interface CMCLConfig {
  cmclPath: string;
  cmclJsonPath: string;
  shellApiUrl: string;
}

export interface LauncherConfig {
  defaultMaxMemory: string;
  defaultMinMemory: string;
  gameDirectory: string;
}

export const CMCL_CONFIG: CMCLConfig = {
  cmclPath: process.env.CMCL_PATH || 'java -jar ./cmcl.jar',
  cmclJsonPath: process.env.CMCL_JSON_PATH || (process.platform === 'win32' ? './cmcl.json' : '~/.config/cmcl/cmcl.json'),
  shellApiUrl: process.env.SHELL_API_URL || 'http://localhost:34501'
};

export const LAUNCHER_CONFIG: LauncherConfig = {
  defaultMaxMemory: '4096',
  defaultMinMemory: '2048',
  gameDirectory: process.env.GAME_DIR || '~/.minecraft'
};
