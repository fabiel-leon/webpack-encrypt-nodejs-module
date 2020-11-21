/* 
enter in a node shell
and load this module
> node
> require('./test/testModuleRequire')
*/
// console.log(arguments)
console.log(Object.keys(module), module, __filename, module.constructor._nodeModulePaths)