/* global p2, Point, Morph, SpriteMorph, radians, StageMorph, IDE_Morph, degrees */
// This file defines the physics engine that is used in netsblox.
// That is, this is the netsblox object that interfaces with the
// stage and the matterjs physics engine
(function(globals) {
    'use strict';
    var World = p2.World,
        CLONE_ID = 0;

    var PhysicsEngine = function() {
        this.world = new World({
            gravity: [0 ,0]
        });
        this.sprites = {};
        this.clones = {};
        this.bodies = {};
        this.ground = null;

        this.enableGround();
        this.fixedStepSize = 1/60;
        this.lastUpdated = Date.now()/100;
        this.lastDelta = 0;
    };

    PhysicsEngine.prototype.step = function() {
        var time = Date.now()/100,  // TODO: Fix the interval...
            delta = time - this.lastUpdated;

        this.world.step(this.fixedStepSize, delta);

        this.lastUpdated = time;
        this.updateUI();
    };

    PhysicsEngine.prototype.enableGround = function() {
        this.ground = new p2.Body({
            mass: 0,
            position: [0, 180]
        });

        var shape = new p2.Box({
            width: 5000,
            height: 1
        });

        this.ground.addShape(shape);
        this.world.addBody(this.ground);
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
            oldY,
            angle,
            direction;

        if (!sprite.isPickedUp()) {
            point = body.position;
            newX = point[0];
            newY = -point[1];  // engine is inverted; stage is not

            oldX = sprite.xPosition();
            oldY = sprite.yPosition();

            // Set the center and rotation for each sprite
            if (newX !== oldX || newY !== oldY) {
                sprite._gotoXY(newX, newY);
            }

            // Set the rotation for each sprite
            angle = body.angle % (2 * Math.PI);
            if (angle < 0) {
                angle += 2 * Math.PI;
            }
            direction = degrees(angle);
            if (this.round(sprite.direction(), 2) !== this.round(direction, 2)) {
                sprite.silentSetHeading(direction);
            }
        }
    };

    PhysicsEngine.prototype.round = function(num, places) {
        places = places || 0;
        var mult = Math.pow(10, places);
        return Math.round(num * mult)/mult;
    };

    SpriteMorph.prototype.silentSetHeading = function(degrees) {
        // Bypass any position setting in the physics engine
        var x = this.xPosition(),
            y = this.yPosition(),
            dir = (+degrees || 0),
            turn = dir - this.heading;

        // apply to myself
        if (this.rotationStyle) {  // optimization, only redraw if rotatable
            this.changed();
            SpriteMorph.uber.setHeading.call(this, dir);

            var penState = this.isDown;
            this.isDown = false;
            this._gotoXY(x, y, true);  // just me
            this.isDown = penState;
            this.positionTalkBubble();
        } else {
            this.heading = parseFloat(degrees) % 360;
        }

        // propagate to my parts
        this.parts.forEach(function (part) {
            var pos = new Point(part.xPosition(), part.yPosition()),
                trg = pos.rotateBy(radians(turn), new Point(x, y));
            if (part.rotatesWithAnchor) {
                part.turn(turn);
            }
            part._gotoXY(trg.x, trg.y);
        });
    };

    SpriteMorph.prototype._setHeading = SpriteMorph.prototype.setHeading;
    SpriteMorph.prototype.setHeading = function(degrees) {
        var stage = this.parentThatIsA(StageMorph);
        // Update the physics engine
        stage.physics.setDirection(this, degrees);
    };

    PhysicsEngine.prototype.setDirection = function(sprite, degrees) {
        var name = this._getSpriteName(sprite),
            body = this.bodies[name];
        body.angle = radians(degrees);
    };

    PhysicsEngine.prototype.addSprite = function(sprite) {
        var x = sprite.xPosition(),
            y = -sprite.yPosition(),  // engine is inverted; stage is not
            // TODO: Make this shape match the costume...
            // TODO: Set the mass to a reasonable amount
            shape = this.getShape(sprite),
            body = new p2.Body({
                mass: 5,
                position: [x, y]
            }),
            name = this._getSpriteName(sprite);

        body.addShape(shape);
        if (sprite.isClone) {
            // Create a unique id for the sprite
            name = this._getCloneName();
            this.clones[name] = sprite;
        }

        if (this.bodies[name]) {
            this.world.removeBody(this.bodies[name]);
        }

        this.sprites[name] = sprite;
        this.bodies[name] = body;

        this.world.addBody(body);
    };

    PhysicsEngine.prototype.getShape = function(sprite) {
        var cxt = sprite.image.getContext('2d'),
            width = sprite.image.width,
            height = sprite.image.height,
            data = cxt.getImageData(1, 1, width, height).data,
            granularity = 5,
            vertices = [],
            shape,
            row = 0,
            col = 0,
            index,
            isEmpty;

        // Get the left most points for every row of pixels
        while (row < height) {

            // get the first non-zero column
            col = -1;
            isEmpty = true;
            while (col < width && isEmpty) {
                col++;
                index = row*width*4 + col*4;
                isEmpty = !(data[index] + data[index+1] + data[index+2] + data[index+3]);
            }
            if (!isEmpty) {
                vertices.unshift([col, row]);
            }

            row += granularity;
        }

        // Get the right most points for every row of pixels
        row = height - 1;
        while (row > 0) {

            // get the last non-zero place
            col = width;
            isEmpty = true;
            while (col > 0 && isEmpty) {
                col--;
                index = row*width*4 + col*4;
                isEmpty = !(data[index] + data[index+1] + data[index+2] + data[index+3]);
            }
            if (!isEmpty) {
                vertices.unshift([col, row]);
            }

            row -= granularity;
        }

        // Create a custom shape from this
        shape = new p2.Convex({
            vertices: vertices
        });

        return shape;
    };

    PhysicsEngine.prototype.removeSprite = function(sprite) {
        var name = this._getSpriteName(sprite);

        // remove clone if necessary
        if (this.sprites[name].isClone) {
            delete this.clones[name];
        }

        this.world.removeBody(this.bodies[name]);
        delete this.bodies[name];
        delete this.sprites[name];
    };

    PhysicsEngine.prototype._getCloneName = function(/*sprite*/) {
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

    PhysicsEngine.prototype.updateSpriteName = function(oldName, newName) {
        this.bodies[newName] = this.bodies[oldName];
        delete this.bodies[oldName];

        this.sprites[newName] = this.sprites[oldName];
        delete this.sprites[oldName];
    };


    PhysicsEngine.prototype.setPosition = function(sprite, x, y) {
        var name = this._getSpriteName(sprite),
            body = this.bodies[name];
        body.position = [x, -y];
    };

    PhysicsEngine.prototype.applyForce = function(sprite, amt, angle) {
        var name = this._getSpriteName(sprite),
            body = this.bodies[name],
            rads;

        angle = -angle + 90;  // correct angle
        rads = radians(angle);
        // Get the direction
        body.applyForce([amt*Math.cos(rads), -amt*Math.sin(rads)]);
    };

    PhysicsEngine.prototype.setGravity = function(amt) {
        if (amt === 0 && this.ground) {
            this.world.removeBody(this.ground);
            this.ground = null;
        } else if (!this.ground){
            this.enableGround();
        }
        this.world.gravity = [0, amt];
    };

    PhysicsEngine.prototype.setMass = function(sprite, amt) {
        var name = this._getSpriteName(sprite),
            body = this.bodies[name];

        body.mass = +amt;
        body.updateMassProperties();
    };

    PhysicsEngine.prototype.getMass = function(sprite) {
        var name = this._getSpriteName(sprite);
        return this.bodies[name].mass;
    };

    PhysicsEngine.prototype.angularForce = function(sprite, amt) {
        var name = this._getSpriteName(sprite),
            body = this.bodies[name];
        body.angularForce += +amt;
    };

    PhysicsEngine.prototype.angularForceLeft = function(sprite, amt) {
        var name = this._getSpriteName(sprite),
            body = this.bodies[name];
        body.angularForce += -amt;
    };

    globals.PhysicsEngine = PhysicsEngine;

    // Overrides for the PhysicsEngine
    SpriteMorph.prototype._setName = SpriteMorph.prototype.setName;
    SpriteMorph.prototype.setName = function(name) {
        var oldName = this.name,
            stage = this.parentThatIsA(StageMorph);

        this._setName(name);

        // Update the PhysicsEngine
        stage.physics.updateSpriteName(oldName, name);
    };

    SpriteMorph.prototype._gotoXY = SpriteMorph.prototype.gotoXY;
    SpriteMorph.prototype.gotoXY = function(x, y, justMe) {
        // Update the position of the object in the physics engine
        var stage = this.parentThatIsA(StageMorph);

        stage.physics.setPosition(this, x, y);
        this._gotoXY(x, y, justMe);
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

    //StageMorph.prototype.remove = function([>morph<]) {
        //// TODO
    //};

    var superFn = SpriteMorph.prototype.setPosition;
    SpriteMorph.prototype.setPosition = function(pos) {
        superFn.call(this, pos);
        // Update the physics engine
        // TODO
    };

})(this);
