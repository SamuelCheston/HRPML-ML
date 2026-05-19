export const CMCL_CONFIG = {
  cmclPath: process.env.CMCL_PATH || 'cmcl',
  shellApiUrl: process.env.SHELL_API_URL || '/shell.html'
};

export const LAUNCHER_CONFIG = {
  defaultMaxMemory: '4096',
  defaultMinMemory: '2048',
  gameDirectory: process.env.GAME_DIR || '~/.minecraft'
};