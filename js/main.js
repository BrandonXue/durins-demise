/*
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * This script sets up the Phser.Game object with a configuration,
 * Registers game Scenes, and launches the title Scene.
 */

// Phaser required config dictionary
var config = {
    type: Phaser.AUTO, // Let Phaser determine if WebGL or canvas

    width: 800, // Width of phaser viewport
    height: 600, // Height of phaser viewport
    parent: 'phaser-container',

    // There are two types of physics in Phaser 3: Arcade and Matter.
    // See: https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.ArcadePhysics.html 
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: true
        }
    }
};

// Create Phaser Game using config object.
var phaserGame = new Phaser.Game(config);

// Register Scenes to a key
phaserGame.scene.add('title-screen', TitleScene);
phaserGame.scene.add('game-screen', GameScene);

// Start the scene with key == 'title-screen'
phaserGame.scene.start('title-screen');