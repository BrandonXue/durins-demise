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
class Bunny extends BaseEntity {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // Create quick references to important scene objects
        this.sceneTerrainMidground = this.scene.terrain.midground;

        // Initialize state
        this.alive = true;
        this.HIT_IMMUNE_DURATION = 60;
        this.hitImmuneCountdown = this.HIT_IMMUNE_DURATION;
        this.HOP_DELAY = 500;
        this.hopCountdown = Math.floor(Math.random() * this.HOP_DELAY);

        this.healthBar = new BasicHealthBar(scene, 16, 1.5, SceneDepth.HUD);

        // Scale the sprite
        this.setScale(.4, .4); // .3 , .35

        // Register self to the scene
        this.scene.add.existing(this); 
    }

    /**
     * Configure this object's physics properties.
     * Precondition: The object's stats must be set.
     */
    configPhysics() {
        this.scene.physics.add.existing(this); // Create physics body

        this.body.setSize(26, 24); // Set size of physics body
        this.body.setOffset(0, 9); // Offset the hitbox to solve sprite alignment issue

        this.body.setCollideWorldBounds(true, 0, 0);
        this.body.maxVelocity.set(110, 700); // Set maximum horizontal and vertical velocity
        this.body.setDragX(200);
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

    isFacingBlock(direction) {
        let x = this.x;
        if (direction == 'left') {
            x -= 14;
        } else {
            x += 14;
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
            if (this.anims.currentAnim.key != 'bunny-idle') {
                this.play('bunny-idle');
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
    }

    /**
     * Create animations using the scene's AnimationManager.
     * @param {Phaser.Scene} scene 
     */
    static createAnims(scene) {
        scene.anims.create({
            key: 'bunny-idle',
            frames: scene.anims.generateFrameNames('bunny', { 
                prefix: 'bunny_left-', 
                frames: [0, 0 ,0, 0, 0, 0, 0, 0, 5, 6, 7, 6, 5, 0, 0, 0, 5, 6, 7, 6, 6, 5, 6, 7 , 6, 7, 7, 6, 7, 6, 5, 0]
            }),
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