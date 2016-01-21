'use strict';

// Overrides
// TODO: Override some of the websocket stuff

var Canvas = require('canvas'),
    jsdom = require('jsdom'),
    path = require('path'),
    nop = require('nop'),
    fs = require('fs'),
    srcPath = path.join('.', 'build.js'),
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

var world = {
    hand: {
        position: () => { return {x: 10, y: 10}}
    },
    keyboardReceiver: null,
    currentKey: null
}

// Class for running routing logic on the server
class TableCore {
    constructor (table) {
        console.log('loading...');
        this.document = jsdom.env('<canvas id="world-container"></canvas>', config, (e, res) => {
            var window = res.window,
                ThreadManager = window.ThreadManager,
                StageMorph = window.StageMorph,
                SpriteMorph = window.SpriteMorph;

            StageMorph.prototype.world = () => {
                return world;
            };

            // Create a stage
            var stage = new StageMorph({}),
                threadmanager = stage.threads,
                scripts = stage.scripts;

            // TODO: Create a websocket manager shim
            // I need the step functionality TODO

            // Add blocks
            // How do I add blocks to the stage? TODO
            // add the child to the scripts morph
            // then call block.justDropped
            // then call scripts.reactToDropOf
            var block = SpriteMorph.prototype.blockForSelector('reportSum', true),
                sum; // TODO

            scripts.add(block);

            // Start process
            window.Process.prototype.reportSum = function(a, b) {
                sum = a + b;
                return +a + (+b);
            };
            threadmanager.startProcess(block, true);  // Get feedback TODO

            // FIXME: make this async
            while (threadmanager.processes.length) {
                threadmanager.step();
            }

            console.log('stage', Object.keys(stage));
            console.log('sum:', sum);
            res.close();
        });
    }

    // How will I ID individual blocks? Scripts on the clients will have to work differently
    // TODO

    // add block
    // TODO

    // remove block
    // TODO

    // setContents of block
    // TODO

    loadBlocks (blocks) {
        // TODO
    }
}

module.exports = TableCore;
