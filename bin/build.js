// jshint esnext: true
'use strict';

var concat = require('concat'),
    path = require('path'),
    fs = require('fs'),
    srcPath = path.join(__dirname, '..', 'src', 'client'),
    helpers = require('./helpers'),
    dstPath = path.join(srcPath, 'build.js');

// Get the given js files
var jsFiles = [
    'build-message',
    'map-shim',
    'morphic',
    'locale',
    'widgets',
    'blocks',
    'websockets',
    'threads',
    'messages',
    'netsblox',
    'objects',
    'gui',
    'paint',
    'lists',
    'byob',
    'xml',
    'store',
    'cloud',
    'sha512',
    'message-inputs',
    'message-listeners',
    'table',
    'table-scripts'
].map(name => path.join(srcPath, name + '.js'));

// TODO: Add uglify, etc
concat(jsFiles, dstPath, function(err) {
    if (err) {
        return console.log('Error!', err);
    }
    console.log('Finished building build.js');
});

var devFiles = [
    path.join(__dirname, '..', 'src', 'virtual-client', 'virtual-helpers.js'),
    path.join(__dirname, '..', 'src', 'virtual-client', 'phantomjs-shim.js')
];

concat(jsFiles.concat(devFiles), path.join(srcPath, 'build-dev.js'), function(err) {
    console.log('Finished building build-dev.js');
});

// TableCore stuff
var oldSrc = fs.readFileSync(dstPath, 'utf8'),
    code,
    publicVars,
    dst = path.join(__dirname, '..', 'src', 'snap-engine', 'build.js'),
    shims = fs.readFileSync(path.join(srcPath, '..', 'snap-engine', 'shims.js'), 'utf8');

// Add jsdom shims to oldSrc
oldSrc += shims;

publicVars = [
    'StageMorph',
    'SnapSerializer'
];
code = helpers.createSIF(oldSrc, publicVars);
fs.writeFileSync(dst, code);
