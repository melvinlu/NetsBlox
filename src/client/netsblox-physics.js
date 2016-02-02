// This file defines the physics engine that is used in netsblox.
// That is, this is the netsblox object that interfaces with the
// stage and the matterjs physics engine
(function(globals) {
    'use strict';
    var Engine = Matter.Engine,
        World = Matter.World,
        Body = Matter.Body,
        Bodies = Matter.Bodies;

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
        this.bodies = {};

        // Add the ground
        var width = 40,
            x = stage.dimensions.x,
            ground = Bodies.rectangle(0, (x-width)/2, 800, width, {isStatic: true});

        World.add(this.engine.world, [ground]);
    };

    PhysicsEngine.prototype.step = function() {
        Engine.update(this.engine, 1000/60, 0.9);
        this.updateUI();
    };

    PhysicsEngine.prototype.updateUI = function() {
        var names = Object.keys(this.bodies),
            sprite,
            oldX,
            newX,
            oldY,
            newY,
            point;

        for (var i = names.length; i--;) {
            sprite = this.sprites[names[i]];
            if (!sprite.isPickedUp()) {
                point = this.bodies[names[i]].position;
                newX = point.x;
                newY = -point.y;  // engine is inverted; stage is not

                point = sprite.center();
                oldX = point.x;
                oldY = point.y;

                // Set the center and rotation for each sprite
                if (newX !== oldX || newY !== oldY) {
                    sprite.gotoXY(newX, newY);
                }

                // Set the rotation for each sprite
                // TODO
            }
        }
    };

    PhysicsEngine.prototype.addSprite = function(sprite) {
        var x = sprite.xPosition(),
            y = -sprite.yPosition(),  // engine is inverted; stage is not
            width = sprite.width(),
            height = sprite.height(),
            box = Bodies.rectangle(x, y, width, height, {mass: 200});

        if (this.bodies[sprite.name]) {
            World.remove(this.engine.world, this.bodies[sprite.name]);
        }

        this.sprites[sprite.name] = sprite;
        this.bodies[sprite.name] = box;
        World.add(this.engine.world, [box]);
    };

    PhysicsEngine.prototype.verticalForce = function(name, amt) {
        // What are the units of amt?
        // TODO
        var pt = this.bodies[name].position;
        Body.applyForce(this.bodies[name], pt, {x: 0, y: -amt});
    };

    PhysicsEngine.prototype.horizontalForce = function(name, amt) {
        // What are the units of amt?
        // TODO
        var pt = this.bodies[name].position;
        Body.applyForce(this.bodies[name], pt, {x: +amt, y: 0});
    };

    PhysicsEngine.prototype.setMass = function(name, amt) {
        Body.setMass(this.bodies[name], +amt);
    };

    PhysicsEngine.prototype.getMass = function(name) {
        return this.bodies[name].mass;
    };

    globals.PhysicsEngine = PhysicsEngine;

    // Overrides for the PhysicsEngine
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
