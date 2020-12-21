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
 * This file contains classes for creating basic entities.
 */

class BasicHealthBar {

    /**
     * @param {Phaser.Scene} scene The scene to create objects in.
     * @param {Number} width The starting width of the health bar.
     * @param {Number} height The height of the health bar.
     * @param {Number} depth The render depth of the health bar.
     */
    constructor(scene, width, height, depth) {
        this.fullWidth = width;
        this.redBar = scene.add.rectangle(0, 0, width, height, 0xFF0000, 0.0);
        this.greenBar = scene.add.rectangle(0, 0, width, height, 0x00FF00, 0.0);

        this.redBar.setDepth(depth);        // Set red health bar's depth to HUD default
        this.greenBar.setDepth(depth+1);    // Set green health bar to display over red
    }

    setRatio(ratio) {
        this.greenBar.width = this.fullWidth * ratio;
    }

    update(centerX, centerY) {
        this.redBar.setPosition(centerX, centerY);
        this.greenBar.setPosition(centerX, centerY);
    }

    setAlpha(alpha) {
        this.redBar.fillAlpha = alpha;
        this.greenBar.fillAlpha = alpha;
    }

     /**
     * Destroys all components. This object's reference should be set to undefined afterwards.
     */
    destroy() {
        this.redBar.destroy();
        this.greenBar.destroy();
    }
}

class BaseEntity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // Create quick references to important scene objects
        this.sceneTerrainMidground = this.scene.terrain.midground;
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
     * Create animations using the scene's AnimationManager.
     * @param {Phaser.Scene} scene 
     */
    static createAnims(scene) {
        console.error(this.name + ' has not implemented createAnims()');
    }

    /**
     * Load Atlases using the scene's LoaderPlugin.
     * @param {Phaser.Scene} scene 
     */
    static loadAtlases(scene) {
        console.error(this.name + ' has not implemented loadAtlases()');
    }
}