/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/4
 */
'use strict'

const loaderUtils = require('loader-utils')
const path = require('path')

module.exports = function getLocalIdent(context, localIdentName, localName, options) {
    const fileNameOrFolder = context.resourcePath.match(/index\.module\.(css|scss|sass)$/)
        ? '[folder]'
        : '[name]'
    const hash = loaderUtils.getHashDigest(
        path.posix.relative(context.rootContext, context.resourcePath) + localName,
        'md5',
        'base64',
        5,
    )

    const className = loaderUtils.interpolateName(
        context,
        fileNameOrFolder + '_' + localName + '__' + hash,
        options,
    )

    return className.replace('.module_', '_')
}
