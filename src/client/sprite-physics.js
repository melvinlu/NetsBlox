/* global SpriteMorph, StageMorph*/
// Sprite support for physics blocks
(function() {
    var ForceBlocks = {
        angularForce: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'apply %clockwise torque of %n',
            defaults: [2000]
        },
        angularForceLeft: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'apply %counterclockwise torque of %n',
            defaults: [2000]
        },
        applyForceForward: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'apply force of %n',
            defaults: [500]
        },
        applyForce: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'apply force %n in direction %dir',
            defaults: [50]
        },
        setMass: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'set mass to %n',
            defaults: [200]
        },
        setGravity: {
            only: SpriteMorph,
            type: 'command',
            category: 'motion',
            spec: 'set gravity to %n',
            defaults: [9.8]
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

    SpriteMorph.prototype.setGravity = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.setGravity(amt);
    };

    SpriteMorph.prototype.applyForce = function(amt, angle) {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.applyForce(this, amt, angle);
    };

    SpriteMorph.prototype.applyForceForward = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.applyForce(this, amt, this.direction());
    };

    SpriteMorph.prototype.mass = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        return stage.physics.getMass(this, amt);
    };

    SpriteMorph.prototype.setMass = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.setMass(this, amt);
    };

    SpriteMorph.prototype.angularForce = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.angularForce(this, amt);
    };

    SpriteMorph.prototype.angularForceLeft = function(amt) {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.angularForceLeft(this, amt);
    };

})(this);
