// Sprite support for physics blocks
(function(global) {
    var ForceBlocks = {
        verticalForce: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'apply vertical force of %n',
            defaults: [10]
        },
        horizontalForce: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'apply horizontal force of %n',
            defaults: [10]
        },
        setMass: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'set mass to %n',
            defaults: [200]
        },
        mass: {
            only: SpriteMorph,
            type: 'reporter',
            category: 'motion',
            spec: 'mass'
        }
    };

    var superInit = SpriteMorph.prototype.initBlocks;
    SpriteMorph.prototype.initBlocks = function() {
        superInit.call(this);
        // Add force blocks
        var names = Object.keys(ForceBlocks);
        names.forEach(function(name) {
            SpriteMorph.prototype.blocks[name] = ForceBlocks[name];
        });
    };

    SpriteMorph.prototype.verticalForce = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        if (!stage) {
            console.error('verticalForce has no stage ref!');
        }
        stage.physics.verticalForce(this.name, amt);
    };

    SpriteMorph.prototype.horizontalForce = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        if (!stage) {
            console.error('horizontalForce has no stage ref!');
        }
        stage.physics.horizontalForce(this.name, amt);
    };

    SpriteMorph.prototype.mass = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        if (!stage) {
            console.error('getMass has no stage ref!');
        }
        return stage.physics.getMass(this.name, amt);
    };

    SpriteMorph.prototype.setMass = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        if (!stage) {
            console.error('setMass has no stage ref!');
        }
        stage.physics.setMass(this.name, amt);
    };

})(this);
