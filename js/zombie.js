/*
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * Past Contributors:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * Ernesto Hooghkirk (Ernesto_Hooghkirk@csu.fullerton.edu)
 * 
 * Last maintained (YYMMDD): YYMMDD
 * 
 * This file contains code for the Zombie class, which is a
 * subclass of Phaser.GameObjects.Sprite.
 * 
 * The Zombie is a basic melee opponent.
 */

class Zombie extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // Create quick references to important scene objects
        this.sceneTerrainMidground = this.scene.terrain.midground;

        // Initialize state
        this.alive = true;
        this.healthBarRed = null;
        this.healthBarGreen = null;
        this.swordHitBox = null;
        this.HIT_IMMUNE_DURATION = 60;
        this.hitImmuneCountdown = this.HIT_IMMUNE_DURATION;

        // Scale the sprite
        this.setScale(0.3, 0.35);

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
     * Set the target and its physics body for this Zombie to pursue and attack.
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

        this.body.setSize(35, 47); // Set size of physics body
        this.body.setOffset(20, 0); // Offset the hitbox to solve sprite alignment issue

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

    takeHit(damage) {
        if (this.hitImmuneCountdown == this.HIT_IMMUNE_DURATION) {
            --this.hitImmuneCountdown;
            this.health -= damage;
            if (this.health < 0)
                this.health = 0;
        }
    }

    showHealthBar() {
        // starting width 16, height always 1.5
        if (this.healthBarRed === null) {
            this.healthBarRed = this.scene.add.rectangle(this.body.center.x, this.body.y - 2, 16, 1.5, 0xFF0000);
            this.healthBarGreen = this.scene.add.rectangle(this.body.center.x, this.body.y - 2, 16, 1.5, 0x00FF00);
            this.healthBarRed.setDepth(SceneDepth.HUD);
            this.healthBarGreen.setDepth(SceneDepth.HUD+1); // Display over red
        } else {
            this.healthBarRed.setPosition(this.body.center.x, this.body.y - 2);
            this.healthBarGreen.setPosition(this.body.center.x, this.body.y - 2);
            this.healthBarGreen.width = 16 * this.health / this.hitPoints;
        }
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
            this.play('zombie-attack-left');
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
            this.play('zombie-attack-right');
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
            x -= 6;
        } else {
            x += 6;
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
        if (this.health == 0) {
            if (this.alive) {
                this.play( 'zombie-melt-' + (this.body.velocity > 0 ? 'left': 'right') );
                this.alive = false;
                this.dyingTween = this.scene.tweens.addCounter({
                    duration: 700,
                    onComplete: () => {
                        this.disposeLeftAttObjects();
                        this.disposeRightAttObjects();
                        if (this.swordCollider !== undefined) {
                            this.swordCollider.destroy();
                            this.swordCollider = undefined;
                        }
                        if (this.swordHitBox !== undefined) {
                            this.swordHitBox.destroy();
                            this.swordHitBox = undefined;
                        }
                        this.healthBarGreen.destroy();
                        this.healthBarRed.destroy();
                        this.destroy();
                    }
                });
            }
            return;
        }

        // If taken damage
        if (this.health != this.hitPoints) {
            this.showHealthBar();
        }

        if (this.hitImmuneCountdown != this.HIT_IMMUNE_DURATION)
            --this.hitImmuneCountdown;
        if (this.hitImmuneCountdown <= 0)
            this.hitImmuneCountdown = this.HIT_IMMUNE_DURATION;

        const deltaX = this.targetBody.center.x - this.body.center.x;
        const deltaY = this.targetBody.center.y - this.body.center.y;

        // If we're too far away, zombie does nothing
        if (deltaX > 75 || deltaX < -75 || deltaY > 75 || deltaY < -75) {
            this.body.velocity.x = 0;
            if (this.anims.currentAnim.key != 'zombie-idle-patrol') {
                this.play('zombie-idle-patrol');
            }
        } 
        // If we're within sensing proximity, zombie walks towards us
        else if (deltaX > 18) {
            this.body.velocity.x = this.moveSpeed * 6;
            this.tryToJump('right');
            if (this.anims.currentAnim.key != 'zombie-move-right') {
                this.play('zombie-move-right');
            }
        } else if (deltaX < -18) {
            this.body.velocity.x = this.moveSpeed * (-6);
            this.tryToJump('left');
            if (this.anims.currentAnim.key != 'zombie-move-left') {
                this.play('zombie-move-left');
            }
        } 
        // If we're within attacking range, zombie attacks
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
            key: 'zombie-idle-patrol',
            frames: scene.anims.generateFrameNames('zombie', { 
                prefix: 'zombie-', frames: [2, 1, 1, 1, 1, 14, 13, 13, 13, 13]
            }),
            repeat: -1,
            frameRate: 2
        });
        scene.anims.create({
            key: 'zombie-melt-left',
            frames: scene.anims.generateFrameNames('zombie', { start: 5, end: 8, prefix: 'zombie-'}),
            repeat: -1,
            frameRate: 2
        });
        scene.anims.create({
            key: 'zombie-melt-right',
            frames: scene.anims.generateFrameNames('zombie', { start: 9, end: 12, prefix: 'zombie-'}),
            repeat: -1,
            frameRate: 2
        });
        scene.anims.create({
            key: 'zombie-move-left',
            frames: scene.anims.generateFrameNames('zombie', { start: 1, end: 4, prefix: 'zombie-'}),
            repeat: -1,
            frameRate: 2.5
        });
        scene.anims.create({
            key: 'zombie-move-right',
            frames: scene.anims.generateFrameNames('zombie', { start: 13, end: 16, prefix: 'zombie-'}),
            repeat: -1,
            frameRate: 2.5
        });
        scene.anims.create({
            key: 'zombie-attack-left',
            frames: scene.anims.generateFrameNames('zombie', { start: 17, end: 20, prefix: 'zombie-'}),
            repeat: -1,
            frameRate: 3
        });
        scene.anims.create({
            key: 'zombie-attack-right',
            frames: scene.anims.generateFrameNames('zombie', { start: 21, end: 24, prefix: 'zombie-'}),
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
            'zombie', 'assets/zombie/zombie.png',
            'assets/zombie/zombie.json'
        );
    }
}