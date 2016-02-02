// Sprite support for physics blocks
(function(global) {
    var ForceBlocks = {
        angularForce: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'apply %clockwise force of %n',
            defaults: [10]
        },
        angularForceLeft: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'apply %counterclockwise force of %n',
            defaults: [10]
        },
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
        stage.physics.verticalForce(this.name, amt);
    };

    SpriteMorph.prototype.horizontalForce = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.horizontalForce(this.name, amt);
    };

    SpriteMorph.prototype.mass = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        return stage.physics.getMass(this.name, amt);
    };

    SpriteMorph.prototype.setMass = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.setMass(this.name, amt);
    };

    SpriteMorph.prototype.angularForce = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        console.log('force...' + amt);
        stage.physics.angularForce(this.name, amt);
    };

    SpriteMorph.prototype.angularForceLeft = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.angularForceLeft(this.name, amt);
    };

})(this);
