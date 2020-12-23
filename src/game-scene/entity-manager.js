/**
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * This file contains the EntityManager, which handles
 * randomized spawning locations of entities,
 * and managing entity populations.
 */

import Bunny from './entities/bunny';
import Zombie from './entities/zombie';

import { SceneDepth } from './game-scene';

/**
 * Delegate for managing entity spawning.
 */
class EntityManager {
    /**
     * 
     * @param {Phaser.Scene} scene The game scene to add entities to.
     * @param {Number} hostileCap The maximum number of hostile entities that can exist at a time.
     * @param {Number} peacefulCap The maximum number of peaceful entities that can exist at a time.
     */
    constructor(scene, hostileCap, peacefulCap) {
        this.hostileTypes = [
            ['Zombie', 1]
        ];

        this.peacefulTypes = [
            ['Bunny', 1]
        ];

        this.hostileCap = hostileCap;
        this.peacefulCap = peacefulCap;

        this.hostileCount = 0;
        this.peacefulCount = 0;

        this.entityGroup = scene.add.group({
            active: true,
            runChildUpdate: true
        });
    }

    /**
     * Alias for performing a weighted sample on the Entity Manager's hostile entity types.
     */
    getHostileType() {
        return this.weightedSample(this.hostileTypes);
    }

    /**
     * Alias for performing a weighted sample on the Entity Manager's peaceful entity types.
     */
    getPeacefulType() {
        return this.weightedSample(this.peacefulTypes);
    }

    /**
     * Returns the Phaser Group Game Object that stores all entities.
     * This can be used by colliders.
     */
    getEntityGroup() {
        return this.entityGroup;
    }

    /**
     * Generic function for performing a weighted sample on a list of types and weights.
     * @param {Array} typesWithWeights An Array of Arrays.
     *      Each sub-array contains a type and a weight.
     *      Weight can be an integer or a float. Any number works:
     *      weight are relative to the other weights in the Array.
     */
    weightedSample(typesWithWeights) {
        let total = 0;
        typesWithWeights.forEach(item => {
            total += item[1];
        });
        const choiceThreshold = Math.floor(Math.random() * total);
        let accumulate = 0;
        for (let i = 0; i < typesWithWeights.length; ++i) {
            accumulate += typesWithWeights[i][1];
        
            if (accumulate >= choiceThreshold) {
                return typesWithWeights[i][0];
            }
        }
    }

    /**
     * Spawns some hostile enemies within a reasonable distance of the player.
     * @param {Phaser.Scene} scene The game scene where the player and hostile entity should be.
     * @param {Dwarf} playerSprite The player sprite with physics enabled.
     */
    spawnHostile(scene, playerSprite) {
        // Do not try and spawn more if hostile cap is reached or exceeded.
        if (this.hostileCount >=  this.hostileCap)
            return;

        const hostileType = this.getHostileType();
        let newHostile;
        if (hostileType == 'Zombie') {
            newHostile = new Zombie(scene, playerSprite.body.x, playerSprite.body.y);
            newHostile.play('zombie-idle-patrol');
        }
        newHostile.setAttackDamage(10).setAttackSpeed(10).setHitPoints(100);
        newHostile.setMoveSpeed(10).setTargetBody(playerSprite);
        newHostile.configPhysics();
        newHostile.setDepth(SceneDepth.npc);

        scene.physics.add.collider(newHostile, scene.terrain.midground);
        this.entityGroup.add(newHostile);
        this.hostileCount += 1;
    }

    /**
     * Spawns some peaceful enemies within a reasonable distance of the player.
     * @param {Phaser.Scene} scene The game scene where the player and peaceful entity should be.
     * @param {Dwarf} playerSprite The player sprite with physics enabled.
     */
    spawnPeaceful(scene, playerSprite) {
        // Do not try and spawn more if passive cap is reached or exceeded.
        if (this.peacefulCount >= this.peacefulCap)
            return;

        const peacefulType = this.getPeacefulType();
        let newPeaceful;
        if (peacefulType == 'Bunny') {
            newPeaceful = new Bunny(scene, playerSprite.body.x, playerSprite.body.y);
            newPeaceful.play('bunny-idle');
        }
        newPeaceful.setAttackDamage(3).setAttackSpeed(20).setHitPoints(100);
        newPeaceful.setMoveSpeed(10).setTargetBody(playerSprite);
        newPeaceful.configPhysics();
        newPeaceful.setDepth(SceneDepth.npc);

        scene.physics.add.collider(newPeaceful, scene.terrain.midground);
        this.entityGroup.add(newPeaceful);
        this.peacefulCount += 1;
    }
}

export default EntityManager;