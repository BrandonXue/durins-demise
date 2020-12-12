/**
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * Past Contributors:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * Ernesto Hooghkirk (Ernesto_Hooghkirk@csu.fullerton.edu)
 * Ryan Martinez (Rmartinez72@csu.fullerton.edu)
 * 
 * This file contains code for the Bunny class, which is a
 * subclass of Phaser.GameObjects.Sprite.
 */

/**
 * What's a bunny doing in a cave? Looking for carrots?
 */
class Bunny extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // Create quick references to important scene objects
        this.sceneTerrainMidground = this.scene.terrain.midground;

        // Initialize state
        this.swordHitBox = null;
        this.HOP_DELAY = 500;
        this.hopCountdown = Math.floor(Math.random() * this.HOP_DELAY);

        // Scale the sprite
        this.setScale(.4, .4); // .3 , .35

        // Register self to the scene
        this.scene.add.existing(this); 
    }

    /**
     * Setter for moveSpeed stat. 
     * @param {Number} moveSpeed Affects top speed horizontally.
     */
    setMoveSpeed(moveSpeed) { this.moveSpeed = moveSpeed; return this; }

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
        if (this.heath === undefined) { this.health = this.hitPoints; }
        return this;
    }

    /**
     * Set the target and its physics body for this Bunny to pursue and attack.
     * @param {Phaser.Physics.Arcade.Body} targetBody 
     */
    setTargetBody(target) {
        this.target = target;
        this.targetBody = target.body; 
        return this;
    }

    /**
     * Configure this object's physics properties.
     * Precondition: The object's stats must be set.
     */
    configPhysics() {
        this.scene.physics.add.existing(this); // Create physics body

        this.body.setSize(32, 31); // Set size of physics body
        this.body.setOffset(0, 0); // Offset the hitbox to solve sprite alignment issue

        this.body.setCollideWorldBounds(true, 0, 0);
        this.body.maxVelocity.set(110, 700); // Set maximum horizontal and vertical velocity
        this.body.setDragX(200);

        this.createHitboxes();
    }

    createHitboxes() {
        this.swordHitBox = this.scene.add.rectangle(this.body.x, this.body.y, 6, 6);
        this.scene.physics.add.existing(this.swordHitBox);
        this.swordHitBox.body.setAllowGravity(false);
    }

    attackLeft() {
        this.disposeRightAttObjects();
        // Use the tween to control the start of everything
        if (this.leftAttTween === undefined){
            if (this.swordCollider == undefined) {
                this.swordCollider = this.scene.physics.add.overlap(this.swordHitBox, this.target, () => {
                    this.target.takeHit(this.attackDamage, this.swordHitBox.x);
                });
            }
            this.leftAttTween = this.scene.tweens.addCounter({
                from: -0.1,
                to: 3.2,
                duration: 580,
                // Use the onComplete of the tween to dispose of colliser and tween
                onComplete: () => {
                    this.disposeLeftAttObjects();
                    if (this.swordCollider !== undefined) {
                        this.swordCollider.destroy();
                        this.swordCollider = undefined;
                    }
                }
            });
            this.play('bunny-attack-left');
        }
        // Position hitbox for left attack
        const val = this.leftAttTween.getValue();
        this.swordHitBox.setPosition(
            this.x - 10 * Math.sin(val),
            this.y + 9 * Math.cos(val));
    }

    disposeLeftAttObjects() {
        if (this.leftAttTween !== undefined) {
            this.leftAttTween.remove();
            this.leftAttTween = undefined;
        }
    }

    attackRight() {
        this.disposeLeftAttObjects();
        // Use the tween to control the start of everything
        if (this.rightAttTween === undefined){
            if (this.swordCollider == undefined) {
                this.swordCollider = this.scene.physics.add.overlap(this.swordHitBox, this.target, () => {
                    this.target.takeHit(this.attackDamage);
                });
            }
            this.rightAttTween = this.scene.tweens.addCounter({
                from: 4.6,
                to: 8.1,
                duration: 580,
                // Use the onComplete of the tween to dispose of colliser and tween
                onComplete: () => {
                    this.disposeRightAttObjects();
                    if (this.swordCollider !== undefined) {
                        this.swordCollider.destroy();
                        this.swordCollider = undefined;
                    }
                }
            });
            this.play('bunny-attack-right');
        }
        // Position hitbox for left attack
        const val = this.rightAttTween.getValue();
        this.swordHitBox.setPosition(
            this.x - 10 * Math.sin(val) + 2,
            this.y + 3 * Math.cos(val));
    }

    disposeRightAttObjects() {
        if (this.rightAttTween !== undefined) {
            this.rightAttTween.remove();
            this.rightAttTween = undefined;
        }
    }

    isFacingBlock(direction) {
        let x = this.x;
        if (direction == 'left') {
            x -= 10;
        } else {
            x += 10;
        }
        const facingBlock = this.sceneTerrainMidground.getTileAtWorldXY(x, this.y, false);
        return (facingBlock !== null);
    }

    tryToJump(direction) {
        // If there's a block in front of us, jump
        if (this.isFacingBlock(direction) && this.body.onFloor()) {
            this.body.setVelocityY(-170);
        }
    }

    update() {
        // Bunny hops once in a while
        this.hopCountdown = (this.hopCountdown + 1) % this.HOP_DELAY;
        if (this.hopCountdown == 0 && this.body.onFloor()) {
            this.body.setVelocityY(-170);
        }

        const deltaX = this.targetBody.center.x - this.body.center.x;
        const deltaY = this.targetBody.center.y - this.body.center.y;

        // If we're too far away, bunny does nothing
        if (deltaX > 75 || deltaX < -75 || deltaY > 75 || deltaY < -75) {
            this.body.velocity.x = 0;
            if (this.anims.currentAnim.key != 'bunny-idle-patrol') {
                this.play('bunny-idle-patrol');
            }
        } 
        // If we're within sensing proximity, bunny walks towards us
        else if (deltaX > 18) {
            this.body.velocity.x = this.moveSpeed * 6;
            this.tryToJump('right');
            if (this.anims.currentAnim.key != 'bunny-move-right') {
                this.play('bunny-move-right');
            }
        } else if (deltaX < -18) {
            this.body.velocity.x = this.moveSpeed * (-6);
            this.tryToJump('left');
            if (this.anims.currentAnim.key != 'bunny-move-left') {
                this.play('bunny-move-left');
            }
        } 
        // If we're within attacking range, bunny attacks
        else if (deltaY < 20 && deltaY > -20) {
            this.body.velocity.x = 0;
            if (deltaX > 0) {
                this.attackRight();
                
            } else if (deltaX < 0) {
                this.attackLeft();
            }
        }
    }

    /**
     * Create animations using the scene's AnimationManager.
     * @param {Phaser.Scene} scene 
     */
    static createAnims(scene) {
        scene.anims.create({
            key: 'bunny-idle-patrol',
            frames: scene.anims.generateFrameNames('bunny', { 
                prefix: 'bunny_left-', 
                frames: [0, 0 ,0, 0, 0, 0, 0, 0, 5, 6, 7, 6, 5, 0, 0, 0, 5, 6, 7, 6, 6, 5, 6, 7 , 6, 7, 7, 6, 7, 6, 5, 0]
            }),
            repeat: -1,
            frameRate: 2
        });
        scene.anims.create({
            key: 'bunny-melt-left',
            frames: scene.anims.generateFrameNames('bunny', { start: 0, end: 7, prefix: 'bunny_left-'}),
            repeat: -1,
            frameRate: 2
        });
        scene.anims.create({
            key: 'bunny-melt-right',
            frames: scene.anims.generateFrameNames('bunny-right', { start: 0, end: 7, prefix: 'bunny_right-'}),
            repeat: -1,
            frameRate: 2
        });
        scene.anims.create({
            key: 'bunny-move-left',
            frames: scene.anims.generateFrameNames('bunny', { start: 0, end: 4, prefix: 'bunny_left-'}),
            repeat: -1,
            frameRate: 2.5
        });
        scene.anims.create({
            key: 'bunny-move-right',
            frames: scene.anims.generateFrameNames('bunny-right', { start: 0, end: 4, prefix: 'bunny_right-'}),
            repeat: -1,
            frameRate: 2.5
        });
        scene.anims.create({
            key: 'bunny-attack-left',
            frames: scene.anims.generateFrameNames('bunny', { start: 5, end: 7, prefix: 'bunny_left-'}),
            repeat: -1,
            frameRate: 3
        });
        scene.anims.create({
            key: 'bunny-attack-right',
            frames: scene.anims.generateFrameNames('bunny-right', { start: 5, end: 7, prefix: 'bunny_right-'}),
            repeat: -1,
            frameRate: 3
        });
    }

    /**
     * Load Atlases using the scene's LoaderPlugin.
     * @param {Phaser.Scene} scene 
     */
    static loadAtlases(scene) {
        scene.load.atlas(
            'bunny', 'assets/bunny/left/bunny_left.png',
            'assets/bunny/left/bunny_left.json'
        );
        scene.load.atlas(
            'bunny-right', 'assets/bunny/right/bunny_right.png',
            'assets/bunny/right/bunny_right.json'
        );
    }
}