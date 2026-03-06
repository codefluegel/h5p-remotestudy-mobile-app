import { withDangerousMod, ConfigPlugin } from '@expo/config-plugins';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const withNode18XCodeEnv: ConfigPlugin = modConfig => {
  return withDangerousMod(modConfig, [
    'ios',
    async config => {
      if (process.env.NODE_18_DIR) {
        const { projectRoot } = config.modRequest;

        // Write .xcode.env.local
        const localEnvFilePath = path.join(
          projectRoot,
          'ios',
          '.xcode.env.local',
        );
        await writeFile(
          localEnvFilePath,
          `export PATH=${process.env.NODE_18_DIR}/bin:${process.env.PATH}
export NODE_BINARY=$(command -v node)
`,
        );

        // Override node-binary.sh to use the correct PATH and NODE_BINARY
        // with the default node installation (not node 18)
        const nodeBinaryShPath = path.join(
          projectRoot,
          'node_modules',
          'react-native',
          'scripts',
          'node-binary.sh',
        );

        const existingContent = await readFile(nodeBinaryShPath, 'utf-8');
        const lines = existingContent.split('\n');

        const exports = `#!/bin/bash
# Path exports added by config plugin
export PATH=${process.env.PATH}
export NODE_BINARY=node
`;

        // Skip the first line (shebang) and join the rest
        const restOfFile = lines.slice(1).join('\n');

        await writeFile(nodeBinaryShPath, exports + restOfFile);
      }
      return config;
    },
  ]);
};

export default withNode18XCodeEnv;
