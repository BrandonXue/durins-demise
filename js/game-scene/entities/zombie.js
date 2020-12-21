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

class Zombie extends BaseEntity {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // // Initialize state
        this.alive = true;
        this.HIT_IMMUNE_DURATION = 60;
        this.hitImmuneCountdown = this.HIT_IMMUNE_DURATION;

        // // Scale the sprite
        this.setScale(0.3, 0.35);

        // Create components
        this.createTweens();
        this.createHitboxes();
        this.healthBar = new BasicHealthBar(scene, 16, 1.5, SceneDepth.HUD);

        // Register self to the scene
        this.scene.add.existing(this);
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
    }

    createTweens() {
        this.rightAttTween = this.scene.tweens.addCounter({
            from: 4.6,
            to: 8.1,
            duration: 580,
            // Use the onComplete of the tween to dispose of colliser and tween
            onComplete: () => {
                if (this.swordCollider !== undefined) {
                    this.swordCollider.destroy();
                    this.swordCollider = undefined;
                }
            }
        });
        this.leftAttTween = this.scene.tweens.addCounter({
            from: -0.1,
            to: 3.2,
            duration: 580,
            // Use the onComplete of the tween to dispose of colliser and tween
            onComplete: () => {
                if (this.swordCollider !== undefined) {
                    this.swordCollider.destroy();
                    this.swordCollider = undefined;
                }
            }
        });
    }

    createHitboxes() {
        this.swordHitBox = this.scene.add.rectangle(0, 0, 6, 6);
        this.scene.physics.add.existing(this.swordHitBox);
        this.swordHitBox.body.setAllowGravity(false);
    }

    takeHit(damage) {
        if (this.hitImmuneCountdown == this.HIT_IMMUNE_DURATION) {
            --this.hitImmuneCountdown;

            // Reduce health
            this.health -= damage;
            if (this.health < 0)
                this.health = 0;

            // Update health bar
            this.healthBar.setAlpha(1.0);
            this.healthBar.setRatio(this.health / this.hitPoints);
        }
    }

    attackLeft() {
        // Use the tween to control the start of everything
            if (this.swordCollider == undefined) {
                this.swordCollider = this.scene.physics.add.overlap(this.swordHitBox, this.target, () => {
                    this.target.takeHit(this.attackDamage, this.swordHitBox.x);
                });
                this.leftAttTween.restart();
                this.play('zombie-attack-left');
            }
            
        // Position hitbox for left attack
        const val = this.leftAttTween.getValue();
        this.swordHitBox.setPosition(
            this.x - 10 * Math.sin(val),
            this.y + 9 * Math.cos(val));
    }

    attackRight() {
        // Use the tween to control the start of everything
        if (this.swordCollider == undefined) {
            this.swordCollider = this.scene.physics.add.overlap(this.swordHitBox, this.target, () => {
                this.target.takeHit(this.attackDamage, this.swordHitBox.x);
            });
            this.rightAttTween.restart();
            this.play('zombie-attack-right');
        }
            
        // Position hitbox for left attack
        const val = this.rightAttTween.getValue();
        this.swordHitBox.setPosition(
            this.x - 10 * Math.sin(val) + 2,
            this.y + 3 * Math.cos(val));
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

    onDeathDestroy() {
        // Remove Tweens
        this.leftAttTween.remove();
        this.rightAttTween.remove();
        this.dyingTween.remove();

        // Remove colliders, then hitboxes
        if (this.swordCollider !== undefined) {
            this.swordCollider.destroy();
        }
        this.swordHitBox.destroy();

        // Remove health bar
        this.healthBar.destroy();

        // Destroy self
        this.destroy();
    }

    update() {
        // If health reaches zero, trigger dying
        if (this.health == 0) {
            if (this.alive) {
                this.alive = false;

                this.play( 'zombie-melt-' + (this.body.velocity > 0 ? 'left': 'right') );

                this.dyingTween = this.scene.tweens.addCounter({
                    duration: 700,
                    onComplete: () => {
                        this.onDeathDestroy();
                    }
                });
            }
            return;
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

        // If taken damage, display health bar
        if (this.health != this.hitPoints) {
            this.healthBar.update(this.body.center.x, this.body.y - 2);
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

// // at the bottom of the zombie.js file
// Phaser.GameObjects.GameObjectFactory.register('zombie', function (x, y) {
// 	const zom = new Zombie()

//     this.displayList.add(zom)
//     this.updateList.add(zom)

//     return zom
// })