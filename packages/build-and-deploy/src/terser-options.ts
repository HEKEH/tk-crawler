// terserOptions
export const CommonTerserOptions = {
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: [
      'console.log',
      'console.info',
      'console.debug',
      'console.warn',
    ],
    passes: 2,
    dead_code: true,
  },
  mangle: {
    toplevel: true,
  },
  format: {
    comments: false,
    ascii_only: true,
  },
};
