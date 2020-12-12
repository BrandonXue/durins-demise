/**
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * Past Contributors:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * Eddie Huang (edhuang04@csu.fullerton.edu)
 * Ernesto Hooghkirk (Ernesto_Hooghkirk@csu.fullerton.edu)
 * Ryan Martinez (Rmartinez72@csu.fullerton.edu)
 * 
 * Last maintained (YYMMDD): YYMMDD
 * 
 * This file contains code for the Dwarf class, which is a
 * subclass of Phaser.GameObjects.Sprite.
 * 
 * The Dwarf is our main playable character.
 */

class Dwarf extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // Create quick references to important scene objects
        this.sceneTerrainMidGround = this.scene.terrain.midGround;

        // Set initial state
        this.direction = 'right';
        this.wasStationary = true;
        this.canDive = false;
        this.HIT_IMMUNE_DURATION = 60;
        this.hitImmuneCountdown = this.HIT_IMMUNE_DURATION;
        this.attHitBox = null;

        // Pull create cursor keys and pointer refs
        this.createInputRefs();

        // Scale the sprite
        this.setScale(0.8, 0.8);

        // Register self to the scene
        this.scene.add.existing(this);
    }

    /**
     * Pull the parent scene's input references into this object for quick reference.
     */
    createInputRefs() {
        const cursorKeys = this.scene.input.keyboard.createCursorKeys();
        const wasdKeys = this.scene.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D' });
        
        // WASD alternative movement keys
        this.wasdKeysUp = wasdKeys.up;
        this.wasdKeysLeft = wasdKeys.left;
        this.wasdKeysDown = wasdKeys.down;
        this.wasdKeysRight = wasdKeys.right;

        // arrow keys
        this.cursorKeysUp = cursorKeys.up;
        this.cursorKeysLeft = cursorKeys.left;
        this.cursorKeysDown = cursorKeys.down;
        this.cursorKeysRight = cursorKeys.right;

        this.cursorKeysSpace = cursorKeys.space;
        this.cursorKeysShift = cursorKeys.shift;
        
        this.activePointer = this.scene.input.activePointer;
    }

    /**
     * Setter for agility stat. 
     * @param {Number} agility Affects how quickly you can accelerate.
     */
    setAgility(agility) { this.agility = agility; return this; }

    /**
     * Setter for moveSpeed stat. 
     * @param {Number} moveSpeed Affects top speed horizontally.
     */
    setMoveSpeed(moveSpeed) { this.moveSpeed = moveSpeed; return this; }

    /**
     * Setter for jumpHeight stat. 
     * @param {Number} jumpHeight Affects how high you can jump.
     */
    setJumpHeight(jumpHeight) { this.jumpHeight = jumpHeight; return this; }

    /**
     * Setter for diveSpeed stat. 
     * @param {Number} diveSpeed Affects how quickly you can dip down from a jump.
     */
    setDiveSpeed(diveSpeed) { this.diveSpeed = diveSpeed; return this; }

    /**
     * Setter for attackDamage stat. 
     * @param {Number} attackDamage Affects how much damage your attacks do.
     */
    setAttackDamage(attackDamage) { this.attackDamage = attackDamage; return this; }

    /**
     * Setter for attackSpeed stat. 
     * @param {Number} attackSpeed Affects how quickly you can attack again.
     */
    setAttackSpeed(attackSpeed) { this.attackSpeed = attackSpeed; return this; }

    /**
     * Setter for hitPoints stat. If health has not been set, it is initialized to hitPoints.
     * @param {Number} hitPoints Affects how much damage you can take without dying.
     */
    setHitPoints(hitPoints) { 
        this.hitPoints = hitPoints;
        if (this.health === undefined) { this.health = this.hitPoints; }
        return this;
    }

    /**
     * Setter for reach stat.
     * @param {Number} reach Affects how far you can reach for mining and attacking.
     */
    setReach(reach) { this.reach = reach; return this; }

    /**
     * Setter for miningSpeed stat.
     * @param {Number} miningSpeed Affects how quickly you can break blocks.
     */
    setMiningSpeed(miningSpeed) { this.miningSpeed = miningSpeed; return this; }

    /**
     * Configure this object's physics properties.
     * Precondition: The object's stats must be set.
     */
    configPhysics() {
        this.scene.physics.add.existing(this); // Create physics body
        this.body.setSize(15, 18); // Set size of physics body
        this.body.setOffset(9.1, 12); // Offset the hitbox to solve sprite alignment issue

        this.body.setCollideWorldBounds(true, 0, 0);
        this.body.maxVelocity.set(this.moveSpeed * 11, 700); // Set maximum horizontal and vertical velocity
        this.body.setDragX(200);
    }

    /**
     * Take a hit!
     * @param {Number} damage How much health to lose.
     * @param {Number} xPos The x position of the damage source.
     */
    takeHit(damage, xPos=this.x) {
        this.body.velocity.x += (xPos > this.x ? -30 : 30);
        if (this.hitImmuneCountdown == this.HIT_IMMUNE_DURATION) {
            --this.hitImmuneCountdown;
            this.health -= damage;
            if (this.health < 0)
                this.health = 0;
        }
        this.setTint(0xFF9999);
    }

    getHealthRatio() {
        return this.health / this.hitPoints;
    }

    upKeyEquivIsDown() { return this.wasdKeysUp.isDown || this.cursorKeysUp.isDown; }

    leftKeyEquivIsDown() { return this.wasdKeysLeft.isDown || this.cursorKeysLeft.isDown; }

    downKeyEquivIsDown() { return this.wasdKeysDown.isDown || this.cursorKeysDown.isDown; }

    rightKeyEquivIsDown() { return this.wasdKeysRight.isDown || this.cursorKeysRight.isDown; }

    upKeyEquivIsUp() { return this.wasdKeysUp.isUp && this.cursorKeysUp.isUp; }

    leftKeyEquivIsUp() { return this.wasdKeysLeft.isUp && this.cursorKeysLeft.isUp; }

    downKeyEquivIsUp() { return this.wasdKeysDown.isUp && this.cursorKeysDown.isUp; }

    rightKeyEquivIsUp() { return this.wasdKeysRight.isUp && this.cursorKeysRight.isUp; }

    /**
     * Return a cursor position that is within reach
     */
    anchoredCursorPos(anchorDist) {
        const distToPointer = Phaser.Math.Distance.Between(
            this.body.center.x, this.body.center.y,
            this.activePointer.worldX, this.activePointer.worldY
        )
        if (distToPointer <= anchorDist) {
            return [this.activePointer.worldX, this.activePointer.worldY];
        } else {
            let towardsPointer = new Phaser.Math.Vector2(
                this.activePointer.worldX - this.body.center.x,
                this.activePointer.worldY - this.body.center.y
            );
            towardsPointer.setLength(anchorDist);
            return [towardsPointer.x + this.body.center.x, towardsPointer.y + this.body.center.y];
        }
    }

    update() { 
        // When mouse clicked
        if (this.activePointer.primaryDown) {
            const hitboxPos = this.anchoredCursorPos(this.reach / 1.8);
            // If hitbox doesn't exist, make one
            if (this.attHitBox === null) {
                this.attHitBox = this.scene.add.rectangle(hitboxPos[0]-10, hitboxPos[1]-10, 5, 5)
                this.scene.physics.add.existing(this.attHitBox);
                this.attHitBox.body.setAllowGravity(false);
                this.attCollider = this.scene.physics.add.overlap(this.attHitBox, this.scene.zombies, (hitbox, zombie) => {zombie.takeHit(this.attackDamage)});
            } 
            // If hitbox exists, reposition it
            else {
                this.attHitBox.setPosition(hitboxPos[0], hitboxPos[1]);
            }
        }
        // When mouse not clicked and there's a hitbox
        else if (this.attHitBox !== null) {
            // Get rid of it
            this.attHitBox.destroy();
            this.attHitBox = null;
        }

        if (this.hitImmuneCountdown != this.HIT_IMMUNE_DURATION)
            --this.hitImmuneCountdown;
        if (this.hitImmuneCountdown <= 0) {
            this.hitImmuneCountdown = this.HIT_IMMUNE_DURATION;
            this.setTint(0xFFFFFF);
        }

        // If on the floor and spacebar is down, jump
        if (this.upKeyEquivIsDown() && this.downKeyEquivIsUp() && this.body.onFloor()) {
            this.body.setVelocityY(-this.jumpHeight * 17);
            this.canDive = true;
        }
        // Player can dive once per jump
        else if (this.downKeyEquivIsDown() && this.upKeyEquivIsUp() && this.canDive) {
            this.canDive = false;
            this.body.setVelocityY(this.diveSpeed * 8);
        }

        // If left or right are held down, try to accelerate horizontally
        // Acceleration is greater when player is on the ground
        if (this.leftKeyEquivIsDown() && this.rightKeyEquivIsUp()) {
            if (this.wasStationary || this.direction != 'left') {
                this.wasStationary = false;
                this.play('dwarf-move-left');
            }
            this.direction = 'left';
            if (this.body.onFloor()) {
                this.body.setAccelerationX(-this.agility * 90);
            } else {
                this.body.setAccelerationX(-this.agility * 50);
            }
        } else if (this.rightKeyEquivIsDown() && this.leftKeyEquivIsUp()) {
            if (this.wasStationary || this.direction != 'right') {
                this.wasStationary = false;
                this.play('dwarf-move-right');
            }
            this.direction = 'right';
            if (this.body.onFloor()) {
                this.body.setAccelerationX(this.agility * 90);
            } else {
                this.body.setAccelerationX(this.agility * 50);
            }
        } 
        // If neither (left & right) or both (left & right) are held down,
        else {
            // reset horizontal acceleration. Slowdown is more prominent when player is on ground
            this.body.setAccelerationX(0);
            if (this.body.onFloor()) {
                this.body.setVelocity(this.body.velocity.x * 0.9, this.body.velocity.y);
            }

            // If not in motion, set idle animations
            if (this.body.velocity.length() == 0) {
                if (this.wasStationary) { // If this was previously stationary
    
                } else { // Else this was previously in motion
                    this.wasStationary = true;
                    this.play('dwarf-idle-' + this.direction);
                }
            }
        }
    }

    /**
     * Create animations using the scene's AnimationManager.
     * @param {Phaser.Scene} scene 
     */
    static createAnims(scene) {
        scene.anims.create({
            key: 'dwarf-idle-left',
            frames: scene.anims.generateFrameNames('dwarf-idle-left', { start: 0, end: 3, prefix: 'dwarf-idle-left-'}),
            repeat: -1,
            frameRate: 4
        });
        scene.anims.create({
            key: 'dwarf-idle-right',
            frames: scene.anims.generateFrameNames('dwarf-idle-right', { start: 0, end: 3, prefix: 'dwarf-idle-right-'}),
            repeat: -1,
            frameRate: 4
        });
        scene.anims.create({
            key: 'dwarf-move-left',
            frames: scene.anims.generateFrameNames('dwarf-move-left', { start: 0, end: 7, prefix: 'dwarf-move-left-'}),
            repeat: -1,
            frameRate: 12
        });
        scene.anims.create({
            key: 'dwarf-move-right',
            frames: scene.anims.generateFrameNames('dwarf-move-right', { start: 0, end: 7, prefix: 'dwarf-move-right-'}),
            repeat: -1,
            frameRate: 12
        });
    }

    /**
     * Load Atlases using the scene's LoaderPlugin.
     * @param {Phaser.Scene} scene 
     */
    static loadAtlases(scene) {
        // Idle States of Character
        scene.load.atlas(
            'dwarf-idle-left', 'assets/dwarf/left/idle/dwarf-idle-left.png',
            'assets/dwarf/left/idle/dwarf-idle-left.json'
        );
        scene.load.atlas(
            'dwarf-idle-right', 'assets/dwarf/right/idle/dwarf-idle-right.png',
            'assets/dwarf/right/idle/dwarf-idle-right.json'
        );

        // Movement States of Character
        scene.load.atlas(
            'dwarf-move-left', 'assets/dwarf/left/move/dwarf-move-left.png', 
            '/assets/dwarf/left/move/dwarf-move-left.json'
        );
        scene.load.atlas(
            'dwarf-move-right', 'assets/dwarf/right/move/dwarf-move-right.png', 
            'assets/dwarf/right/move/dwarf-move-right.json'
        );
    }
}