/**
 * Active Contributor:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * 
 * Past Contributors:
 * Brandon Xue (brandonx@csu.fullerton.edu)
 * Ernesto Hooghkirk (Ernesto_Hooghkirk@csu.fullerton.edu)
 * 
 * Last maintained (YYMMDD): YYMMDD
 * 
 * This file contains code for the TitleScene Phaser.Scene class.
 * This scene will be the first screen that the player sees when they
 * open the game.
 */

import Phaser from '../phaser';

import titleBg from '../../assets/bkg-title-screen.jpg';
import titleMusic from '../../assets/audio/Simon-Swerwer-Emergence.mp3';

 /**
  * The entering scene of the program.
  */
class TitleScene extends Phaser.Scene {
    init(gameSceneKey) {
        this.gameSceneKey = gameSceneKey;
    }

    /**
     * Use this function to load any assets. This function comes after init().
     */
    preload() {
        this.load.image('titleCaveBackground', titleBg); //'assets/bkg-title-screen.jpg'
        this.load.audio('title-screen-audio', titleMusic); //'assets/audio/Simon-Swerwer-Emergence.mp3'
    }

    /**
     * This function typically contains the bulk of the setup code.
     * This function comes after preload().
     */
    create() {
        this.music = this.sound.add('title-screen-audio');
        this.music.play();
        this.sound.volume = .2;

        //adding background image
        const bgImage = this.add.image(0, 0, 'titleCaveBackground').setOrigin(0, 0);
        
        // Set the physics world boundaries
        this.physics.world.setBounds(0, 0, 2000, 8000);

        this.title = this.add.text(
            this.game.canvas.width / 2, // x-position of text
            this.game.canvas.height / 2, // y-position of text
            'Durin\'s Demise', // Text content
            {
                fontFamily: 'Helvetiva, Georgia, Verdana',
                fontSize: 50,
                shadowFill: true,
                shadowColor: '#00f',
                shadowStroke: '#00f',
                shadowBlur: 20,
                shadowOffsetX: 10,
                shadowOffsetY: 10
            }
        );
        this.title.setOrigin(0.5, 0.5);
        
        this.playButtonText = this.add.text(
            this.game.canvas.width / 2, // x-position of text
            this.game.canvas.height / 1.6, // y-position of text
            'Start New Game', // Text content
            { // Style object, see: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.TextStyle.html
                fontFamily: 'Helvetica, Georgia, Verdana',
                fontSize: 32,
                backgroundColor: '#821'
            }
        );

        // Note that setters return the object, so you can cascade them
        this.playButtonText.setOrigin(0.5, 0.5).setInteractive();
        this.playButtonText.on('pointerdown', () => this.onPlayClick());
        this.playButtonText.on('pointerover', () => this.onPlayHover());
        this.playButtonText.on('pointerout', () => this.onPlayPointerOut());
    }

    /**
     * This function is called once per game step. In the case of our menu,
     * we can add animations here if we have time.
     */
    update() {
        
    }

    onPlayClick() {
        this.music.stop();
        this.scene.start(this.gameSceneKey);
    }

    onPlayHover() {
        this.playButtonText.setStyle({
            color: '#aaa'
        });
    }

    onPlayPointerOut() {
        this.playButtonText.setStyle({
            color: '#fff'
        });
    }
}

export default TitleScene;