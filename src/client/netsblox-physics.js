// This file defines the physics engine that is used in netsblox.
// That is, this is the netsblox object that interfaces with the
// stage and the matterjs physics engine
(function(globals) {
    'use strict';
    var Engine = Matter.Engine,
        World = Matter.World,
        Body = Matter.Body,
        Bodies = Matter.Bodies,
        CLONE_ID = 0;

    // This is a renderer for matter.js and netsblox
    var Renderer = {
        create: function() {
            return {controller: Renderer};
        },

        world: function(engine) {
            // your code to render engine.world
            console.log('rendering...');
        }
    };

    var PhysicsEngine = function(stage) {
        this.world = World.create({gravity: {x: 0, y: 0, scale: 0}});
        this.engine = Engine.create({
            render: {
                controller: Renderer
            }
        });
        this.engine.world = this.world;
        this.sprites = {};
        this.clones = {};
        this.bodies = {};

        // Add the ground
        var width = stage.dimensions.x,
            height = stage.dimensions.y,
            maxX = width/2,
            maxY = height/2,
            borderSettings = {
                isStatic: true,
                restitution: 0
            },
            bottom = Bodies.rectangle(0, -height/2-maxY, width, height, borderSettings),
            top = Bodies.rectangle(0, maxY+height/2, width, height, borderSettings);
            var left = Bodies.rectangle(-width/2-maxX, 0, width, height, borderSettings),
            right = Bodies.rectangle(maxX+width/2, 0, width, height, borderSettings);

        console.log('left/right at: ' + maxX);
        console.log('top/bottom at: ' + maxY);
        World.add(this.engine.world, [top, bottom, left, right]);

        this.lastUpdated = Date.now();
        this.lastDelta = 0;

        // Debugging
        Matter.Events.on(this.engine, 'collisionStart', function(event) {
            console.log('collision!');
        });
    };

    PhysicsEngine.prototype.step = function() {
        var time = Date.now(),
            delta = time - this.lastUpdated;

        Engine.update(this.engine, delta, 1 || delta/this.lastDelta);

        this.lastUpdated = time;
        this.lastDelta = delta;
        this.updateUI();
    };

    PhysicsEngine.prototype.updateUI = function() {
        var names = Object.keys(this.sprites);

        for (var i = names.length; i--;) {
            this._updateSpritePosition(this.sprites[names[i]], this.bodies[names[i]]);
            //this._updateSpriteDirection(this.sprites[names[i]], this.bodies[names[i]]);
            // TODO
        }

        // Update positions for each clone
        names = Object.keys(this.clones);
        // TODO
    };

    PhysicsEngine.prototype._updateSpritePosition = function(sprite, body) {
        var point,
            newX,
            newY,
            oldX,
            oldY;

        if (!sprite.isPickedUp()) {
            point = body.position;
            newX = point.x;
            newY = -point.y;  // engine is inverted; stage is not

            oldX = sprite.xPosition();
            oldY = sprite.yPosition();

            // Set the center and rotation for each sprite
            if (newX !== oldX || newY !== oldY) {
                //console.log('x: ' + oldX + ' -> ' + newX);
                //console.log('y: ' + oldY + ' -> ' + newY);
                sprite._gotoXY(newX, newY);
            }

            // Set the rotation for each sprite
            // TODO
        }
    };

    PhysicsEngine.prototype.addSprite = function(sprite) {
        var x = sprite.xPosition(),
            y = -sprite.yPosition(),  // engine is inverted; stage is not
            width = sprite.width(),
            height = sprite.height(),
            // TODO: Make this shape match the costume...
            box = Bodies.rectangle(x, y, width, height, {
                mass: 2000,
                restitution: 0
            }),
            name = this._getSpriteName(sprite);

        console.log('adding rect: ', x, y, width, height + ' (' + name + ')');
        if (sprite.isClone) {
            // Create a unique id for the sprite
            name = this._getCloneName();
            this.clones[name] = sprite;
        }

        if (this.bodies[name]) {
            console.log('removing ' + name);
            World.remove(this.engine.world, this.bodies[name]);
        }

        this.sprites[name] = sprite;
        this.bodies[name] = box;
        World.add(this.engine.world, [box]);
    };

    PhysicsEngine.prototype.removeSprite = function(sprite) {
        var name = this._getSpriteName(sprite);
        console.log('removing ' + name);

        // remove clone if necessary
        if (this.sprites[name].isClone) {
            delete this.clones[name];
        }

        console.log('removing ' + name);
        World.remove(this.engine.world, this.bodies[name]);
        delete this.bodies[name];
        delete this.sprites[name];
    }

    PhysicsEngine.prototype._getCloneName = function(sprite) {
        return '__clone__' + (++CLONE_ID);
    };

    PhysicsEngine.prototype._getSpriteName = function(sprite) {
        if (!sprite.isClone) {
            return sprite.name;
        }
        // Compare to the values in the clones list
        // ... if only js supported non-hash maps
        var names = Object.keys(this.clones);
        for (var i = names.length; i--;) {
            if (this.clones[names[i]] === sprite) {
                return names[i];
            }
        }
        return null;
    };

    PhysicsEngine.prototype.setPosition = function(sprite, x, y) {
        var name = this._getSpriteName(sprite);
        console.log('setting position to ' + x + ', ' + y + ' (' + name + ')');
        Body.setPosition(this.bodies[name], {x:x, y:y});
    };

    PhysicsEngine.prototype.verticalForce = function(sprite, amt) {
        // What are the units of amt?
        // TODO
        var name = this._getSpriteName(sprite),
            pt = this.bodies[name].position;
        console.log('applying force of ' + amt);
        Body.applyForce(this.bodies[name], pt, {x: 0, y: -amt});
    };

    PhysicsEngine.prototype.horizontalForce = function(sprite, amt) {
        // What are the units of amt?
        // TODO
        var name = this._getSpriteName(sprite),
            pt = this.bodies[name].position;

        console.log('applying horizontal force of ' + amt);
        Body.applyForce(this.bodies[name], pt, {x: +amt, y: 0});
    };

    PhysicsEngine.prototype.setMass = function(sprite, amt) {
        var name = this._getSpriteName(sprite);
        console.log('setting mass to ' + amt);
        Body.setMass(this.bodies[name], +amt);
    };

    PhysicsEngine.prototype.getMass = function(sprite) {
        var name = this._getSpriteName(sprite);
        return this.bodies[name].mass;
    };

    PhysicsEngine.prototype.angularForce = function(sprite, amt) {
        var name = this._getSpriteName(sprite);
        console.log('setting angular velocity to ' + amt);
        Body.setAngularVelocity(this.bodies[name], +amt);
    };

    PhysicsEngine.prototype.angularForceLeft = function(sprite, amt) {
        var name = this._getSpriteName(sprite);
        console.log('setting angular velocity to ' + (-amt));
        Body.setAngularVelocity(this.bodies[name], -amt);
    };

    globals.PhysicsEngine = PhysicsEngine;

    // Overrides for the PhysicsEngine
    SpriteMorph.prototype._gotoXY = SpriteMorph.prototype.gotoXY;
    SpriteMorph.prototype.gotoXY = function(x, y, justMe) {
        // Update the position of the object in the physics engine
        var stage = this.parentThatIsA(StageMorph);

        stage.physics.setPosition(this, x, y);
        this._gotoXY.call(this, x, y, justMe);
    };

    IDE_Morph.prototype._removeSprite = IDE_Morph.prototype.removeSprite;
    IDE_Morph.prototype.removeSprite = function(sprite) {
        this.stage.physics.removeSprite(sprite);
        this._removeSprite.call(this, sprite);
    };

    SpriteMorph.prototype._removeClone = SpriteMorph.prototype.removeClone;
    SpriteMorph.prototype.removeClone = function() {
        var stage = this.parentThatIsA(StageMorph);
        stage.physics.removeSprite(this);
        this._removeClone.call(this);
    };


    var oldStep = StageMorph.prototype.step;
    StageMorph.prototype.step = function() {
        oldStep.call(this);
        this.physics.step();
    };

    StageMorph.prototype.add = function(morph) {
        Morph.prototype.add.call(this, morph);
        if (morph instanceof SpriteMorph) {
            this.physics.addSprite(morph);
        }
    };

    StageMorph.prototype.remove = function(morph) {
        // TODO
    };

    var superFn = SpriteMorph.prototype.setPosition;
    SpriteMorph.prototype.setPosition = function(pos) {
        superFn.call(this, pos);
        // Update the physics engine
        // TODO
    };

})(this);
