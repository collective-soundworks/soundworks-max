import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/max-client.js'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'esnext',
  external: ['max-api'],
  banner: {
    js: `\
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
    `,
  },
  outfile: 'max/soundworks/javascript/soundworks.shared-state.mjs',
});
