/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
const tsConfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');
const path = require('path');

const baseUrl = path.join(
  tsConfig.compilerOptions.outDir,
  tsConfig.compilerOptions.baseUrl,
); // Either absolute or relative path. If relative it's resolved to current working directory.
return tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});
