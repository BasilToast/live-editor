const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { 
    addDecoratorsLegacy, 
    disableEsLint, 
    addBabelPlugins,
    addWebpackPlugin,
    override 
} = require("customize-cra");


module.exports =  override(
    addWebpackPlugin(
        new MonacoWebpackPlugin({
            languages: ['javascript', 'typescript']
       })
    )
)