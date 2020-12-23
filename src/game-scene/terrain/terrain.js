/**
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * Past Contributors:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * Ryan Martinez (Rmartinez72@csu.fullerton.edu)
 * 
 * This file contains code for the Terrain class, which is a
 * Tilemap. This file also contains the TerrainBuilder, which
 * is used to load data from a file or generate from scratch.
 */

import Phaser from '../../phaser';

import { Block, getDirtBlock, getGrassBlock } from './block';

/**
 * Used to load terrain data from a file into its internal Arrays,
 * or to generate new terrain data specified by its algorithms.
 * 
 * Terrain data comes in three layers: dynamic background,
 * dynamic midground, and dynamic foreground.
 */
class TerrainBuilder {

    /**
     * @param {Number} rows The number of rows in the terrain (sometimes referred to as height). Default 1000.
     * @param {Number} cols The number of columns in the terrain (sometimes refered to as width). Default 200.
     * @param {Number} blockSize The number of pixels each block will take, default 16.
     */
    constructor(rows, cols, blockSize) {
        if (rows !== undefined && rows !== null && rows > 0) {
            this.rowCount = rows;
        } else {
            console.alert("rowCount defaulted to 200.");
            this.rowCount = 200;
        }

        if (cols !== undefined && cols !== null && cols > 0) {
            this.colCount = cols;
        } else {
            console.alert("colCount defaulted to 100.");
            this.colCount = 100;
        }
        
        if (blockSize !== undefined && blockSize !== null && blockSize > 0) {
            this.blockSize = blockSize;
        } else {
            console.alert("blockSize defaulted to 16.");
            blockSize = 16;
        }
    }

    /**
     * Load the terrain from a file.
     * TODO
     */
    loadTerrain() {
        alert('loadTerrain Not Implemented');
    }

    /**
     * Generates a stalagmight or stalagtight at a given location
     */
    generateStalag(midgroundData, init_row, init_col, end_row, end_col, is_big, is_tight){
        if(is_big){
            if(is_tight){
                let row = init_row;
                let col = init_col;
                midgroundData[row][col] = Block.roughStone;
                col++;

                if(col == end_col || row + 1 == end_row){
                    return 6;
                }

                midgroundData[row][col] = Block.roughStone;
                midgroundData[row + 1][col] = Block.roughStone;

                col++;
                if(col == end_col || row + 2 == end_row){
                    return 6;
                }
                midgroundData[row][col] = Block.roughStone;
                midgroundData[row + 1][col] = Block.roughStone;
                midgroundData[row + 2][col] = Block.roughStone;

                col++;
                if(col == end_col || row + 1 == end_row){
                    return 6;
                }
                midgroundData[row][col] = Block.roughStone;
                midgroundData[row + 1][col] = Block.roughStone;

                col++;
                if(col == end_col || row == end_row){
                    return 6;
                }
                midgroundData[row][col] = Block.roughStone;

                return 6;
            }
            else{
                let row = end_row - 1;
                let col = init_col;
                midgroundData[row][col] = Block.roughStone;
                col++;
                if(col == this.colCount || row - 1 == this.rowCount){
                    return 6;
                }

                midgroundData[row][col] = Block.roughStone;
                midgroundData[row - 1][col] = Block.roughStone;

                col++;
                if(col == this.colCount || row - 2 == this.rowCount){
                    return 6;
                }

                midgroundData[row][col] = Block.roughStone;
                midgroundData[row - 1][col] = Block.roughStone;
                midgroundData[row - 2][col] = Block.roughStone;

                col++;
                if(col == this.colCount || row - 1 == this.rowCount){
                    return 6;
                }

                midgroundData[row][col] = Block.roughStone;
                midgroundData[row - 1][col] = Block.roughStone;

                col++;
                if(col == this.colCount || row == this.rowCount){
                    return 6;
                }

                midgroundData[row][col] = Block.roughStone;
 
                return 6;
            }
        }
        else{
            //is small
            if(is_tight){
                let row = init_row;
                let col = init_col;
                midgroundData[row][col] = Block.roughStone;
                col++;

                if(col == end_col || row + 1 == end_row){
                    return 3;
                }

                midgroundData[row][col] = Block.roughStone;
                midgroundData[row + 1][col] = Block.roughStone;

                col++;
                if(col == end_col || row == end_row){
                    return 3;
                }
                midgroundData[row][col] = Block.roughStone;

                return 3;
            }
            else{
                let row = end_row - 1;
                let col = init_col;
                midgroundData[row][col] = Block.roughStone;
                col++;

                if(col == end_col || row - 1 == end_row){
                    return 3;
                }

                midgroundData[row][col] = Block.roughStone;
                midgroundData[row - 1][col] = Block.roughStone;

                col++;
                if(col == end_col || row == end_row){
                    return 3;
                }
                midgroundData[row][col] = Block.roughStone;

                return 3;
            }
        }
    }

    /**
     * Generate cave with top left of cave being the starting index
     */
    generateCave(midgroundData, init_row, init_col){
        let end_row = init_row + 6 > this.rowCount ? this.rowCount : init_row + 6;
        let end_col = init_col + 25 > this.colCount ? this.colCount : init_col + 25;

        //create open rectangle
        for (let row = init_row; row < end_row ; ++row) {
            for (let col = init_col; col < end_col; ++col) {
                midgroundData[row][col] = Block.air;
            }
        }

        //add stalagmites and stalagtights
        let extra_space = false;
        let is_tight = false;
        let is_big = false;

        if(Math.floor(Math.random() * 2) == 1){
            extra_space = true;
        }

        for (let col = init_col; col < end_col; ++col) {
            //check for extra space
            if(extra_space){
                ++col;
                extra_space = false;
            }
            //determine if stalagmite or stalagtight
            if(Math.floor(Math.random() * 2) == 1){ // is stalagtight
                is_tight = true;
            }
            else{
                is_tight = false;
            }

            //determine if big or small
            if(Math.floor(Math.random() * 2) == 1){ // is big
                is_big = true;
            }
            else{
                is_big = false;
            }

            col = col + this.generateStalag(midgroundData, init_row, col, end_row, end_col, is_big, is_tight);

        }
    }

    /**
     * Generate tier of ground from starting row to end row
     */
    generateTier(midgroundData, top_row, bot_row, dirt_percent, iron_percent, gold_percent, emerald_percent){
        let dirt = dirt_percent;
        let iron = dirt_percent + iron_percent;
        let gold = dirt_percent + iron_percent + gold_percent;
        let emerald = dirt_percent + iron_percent + gold_percent + emerald_percent;

        let sum = 0;
        let rand = 0;
        let cave = 0;

        //generate ground

        for (let row = top_row; row < bot_row ; ++row) {
            for (let col = 0; col < this.colCount; ++col) {
                // console.log("row: ", row);
                // console.log("col: ", col);
                sum = 0;
                rand = Math.floor(Math.random() * 1000);
                
                sum = dirt_percent;
                if (rand >=0 && rand <= dirt){
                    midgroundData[row][col] = Block.roughStone;
                }
                else if(rand > dirt && rand <= iron){
                    midgroundData[row][col] = Block.iron;
                }
                else if(rand > iron && rand <= gold){
                    midgroundData[row][col] = Block.gold;
                }
                else{
                    midgroundData[row][col] = Block.emerald;
                }
            }
        }

        for (let row = top_row; row < bot_row ; ++row) {
            for (let col = 0; col < this.colCount; ++col) {
                cave = Math.floor(Math.random() * 9000);

                if(cave >=0 && cave < 3){
                    this.generateCave(midgroundData, row, col);
                }
            }
        }
        
    }

    /**
     * Generate the foreground data with a mix of procedural generation
     * and map design. The foreground uses the midground data to place
     * certain elements.
     */
    generateForeground(midgroundData) {
        return [
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1]
        ];
    }
    
    /**
     * Generate the midground data with a mix of procedural generation
     * and map design.
     */

    /*    
    */

    generateMidground() {
        let midgroundData = new Array(this.rowCount);

        //top layer of air and has dwarf hut on it
        for (let row = 0; row < this.rowCount; ++row) {
            midgroundData[row] = new Array(this.colCount);
            // Every this is air at first
            for (let col = 0; col < this.colCount; ++col) {
                midgroundData[row][col] = Block.air;
            }
        }

        // Grass layer layer 9
        for (let row = 9; row < 10; ++row) {
            for (let col = 0; col < this.colCount; ++col) {
                // this.Block at 0 to 3 are grass variations
                midgroundData[row][col] = getGrassBlock();
            }
        }

        // Ground layer for testing 10-200 layers)
        /*
        - separate (3) tiers
        - generate clusteers
        - create caverns
        */
        // for (let row = 10; row < this.rowCount; ++row) {
        //     for (let col = 0; col < this.colCount; ++col) {
        //         midgroundData[row][col] = Block.smoothStone;
        //     }
        // }

        //tier 1
        // this.generateTier(midgroundData, 10, this.rowCount, 925, 55, 15, 5);

        //tier 2
        this.generateTier(midgroundData, 10, this.rowCount, 895, 75, 20, 10);

        // // Temporary test tunnel
        // for (let col = 3; col < 10; ++col)
        //     midgroundData[15][col] = Block.air;

        return midgroundData;
    }

    /**
     * Generate the background data with a mix of procedural generation
     * and map design. The background uses the midground data to place
     * certain elements.
     */
    generateBackground(midgroundData) {
        return [
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1]
        ];
    }

    /**
     * Generate terrain data from scratch. This will generate and populate the data
     * for all three internal Arrays.
     */
    generateTerrain() {
        this.midgroundData = this.generateMidground();
        this.backgroundData = this.generateBackground(this.midgroundData);
        this.foregroundData = this.generateForeground(this.midgroundData);
    }

    /**
     * Creates a LayerData object populated with the given matrix data.
     * This object is to be used when a new DynamicTilemapLayer is created.
     * Code adapted from Phaser.js source.
     * @param {Array} tileIndexMatrix A 2D Array of Numbers representing Tile indexes.
     * @param {Boolean} insertNull If true, null is used for empty spaces, else a Tile with index -1 is created.
     * @param {String} name The name of the layer.
     */
    createLayerData(tileIndexMatrix, insertNull, name) {
        let layerData = new Phaser.Tilemaps.LayerData({
            tileWidth: this.blockSize,
            tileHeight: this.blockSize
        });
        let tiles = [];

        let width = 0, height = tileIndexMatrix.length;
        for (let row = 0; row < height; ++row) {
            tiles[row] = [];
            let matrixRow = tileIndexMatrix[row];
    
            for (let col = 0; col < matrixRow.length; ++col) {
                let tileIndex = parseInt(matrixRow[col], 10);
    
                if (isNaN(tileIndex) || tileIndex === -1) {
                    tiles[row][col] = insertNull
                        ? null
                        : new Phaser.Tilemaps.Tile(layerData, -1, col, row, this.blockSize, this.blockSize);
                } else {
                    tiles[row][col] = new Phaser.Tilemaps.Tile(layerData, tileIndex, col, row, this.blockSize, this.blockSize);
                }
            }

            if (width === 0) {
                width = matrixRow.length;
            }

        }
        layerData.name = name;
        layerData.data = tiles;
        layerData.width = width;
        layerData.height = height;
        layerData.widthInPixels = width * this.blockSize;
        layerData.heightInPixels = height * this.blockSize;
        return layerData;
    }

    /**
     * Creates a MapData object to be used to instantiate a Tilemap object (class Terrain).
     * Precondition: This TerrainBuilder must have its internal Arrays populated either
     * by loading through a file or by generating from scratch.
     */
    createMapData() {
        var mapData = new Phaser.Tilemaps.MapData({
            name: name,
            tileWidth: this.blockSize,
            tileHeight: this.blockSize,
            format: Phaser.Tilemaps.Formats.ARRAY_2D,
            layers: [
                this.createLayerData(this.backgroundData, false, 'background'),
                this.createLayerData(this.midgroundData, false, 'midground'),
                this.createLayerData(this.foregroundData, false, 'foreground'),
            ]
        });
    
        // Use midground numbers
        mapData.width = this.midgroundData.width;
        mapData.height = this.midgroundData.height;
        mapData.widthInPixels = this.midgroundData.widthInPixels;
        mapData.heightInPixels = this.midgroundData.heightInPixels;
        return mapData;
    }
}

/**
 * Creates a Tilemap from a 2D array. Similar to the original Tilemap
 * functionality but offers game-specific functionality.
 */
class Terrain extends Phaser.Tilemaps.Tilemap {
    constructor(scene, mapData) {
        super(scene, mapData);

        // Initialize counter for auto-incrementing GID
        this.tileCount = 0;
    }

    /**
    * Same functionality as addTilesetImage but auto-increments and internal counter.
    * This auto-increments the firstGID of the Tileset to the next available value.
    */
    addTilesetImage2(tilesetName, key, tileWidth, tileHeight, tileMargin, tileSpacing) {
        this.tileCount += this.addTilesetImage(
            tilesetName, key, tileWidth, tileHeight, tileMargin, tileSpacing, this.tileCount
        ).total;
    }

    /**
     * Creates three DynamicTilemapLayers based on the mapData set during instantiation.
     */
    createDynamicLayers() {
        // Background
        this.background = this.createDynamicLayer('background', this.tilesets, 0, 0);

        // Midground
        this.midground = this.createDynamicLayer('midground', this.tilesets, 0, 0);
        this.midground.setCollisionByExclusion(Block.air, true);

        // Foreground
        this.foreground = this.createDynamicLayer('foreground', this.tilesets, 0, 0);
    }
}

export { Terrain, TerrainBuilder };