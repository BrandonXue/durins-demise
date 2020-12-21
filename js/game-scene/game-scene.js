/**
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * Past Contributors:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * Eddie Huang (edhuang04@csu.fullerton.edu)
 * Ernesto Hooghkirk (Ernesto_Hooghkirk@csu.fullerton.edu)
 * 
 * Last maintained (YYMMDD): YYMMDD
 * 
 * This file contains code for the GameScene Phaser.Scene class.
 * This scene is the main Scene where the game takes place.
 */

/**
 * This dictionary is used to lookup Game Scene objects'
 * depth values, which is essentially z-indexes. Higher
 * depth values render in front of lower depth values.
 * 
 * Each type in the dictionary can occupy 10 indices.
 * (e.g. If you have 3 backgroundStatic layers, you can
 * go from dpeths of 0 to 2).
 */
const SceneDepth = {
    backgroundStatic: 0,
    backgroundDynamic: 10,
    midgroundDynamic: 20,
    npc: 30,
    player: 40,
    foregroundDynamic: 50,
    HUD: 60
};
Object.freeze(SceneDepth);

/**
 * The main game scene.
 */
class GameScene extends Phaser.Scene {
    
    /**
     * Use this function to receive parameters when changing scenes.
     */
    init(gameFile) {
        this.inventoryToggle = false;

        this.rowCount = 200;
        this.colCount = 100;
        this.blockSize = 16; // Number of pixels for each block in each dimension
        
        this.MINING_DURATION = 600; // The starting value of the mining countdown
        this.miningCountdown = this.MINING_DURATION; // The mining countdown
        this.previousBlock = null; // Used to keep track of previous block that pointer was over

        // Set quick references to input objects
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.activePointer = this.input.activePointer;

        // If no parameter was passed into gameFile, an empty object will be passed by default
        if (gameFile.data === undefined) {
            this.loadFromFile = false;
        } else {
            this.loadFromFile = true;
        }
    }

    /**
     * Use this function to load any assets. This function comes after init().
     */
    preload() {
        // Use dwarf's static preload function to load its assets
        Dwarf.loadAtlases(this);
        Zombie.loadAtlases(this);
        Bunny.loadAtlases(this);

        this.load.image('dirt', 'assets/blocks/dirt.png');
        this.load.image('grass', 'assets/blocks/grass.png');
        this.load.image('stone-ores', 'assets/blocks/stone-ores.png');

        this.load.atlas('block-break', 'assets/mining/block-break.png', 'assets/mining/block-break.json');
        this.load.atlas('mining-particles', 'assets/mining/particles.png', 'assets/mining/particles.json');

        this.load.image('cave1', 'assets/PixelFantasy-Caves-1.0/cave1.png')
        this.load.image('cave2', 'assets/PixelFantasy-Caves-1.0/cave2.png')
        this.load.image('cave3', 'assets/PixelFantasy-Caves-1.0/cave3.png')
        this.load.image('cave4', 'assets/PixelFantasy-Caves-1.0/cave4.png')
        this.load.image('cave5', 'assets/PixelFantasy-Caves-1.0/cave5.png')

        this.load.audio('game-screen-audio', 'assets/audio/Simon-Swerwer-Decapitated-Camels.mp3');
        
        this.load.atlas('health-bar-sheet', 'assets/HUD/health-bar/health-bar.png', 'assets/HUD/health-bar/health-bar.json');

        this.load.atlas('inventory-sheet', 'assets/HUD/hot-bar/inventory.png', 'assets/HUD/hot-bar/inventory.json');

        this.load.scenePlugin('CooldownPlugin', 'js/game-scene/cooldown-plugin.js', 'cooldowns', 'cooldowns');
    }

    /**
     * Create animations related to this game scene using AnimationManager.
     */
    createAnims() {
        // Block breaking animation
        this.anims.create({
            key: 'block-breaking',
            frames: this.anims.generateFrameNames('block-break', { start: 8, end: 0, prefix: 'block-break'}),
            repeat: 0,
            frameRate: 15
        });
        this.anims.create({
            key: 'health-bar',
            frames: this.anims.generateFrameNames('health-bar-sheet', { start: 9, end: 1, prefix: 'health-bar'}),
            repeat: 0,
            frameRate: 10
        });

        this.anims.create({
            key: 'inventory-bar',
            frames: this.anims.generateFrameNames('inventory-sheet', { start: 1, end: 2, prefix: 'inventory'}),
            repeat: 0,
            frameRate: 1
        });
    }

    createEventListeners() {
        // I:   Inventory Toggle down
        this.input.keyboard.on('keydown-I', () => {
            this.inventoryToggle = !this.inventoryToggle;
            this.inventoryBar.setFrame( 
                this.anims.get('inventory-bar').getFrameByProgress(this.inventoryToggle ? 0 : 1).textureFrame);
        });

        // T:   Decrease volume
        this.input.keyboard.on('keydown-T', () => {
            if (this.sound.volume - 0.05 < 0) {
                this.sound.volume = 0;
            } else {
                this.sound.volume -= 0.05;
            }
        });

        // Y:   Increase volume
        this.input.keyboard.on('keydown-Y', () => {
            this.sound.volume += 0.05;
        });

        // M:   Pause/unpause music
        this.input.keyboard.on('keydown-M', () => {
            if(this.music.isPlaying){
                this.music.pause();
            } else{
                this.music.resume();
            }
        });
    }

    /**
     * This function typically contains the bulk of the setup code.
     * This function comes after preload().
     */
    create() {
        /* ========================= Create Visuals ========================== */
        this.createAnims();
        Dwarf.createAnims(this);
        Zombie.createAnims(this);
        Bunny.createAnims(this);

        // Life bar Visuals
        this.healthBar = this.make.sprite({ scene: this });
        this.healthBar.setTexture('health-bar-sheet');
        this.healthBar.setDepth(SceneDepth.HUD);
        // Keep it static (IMPORTANT: -235, -178 is hard coded for a zoom of 2.3)
        this.healthBar.setScrollFactor(0, 0).setDisplayOrigin(-235, -178);

        //Inventory Bar Visuals
        this.inventoryBar = this.make.sprite({ scene: this });
        this.inventoryBar.setTexture('inventory-sheet', this.anims.get('inventory-bar').frames[1].textureFrame);
        this.inventoryBar.setDepth(SceneDepth.HUD);
        // same for invenotry bar. its harded coded to -760, -290 for a zoom of 2.3
        this.inventoryBar.setScrollFactor(0, 0).setDisplayOrigin(-760, -290);
        // changing this scale also completely changes the static location just FYI
        this.inventoryBar.setScale(.6);

        // Create mining Sprite
        this.miningAnim = this.make.sprite({ scene: this })
        this.miningAnim.setTexture('block-break');

        // Create particles for block breaking
        this.miningParticles = this.add.particles('mining-particles');

        // Keyboard event listeners for non-movement keys
        this.createEventListeners();

        /* ========================== Create Audio =========================== */
        // Add game screen audio
        this.music = this.sound.add('game-screen-audio');
    
        // Initial volume level
        this.sound.volume = .1;
        this.music.play();

        /* ====================== Create the Game World ====================== */
        const backgroundScale = 0.7;
        const width = this.scale.width;
        const height = this.scale.height;

        // Create our background tileSprites. For each one, disable horizontal scrolling
        // of the object itself. This is not to be confused with the tilePosition,
        // which allows the image to tile and move in-place.

        // The farthest layer, just silhouettes
        this.backgroundStatic1 = this.add.tileSprite(width / 2, 0, width, 0, 'cave1');
        this.backgroundStatic1.setTileScale(backgroundScale).setDepth(SceneDepth.backgroundStatic+1);
        this.backgroundStatic1.setScrollFactor(0, 1).setTilePosition(0, height/2);

        // The half-foggy half-visible layer
        this.backgroundStatic2 = this.add.tileSprite(width / 2, 0, width, 0, 'cave2');
        this.backgroundStatic2.setTileScale(backgroundScale).setDepth(SceneDepth.backgroundStatic+2);
        this.backgroundStatic2.setScrollFactor(0, 1).setTilePosition(0, height/2);

        // Behind pool
        this.backgroundStatic3 = this.add.tileSprite(width / 2, 0, width, 0, 'cave3');
        this.backgroundStatic3.setTileScale(backgroundScale).setDepth(SceneDepth.backgroundStatic+3);
        this.backgroundStatic3.setScrollFactor(0, 1).setTilePosition(0, height/2);

        // Pool: The pool is not a tileSprite because repeating it would be too repetitive.
        this.backgroundStatic4 = this.add.image(width * 0.5,height *0.14, 'cave4');
        this.backgroundStatic4.setScale(backgroundScale).setDepth(SceneDepth.backgroundStatic+4);
        this.backgroundStatic4.setScrollFactor(0.7, 1);
        
        // In front of pool
        this.backgroundStatic5 = this.add.tileSprite(width / 2, 0, width, 0, 'cave5');
        this.backgroundStatic5.setTileScale(backgroundScale).setDepth(SceneDepth.backgroundStatic+5)
        this.backgroundStatic5.setScrollFactor(0, 1).setTilePosition(0, height/2);
        
        // Brandon Dynamic Terrain
        const terrainBuilder = new TerrainBuilder(this.rowCount, this.colCount, this.blockSize);
        // Create terrain from a save file
        if (this.loadFromFile) {
            // TODO: Future feature for save files
        } 
        // Generate new terrain
        else {
            terrainBuilder.generateTerrain();
        }
        this.terrain = new Terrain(this, terrainBuilder.createMapData());

        // // Grass take up 4 GID values
        this.terrain.addTilesetImage2('grass', null, 16, 16);
        // // Dirt starts at GID 4 (the last param)
        this.terrain.addTilesetImage2('dirt', null, 16, 16);
        
        this.terrain.addTilesetImage2('stone-ores', null, 16, 16);

        this.terrain.createDynamicLayers();

        // Set terrain layers to their appropriate depths
        this.terrain.background.setDepth(SceneDepth.backgroundDynamic);
        this.terrain.midground.setDepth(SceneDepth.midgroundDynamic);
        this.terrain.foreground.setDepth(SceneDepth.foregroundDynamic);


        /* ============= Create Entities and the Entity Manager  ============= */
        // NOTE: The Entity Manager will be used to keep track of how many enemies are
        // near the player, and whether or not more should be spawned.

        this.entities = new EntityManager(this, 20, 20);

        // Create the player
        this.dwarf = new Dwarf(this, 400, 100, this.cooldowns);
        this.dwarf.setAgility(10).setMoveSpeed(10).setJumpHeight(10).setDiveSpeed(10);
        this.dwarf.setAttackDamage(90).setAttackSpeed(10).setHitPoints(100);
        this.dwarf.setReach(25).setMiningSpeed(10);
        this.dwarf.configPhysics();
        this.dwarf.play('dwarf-idle-right');
        this.dwarf.setDepth(SceneDepth.player);
        this.physics.add.collider(this.dwarf, this.terrain.midground);

        /* ==================== Configure World Settings ===================== */
        this.physics.world.setBounds(
            0, 0, this.colCount*this.blockSize, this.rowCount*this.blockSize,
            true, true, true, true
        );
        
        // Setup camera to follow dwarf with linear interpolation
        this.cameras.main.startFollow(this.dwarf, false, 0.1, 0.1).setZoom(2.3); //2.3

        // Set background color and set camera bounds
        this.cameras.main.setBounds(
            0, 0, this.colCount*this.blockSize, this.rowCount*this.blockSize);
        this.cameras.main.setBackgroundColor(0x17191d);
    }

    

    /**
     * Check if the active pointer is within the specified distance of the center of the sprite.
     * @param {Phaser.GameObjects.Sprite} sprite The target sprite to check distance between.
     * @param {Number} distance The distance in pixels.
     */
    isCursorInReach(sprite, distance) {
        return Phaser.Math.Distance.Between(
            sprite.body.center.x, sprite.body.center.y,
            this.activePointer.worldX, this.activePointer.worldY) <= distance;
    }

    /**
     * Get the frontmost Tile object that the current active pointer is pointing to,
     * or null if there are no Tile objects where the active pointer is pointing.
     */
    getCurrentFrontTile() {
        let frontTile = null;
        frontTile = this.terrain.foreground.getTileAtWorldXY(
            this.activePointer.worldX, this.activePointer.worldY, false
        );
        if (frontTile !== null)
            return frontTile;

        frontTile = this.terrain.midground.getTileAtWorldXY(
            this.activePointer.worldX, this.activePointer.worldY, false
        );
        if (frontTile !== null)
            return frontTile;

        frontTile = this.terrain.background.getTileAtWorldXY(
            this.activePointer.worldX, this.activePointer.worldY, false
        );
        if (frontTile !== null)
            return frontTile;

        return null;
    }

    getHealthBarFrame() {
        return this.anims.get('health-bar').getFrameByProgress(this.dwarf.getHealthRatio()).textureFrame;
    }

    getMiningFrame() {
        const progress = this.miningCountDown / this.MINING_DURATION;
        return this.anims.get('block-breaking').getFrameByProgress(progress).textureFrame;
    }

    getTilesetForIndex(index) {
        return this.terrain.tilesets.find(tileset => (
            (index >= tileset.firstgid) && index < (tileset.firstgid + tileset.total)
        ));
    }

    /**
     * Create a particle emitter for a block-breaking effect.
     * Sample the block's colors
     * @param {Phaser.Tilemaps.Tile} currentBlock 
     */
    createMiningParticleEmitter(currentBlock, particleDepth) {
        let name = currentBlock.tileset.name;
    
        // Make sure particles appear at correct depth
        this.miningParticles.setDepth(particleDepth);

        // Remove any old emitter
        if (this.miningEmitter !== undefined)
            this.miningEmitter.remove();

        this.miningEmitter = this.miningParticles.createEmitter({
            frame: ['shape-0', 'shape-1', 'shape-2', 'shape-3', 'shape-4', 'shape-5'],
            x: {min: currentBlock.pixelX, max: currentBlock.pixelX+this.blockSize},
            y: {min: currentBlock.pixelY, max: currentBlock.pixelY+this.blockSize},
            speed: 20,
            gravityY: 50,
            frequency: 300,
            tint: [ // Use tileset to sample two pixel colors
                this.textures.getPixel(2, 2, name).color,
                this.textures.getPixel(13, 13, name).color,
            ],
            lifespan: 500,
        });
    }

    /**
     * Perform a step in the mining process.
     * This will progress the mining animation and create particles.
     * When a block is successfully mined, it will be replaced with air.
     * @param {Phaser.Tilemaps.Tile} currentBlock The Phaser Tile object to mine at.
     * @param {Number} miningSpeed The speed of mining, or amount subtracted from the countdown.
     */
    doMining(currentBlock, miningSpeed) {
        // If we're just starting to break a block, make the sprite visible and make particles
        if (this.miningCountDown == this.MINING_DURATION) {
            this.miningAnim.setPosition(currentBlock.getCenterX(), currentBlock.getCenterY());

            // Make sure both animation and particle are at correct depth
            const blockDepth = currentBlock.layer.tilemapLayer.depth;
            this.miningAnim.setDepth(blockDepth+1).setVisible(true);
            this.createMiningParticleEmitter(currentBlock, blockDepth+2);
        }
        this.miningAnim.setFrame(this.getMiningFrame());

        // Decrement coundown
        this.miningCountDown -= miningSpeed;

        // If block is broken, reset the countdown and set the block to air
        if (this.miningCountDown <= 0) {
            this.miningCountDown = this.MINING_DURATION;
            currentBlock.layer.tilemapLayer.putTileAtWorldXY(
                Block.air, this.activePointer.worldX, this.activePointer.worldY,
                true, this.cameras.main
            );
            // Make a small explosion of particles
            this.miningEmitter.explode(8);
        }
    }
    
    /**
     * Reset any mining progress.
     * Sets the mining animation sprite to invisible and explodes the mining particle emitter.
     */
    resetMining() {
        this.miningCountDown = this.MINING_DURATION;
        this.miningAnim.setVisible(false);
        // Kill all particles as long as it is emitting
        if (this.miningEmitter !== undefined && this.miningEmitter.frequency >= 0) {
            this.miningEmitter.killAll();
        }
    }

    /**
     * Check if the given block is mine-able, false otherwise.
     * @param {Phaser.Tilemaps.Tile} block The Phaser Tile to check.
     */
    canBeMined(block) {
        return (block !== null)
        && (block.index !== Block.air)
        //&& (block.y > 16);
    }

    /**
     * Set the scroll value of our background tileSprites based on our main camera's
     * scroll value. For parallax, the farthest sprites should appear the most static.
     */
    scrollTilesSprites() {
        this.backgroundStatic1.tilePositionX = this.cameras.main.scrollX * 0.1;
        this.backgroundStatic2.tilePositionX = this.cameras.main.scrollX * 0.3;
        this.backgroundStatic3.tilePositionX = this.cameras.main.scrollX * 0.7;
        this.backgroundStatic5.tilePositionX = this.cameras.main.scrollX * 1.2;
    }

    /**
     * This function is called once per game step. Game magic happens here.
     */
    update() {
        // Debug zone:
        if (this.input.keyboard.checkDown(this.cursorKeys.shift, 1000)) {
            this.entities.spawnHostile(this, this.dwarf);
        }

        this.dwarf.update();

        // Do mining tasks
        let currentBlock = this.getCurrentFrontTile();
        // If we can mine
        if (this.activePointer.primaryDown
            && this.isCursorInReach(this.dwarf, this.dwarf.reach)
            && currentBlock === this.previousBlock
            && this.canBeMined(currentBlock)) 
        {
            this.doMining(currentBlock, this.dwarf.miningSpeed);
        }
        // Else reset mining countdown and make the breaking animation disappear
        else {
            this.resetMining();
        }
        this.previousBlock = currentBlock;

        // Update health bar
        this.healthBar.setFrame(this.getHealthBarFrame());
        
        // Scroll our background tileSprites
        this.scrollTilesSprites();
    }
}