//jshint node: true
'use strict';

// Overrides
// TODO: Override some of the websocket stuff

var Canvas = require('canvas'),
    jsdom = require('jsdom'),
    path = require('path'),
    nop = require('nop'),
    fs = require('fs'),
    srcPath = path.join(__dirname, 'build.js'),
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
        position: () => { return {x: 10, y: 10}; }
    },
    keyboardReceiver: null,
    currentKey: null
};

// Class for running routing logic on the server
class TableCore {
    constructor (logger) {
        this._logger = logger.fork('TableCore');
        this._ready = false;
        this._readyQueue = [];
        this.serializer = null;

        this.document = jsdom.env('<canvas id="world-container"></canvas>', config, (e, res) => {
            var window = res.window,
                StageMorph = window.StageMorph,
                SnapSerializer = window.SnapSerializer;

            StageMorph.prototype.world = () => {
                return world;
            };

            // Create a stage
            var stage = new StageMorph({});

            this._ready = true;
            this.scripts = stage.scripts;
            this.serializer = new SnapSerializer();
            this.threads = stage.threads;
            this.startProcessor(this);
            for (var i = this._readyQueue.length; i--;) {
                this._readyQueue[i].call(this);
            }

            // TODO: Create a websocket manager shim
            // I need the step functionality TODO

            // Add blocks
            // How do I add blocks to the stage? TODO
            // add the child to the scripts morph
            // then call block.justDropped
            // then call scripts.reactToDropOf
            //var block = SpriteMorph.prototype.blockForSelector('reportSum', true),
                //sum; // TODO

            //scripts.add(block);

            //// Start process
            //window.Process.prototype.reportSum = function(a, b) {
                //sum = a + b;
                //return +a + (+b);
            //};
            //threadmanager.startProcess(block, true);  // Get feedback TODO

            res.close();
        });
    }

    startProcessor (self) {
        self.threads.step();
        setTimeout(self.startProcessor, 100, self);
    }

    onMessage (type, content) {
        this._logger.trace(`received ${type} message`);
        if (TableCore.MessageHandlers[type]) {
            var fn = TableCore.MessageHandlers[type].bind(this, content);
            this.onReady(fn);
        } else {
            this._logger.warn(`"${type}" not recognized message type`);
        }
    }

    onReady (fn) {  // handles asynchronicity
        if (this._ready) {
            fn();
        } else {
            this._readyQueue.push(fn);
        }
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

TableCore.MessageHandlers = {
    new: (content) => {
        var block = this.serializer.loadBlock(content);
        this.scripts.add(block/*, isReporter*/);
        this._logger.trace('children are now: ' + JSON.stringify(this.scripts.children));
    }
};

module.exports = TableCore;
