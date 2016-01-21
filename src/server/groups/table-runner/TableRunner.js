'use strict';

var Canvas = require('canvas'),
    jsdom = require('jsdom'),
    path = require('path'),
    nop = require('nop'),
    fs = require('fs'),
    clientDir = path.join(__dirname, '..', '..', '..', 'client'),
    indexPath = path.join(clientDir, 'netsblox-dev.html'),
    html = fs.readFileSync(indexPath, 'utf8'),
    srcPath = path.join(clientDir, 'build-dev.js'),
    //srcPath = path.join('.', 'morphic.js'),
    src,
    config;

// hacking to fix bugs with jsdom and canvas
Canvas.Context2d.prototype.drawImage = nop;

src = fs.readFileSync(srcPath, 'utf8');

// Prepend the source code to the html
config = {
    src: [src],
    virtualConsole: jsdom.createVirtualConsole().sendTo(console),
    resourceLoader: (res, cb) => {
        cb(null, src);
    }
};

// Class for running routing logic on the server
class TableRunner {
    constructor (table) {
        this.table = table;  // active table
        this.document = jsdom.env(html, config, (e, res) => {
            var window = res.window,
                WorldMorph = window.WorldMorph;

            console.log('window.IDE_Morph', window.IDE_Morph);
            var world = new WorldMorph(window.document.getElementById('world-container'));
            world.worldCanvas.focus();
            //var ide = new window.IDE_Morph().openIn(world);
            console.log('world', window.world);
            res.close();
        });
        //this.document = jsdom.jsdom(html, config);//, this.onLoad.bind(this));
        //var window = this.document.defaultView;
        //console.log('about to set onload');
        //this.document.onload = (err, res) => {
            //console.log('loaded!');
            //console.log('\n\nerr', err);
            //console.log('window:', window);
            ////console.log('window.world', window.world);
            ////console.log('window.onload', window.onload);
            ////console.log('Object.keys(window)', Object.keys(window));
            ////console.log('Object.keys(window.window)', Object.keys(window.window));
            ////this.onLoad(null, window);
        //};
    }

    onLoad (err, window) {
        console.log('calling onLoad');
        console.log('window.window', typeof window.window);
        console.log('window.window.WorldMorph', typeof window.window.WorldMorph);

        var global = window.window,
            world,
            ide;

        console.log('creating world');
        console.log('Object.keys(window)', Object.keys(window));
        console.log('window.WorldMorph', window.WorldMorph);
        window.eval(src);  // yuck
        //world = new WorldMorph(window.document.getElementById('world-container'));
        //console.log('world', world);
        //world.worldCanvas.focus();
        //new IDE_Morph().openIn(world);
        //setInterval(loop, 1);

        //function loop() {
            //world.doOneCycle();
        //}
    }

    // TODO: Save functionality
}

module.exports = TableRunner;
