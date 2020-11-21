const crypto = require('crypto');
const webpack = require('webpack');
const multimatch = require("multimatch")
!process.env.PROTECTION_KEY || console.log("Loaded")
class WebpackEncrytpNodejsModule {
  constructor(options, excludes) {
    this.options = options;
    if (!this.options.password) {
      throw new Error('Must provide an password and an envVar in options `{ password: "Your Password" }`');
    }
    this.excludes = [];
    this.excludes = this.excludes.concat(excludes || []);
  }
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    const pluginName = this.constructor.name;
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap({
        name: 'WebpackEncrytpNodejsModule',
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_DERIVED
      }, (assets) => {
        let identifiersPrefixCounter = 0;
        compilation.chunks.forEach(chunk => {
          chunk.files.forEach((fileName) => {
            if (!fileName.toLowerCase().endsWith('.js') || this.shouldExclude(fileName)) {
              return;
            }
            const asset = compilation.assets[fileName];
            const inputSource = this.extractSourceAndSourceMap(asset);
            const obfuscatedSource = this.obfuscate(inputSource, fileName, identifiersPrefixCounter);
            const template =
              `
const crypto = require('crypto');
const path = require('path');
const algorithm = '${this.options.algorithm || 'aes-192-cbc'}';
const keylen = ${this.options.keylen || 24};
const ivlen = ${this.options.ivlen || 16};
const password = Buffer.from(process.env.${this.options.envVar || 'PROTECTION_KEY'},'base64')

const key = crypto.createHash('md5').update(password).digest("hex").substr(0, keylen);
const iv = Buffer.alloc(ivlen, 0)

const encryptedText = Buffer.from('${obfuscatedSource}', 'base64'); ;

const decipher = crypto.createDecipheriv(algorithm, key, iv);
let decrypted = decipher.update(encryptedText);
decrypted = Buffer.concat([decrypted, decipher.final()]);

function requireFromString(src, filename) {
  var Module = module.constructor;
  var paths = Module._nodeModulePaths(path.dirname(filename));
  var parent = module.parent;
  var m = new Module(filename,parent);
  m.filename = filename;
  m.paths = [].concat(paths);
  m._compile(src, filename);
  return m.exports;
}

module.exports = requireFromString(decrypted.toString(),__filename)
`;

            assets[fileName] = new webpack.sources.RawSource(template, false);
            identifiersPrefixCounter++;
          });
        });
      });
    });
  }

  shouldExclude(filePath) {
    return multimatch(filePath, this.excludes).length > 0;
  }

  extractSourceAndSourceMap(asset) {
    if (asset.sourceAndMap) {
      const { source } = asset.sourceAndMap();
      return source;
    }
    else {
      return asset.source();
    }
  }

  obfuscate(javascript, fileName, identifiersPrefixCounter) {
    const algorithm = this.options.algorithm || 'aes-192-cbc';
    const keylen = this.options.keylen || 24;
    const ivlen = this.options.ivlen || 16;
    const password = Buffer.from(this.options.password, 'base64')

    const key = crypto.createHash('md5').update(password).digest("hex").substr(0, keylen);
    const iv = Buffer.alloc(ivlen, 0)

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let decrypted = cipher.update(javascript);
    decrypted = Buffer.concat([decrypted, cipher.final()]);
    // let decrypted = cipher.update(encryptedText, 'utf8', 'base64');
    // decrypted += cipher.final('base64');
    return decrypted.toString('base64')

  }

}

module.exports = WebpackEncrytpNodejsModule;