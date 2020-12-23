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

import Phaser from '../../phaser';

import dwarfIdleLeftPng from '../../../assets/dwarf/left/idle/dwarf-idle-left.png';
import dwarfIdleLeftJson from '../../../assets/dwarf/left/idle/dwarf-idle-left.json';
import dwarfIdleRightPng from '../../../assets/dwarf/right/idle/dwarf-idle-right.png';
import dwarfIdleRightJson from '../../../assets/dwarf/right/idle/dwarf-idle-right.json';
import dwarfMoveLeftPng from '../../../assets/dwarf/left/move/dwarf-move-left.png';
import dwarfMoveLeftJson from '../../../assets/dwarf/left/move/dwarf-move-left.json';
import dwarfMoveRightPng from '../../../assets/dwarf/right/move/dwarf-move-right.png';
import dwarfMoveRightJson from '../../../assets/dwarf/right/move/dwarf-move-right.json';
import dwarfSwipeLeftPng from '../../../assets/dwarf/left/swipe/dwarf-swipe-left.png';
import dwarfSwipeLeftJson from '../../../assets/dwarf/left/swipe/dwarf-swipe-left.json';
import dwarfSwipeRightPng from '../../../assets/dwarf/right/swipe/dwarf-swipe-right.png';
import dwarfSwipeRightJson from '../../../assets/dwarf/right/swipe/dwarf-swipe-right.json';

class Dwarf extends Phaser.GameObjects.Sprite {
    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {CooldownPlugin} cooldownPlugin
     */
    constructor(scene, x, y, cooldownPlugin) {
        super(scene, x, y);

        // Create quick references to important scene objects
        this.sceneTerrainMidGround = this.scene.terrain.midGround;
        this.sceneEntityMgr = this.scene.entities;
        this.cooldowns = cooldownPlugin;

        // Set initial state
        this.direction = 'right';
        this.canDive = false;
        // this.hitImmuneCDKey = this.cooldowns.create(60);
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
        // if (this.cooldowns.isOff(this.hitImmuneCDKey)) {
        //     this.cooldowns.setOn(this.hitImmuneCDKey);
        //     this.health -= damage;
        //     if (this.health < 0) {
        //         this.health = 0;
        //     }

        //     // Apply knockback
        //     this.body.velocity.x += (xPos > this.x ? -300 : 300);

        //     // Damage tint
        //     this.setTint(0xFF9999);
        // }
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
    anchoredCursorPos(anchorX, anchorY, anchorDist) {
        let towardsPointer = new Phaser.Math.Vector2(
            this.activePointer.worldX - anchorX,
            this.activePointer.worldY - anchorY
        );
        if (towardsPointer.lengthSq() > anchorDist * anchorDist) {
            towardsPointer.setLength(anchorDist);
        }
        towardsPointer.x += anchorX;
        towardsPointer.y += anchorY;
        return towardsPointer;
    }

    update() { 
        let finalAnim = '';


        // if (this.cooldowns.isOff(this.hitImmuneCDKey)) {
        //     this.setTint(0xFFFFFF);
        // }

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
            finalAnim = 'dwarf-move-left';
            this.direction = 'left';
            if (this.body.onFloor()) {
                this.body.setAccelerationX(-this.agility * 90);
            } else {
                this.body.setAccelerationX(-this.agility * 50);
            }
        } else if (this.rightKeyEquivIsDown() && this.leftKeyEquivIsUp()) {
            finalAnim = 'dwarf-move-right';
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
            if (this.body.velocity.x == 0) {
                finalAnim = 'dwarf-idle-' + this.direction;
            }
        }

        // When mouse clicked
        if (this.activePointer.primaryDown) {
            // If hitbox doesn't exist, make one
            if (this.attHitBox === null) {
                this.attHitBox = this.scene.add.rectangle(0, 0, 10, 12);
                this.scene.physics.add.existing(this.attHitBox);
                this.attHitBox.body.setAllowGravity(false);
                this.attCollider = this.scene.physics.add.overlap(
                    this.attHitBox, this.sceneEntityMgr.getEntityGroup(),
                    (hitbox, entity) => { entity.takeHit(this.attackDamage); }
                );
            }

            // Attack left
            if (this.activePointer.worldX < this.body.center.x) {
                if (this.body.velocity.x > this.agility * 2.5) {
                    this.body.setAccelerationX(0);
                }
                // this.body.setVelocityX(this.body.velocity.x - 10);
                this.attHitBox.setPosition(this.body.center.x - 12, this.body.center.y + 3);
                this.direction = 'left';
                finalAnim = 'dwarf-swipe-left';
            } 
            // Attack right
            else {
                if (this.body.velocity.x < -this.agility * 2.5) {
                    this.body.setAccelerationX(0);
                }
                // this.body.setVelocityX(this.body.velocity.x + 10);
                this.attHitBox.setPosition(this.body.center.x + 12, this.body.center.y + 3);
                this.direction = 'right';
                finalAnim = 'dwarf-swipe-right';
            }
        }
        // When mouse not clicked and there's a hitbox
        else if (this.attHitBox !== null) {
            // Get rid of it
            this.attHitBox.destroy();
            this.attHitBox = null;
        }

        if (finalAnim !== '' && this.anims.currentAnim.key != finalAnim) {
            this.play(finalAnim);
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
        scene.anims.create({
            key: 'dwarf-swipe-left',
            frames: scene.anims.generateFrameNames('dwarf-swipe-left', { start: 0, end: 4, prefix: 'dwarf-swipe-left-'}),
            repeat: -1,
            frameRate: 8
        });
        scene.anims.create({
            key: 'dwarf-swipe-right',
            frames: scene.anims.generateFrameNames('dwarf-swipe-right', { start: 0, end: 4, prefix: 'dwarf-swipe-right-'}),
            repeat: -1,
            frameRate: 8
        });
    }

    /**
     * Load Atlases using the scene's LoaderPlugin.
     * @param {Phaser.Scene} scene 
     */
    static loadAtlases(scene) {
        // Idle States of Character
        scene.load.atlas('dwarf-idle-left', dwarfIdleLeftPng, dwarfIdleLeftJson);
        scene.load.atlas('dwarf-idle-right', dwarfIdleRightPng, dwarfIdleRightJson);

        // Movement States of Character
        scene.load.atlas('dwarf-move-left', dwarfMoveLeftPng, dwarfMoveLeftJson);
        scene.load.atlas('dwarf-move-right', dwarfMoveRightPng, dwarfMoveRightJson);

        // Attack States of Character
        scene.load.atlas('dwarf-swipe-left', dwarfSwipeLeftPng, dwarfSwipeLeftJson);
        scene.load.atlas('dwarf-swipe-right', dwarfSwipeRightPng, dwarfSwipeRightJson);
    }
}

export default Dwarf;