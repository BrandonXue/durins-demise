/**
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * This file contains a dictionary used to look up
 * Tile indexes for the blocks in the terrain.
 * 
 * For map generation, you can use the getter functions to get
 * variations of a block at pre-defined frequencies.
 * 
 * Frequencies can easily be adjusted below by changing the number
 * that appears next to each block type.
 * 
 * You get also check whether a block belongs to a certain type,
 * which may be useful if we want breaking terrain to generate
 * items.
 */

/**
 * Indices for various block sprites
 */
const Block = {
    'air': -1,
    'grassPlain': 0,
    'grassBony': 1,
    'grassBloody': 2,
    'grassRocky': 3,
    'dirtPlain': 4,
    'dirtWavy': 5,
    'dirtBony': 6,
    'dirtRocky': 7,
    'roughStone': 8,
    'smoothStone': 9,
    'iron': 10,
    'coal': 11,
    'diamond': 12,
    'gold': 13,
    'emerald': 14,
    'sapphire': 15,
    'copper': 16,
    'ruby': 17
}
Object.freeze(Block);


/*          GRASS           */
const grassTypes = [
    [Block.grassPlain, 8],
    [Block.grassBony, 1],
    [Block.grassBloody, 2],
    [Block.grassRocky, 5]
]
function getGrassBlock() { return weightedSample(grassTypes); }
function isGrassBlock(blockIndex) { return checkBlockType(blockIndex, grassTypes) };

/*          DIRT            */
const dirtTypes = [
    [Block.dirtPlain, 8],
    [Block.dirtWavy, 3],
    [Block.dirtBony, 1],
    [Block.dirtRocky, 5]
]
function getDirtBlock() { return weightedSample(dirtTypes); }
function isDirtBlock(blockIndex) { return checkBlockType(blockIndex, dirtTypes) };




/**
 * Generic function for performing a weighted sample on a block type.
 * @param {Array} typesWithWeights An Array of Arrays.
 *      Each sub-array contains a block index and a frequency.
 *      Frequency can be an integer or a float. Any number works,
 *      frequencies are relative to the other frequencies in the Array.
 */
function weightedSample(typesWithWeights) {
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
 * Generic function to check whether a block belongs to a certain type
 * @param {Number} blockIndex Must be an index from the Block dictionary.
 * @param {Array} type An Array of Arrays. The first element in each
 *      sub-array must be from the Block dictionary.
 */
function checkBlockType(blockIndex, type) {
    for (let i = 0; i < type.length; ++i) {
        if (blockIndex == type[i][0]) {
            return true;
        }
    }
    return false;
}