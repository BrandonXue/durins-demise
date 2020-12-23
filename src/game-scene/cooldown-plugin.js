/**
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * This file contains the CooldownPlugin, which handles
 * entries that require a cooldown to be kept track of.
 */

var CooldownPlugin = function(scene) {
    this.scene = scene;
    this.systems = scene.sys;

    if (!scene.sys.settings.isBooted) {
        scene.sys.events.once('boot', this.boot, this);
    }

    this.cooldowns = [];
    this.durations = [];
    this.index = -1;
};

CooldownPlugin.register = function(PluginManager) {
    PluginManager.register('CooldownPlugin', CooldownPlugin, 'cooldowns');
}

CooldownPlugin.prototype = {
    boot: function() {
        var eventEmitter = this.systems.events;
        eventEmitter.on('update', this.update, this);
        eventEmitter.on('destroy', this.destroy, this);
    },

    create: function(duration) {
        ++this.index;
        this.cooldowns[this.index] = 0;
        this.durations[this.index] = duration;
        return this.index;
    },

    /**
     * Check whether an entry is off cooldown, meaning its associated event
     * or action is ready to be triggered or activated.
     * @param {number} index The index returned when the item was registered 
     */
    isOff: function(index) {
        return this.cooldowns[index] === 0;     
    },

    /**
     * Set an item to "on cooldown", meaning it will have to go through its specified duration
     * before it will be off cooldown again.
     * @param {number} index The index returned when the item was registered 
     */
    setOn: function(index) {
        this.cooldowns[index] = 1;
    },

    /**
     * Advance all cooldowns by one frame.
     */
    update: function() {
        for (let i = 0; i < this.cooldowns.length; ++i) {
            if (this.cooldowns[i] !== 0) {
                this.cooldowns[i] = (this.cooldowns[i] + 1) % this.durations[i];
            }
        }
    },

    destroy: function() {
        this.scene = undefined;
        this.systems = undefined;
        this.cooldowns = undefined;
        this.durations = undefined;
        this.index = undefined;
    }
}

CooldownPlugin.prototype.constructor = CooldownPlugin;

export default CooldownPlugin;