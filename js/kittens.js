// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 375;
var GAME_HEIGHT = 500;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 100;
var MAX_ENEMIES = 3;

var BONUS_WIDTH = 75;
var BONUS_HEIGHT = 75;
var MAX_BONUS = 1;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 54;
var PLAYER_LIVES = 3;

var LIVE_WIDTH = 20;
var LIVE_HEIGHT = 20;

// var BULLET_WIDTH = 10;
// var BULLET_HEIGHT = 10;
// var MAX_BULLETS = 2;

// These two constants keep us from using "magic numbers" in our code
var Q_CODE = 81;
var D_CODE = 68;
var Z_CODE = 90;
var S_CODE = 83;
var SPACE_CODE = 32;
var ENTER_CODE = 13;

// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var MOVE_UP = "up";
var MOVE_DOWN = "down";
var KEY_SPACE = "space";



// Preload game images
var images = {};
['enemy.png', 'stars.png', 'player.png', 'live.png', 'live1.png', 'live2.png', 'snake.png', 'stone2.png', 'coin.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});


var music0 = document.getElementById("audioPlayer");
var contact = document.getElementById("collision");
var lose = document.getElementById("lose");
var coin = document.getElementById("coin");
this.music0.volume = 0.5;






// This section is where you will be doing most of your coding
class Entity {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}

class Bonus extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -BONUS_HEIGHT;
        this.speed = 0.5;
        this.sprite = images['coin.png']
    }
    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

class Enemy extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.speed = Math.random() / 2 + 0.25;
        if(this.speed < 0.65 && this.speed > 0.54) {
            this.sprite = images['enemy.png'];
        }else if(this.speed <0.55 ) {
            this.sprite = images['stone2.png'];
            
        }else if(this.speed > 0.64) {
            this.sprite = images['snake.png'];
        }
        // Each enemy should have a different speed 
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

class Lives extends Entity {
    constructor() {
        super();
        this.x = LIVE_WIDTH;
        this.y = LIVE_HEIGHT;
        this.sprite = images['live.png'];
    }
}

// class Bullets extends Entity {
//     constructor(xPos, yPos) {
//         super();
//         this.x = xPos;
//         this.y = yPos;
//         this.sprite = images['bullet.png'];
//         this.speed = 0.25;
//     }
//     update(timeDiff) {
//         this.y = this.y + timeDiff * this.speed;
//     }
// }

class Player extends Entity {
    constructor() {
        super();
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['player.png'];
    }


    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }
        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        }
        else if (direction === MOVE_UP && this.y > PLAYER_HEIGHT) {
            this.y = this.y - PLAYER_HEIGHT;
        }
        else if (direction === MOVE_DOWN && this.y < GAME_HEIGHT - PLAYER_HEIGHT * 2) {
            this.y = this.y + PLAYER_HEIGHT;
        }
    }
}


/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();

        // Setup the lives
        this.lives = new Lives();

        // Setup enemies, making sure there are always three
        this.setupEnemies();

        // Setup bullets
        // this.setupBullets();

        //Setup bonus
        this.setupBonus();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    setupBonus() {
        if (!this.bonus) {
            this.bonus = [];
        }

        while (this.bonus.filter(e => !!e).length < MAX_BONUS) {
            this.addBonus();
        }
    }

    // setupBullets() {
    //     if(!this.bullets) {
    //         this.bullets = []
    //     }
    //         this.addBullets();
    // }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH;

        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (!enemySpots || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }

        this.enemies[enemySpot] = new Enemy((enemySpot) * ENEMY_WIDTH);
    }

    addBonus() {
        var bonusSpots = GAME_WIDTH / BONUS_WIDTH;

        var bonusSpot;
        // Keep looping until we find a free enemy spot at random
        while (!bonusSpots || this.bonus[bonusSpot]) {
            bonusSpot = Math.floor(Math.random() * bonusSpots);
        }

        this.bonus[bonusSpot] = new Bonus((bonusSpot) * BONUS_WIDTH);
    }

    // addBullets() {
    //     var bulletSpots = this.player.x;
    //     var bulletSpot;
    //     if(!bulletSpots) {
    //         this.bullets[bulletSpot] = new Bullets(this.player.x, this.player.y);
    //        }
        
    // }
      
    

    // This method kicks off the game
    start() {
        
        this.score = 0;
        this.lastFrame = Date.now();
        // this.ctx.fillText('PRESS SPACE TO PLAY', 20, 300);
        // document.addEventListener("keydown", f => {
        //     if (f.keyCode === SPACE_CODE) {
                
        //     }
        // });
        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === Q_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === D_CODE) {
                this.player.move(MOVE_RIGHT);
            }
            else if (e.keyCode === Z_CODE) {
                this.player.move(MOVE_UP);
            }
            else if (e.keyCode === S_CODE) {
                this.player.move(MOVE_DOWN);
            }
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        this.contact = contact;
        this.music0 = music0;
        this.lose = lose;
        this.coin = coin;
        
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));
        this.bonus.forEach(bon => bon.update(timeDiff));
        // this.bullets.forEach(bullet => bullet.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images['stars.png'], 0, 0); // draw the star bg
         
        this.enemies.forEach(enemy => enemy.render(this.ctx));// draw the enemies
        this.bonus.forEach(bon => bon.render(this.ctx));
        this.player.render(this.ctx); // draw the player
        // this.bullets.forEach(bullet => bullet.render(this.ctx));


        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();

        this.bonus.forEach((bon, bonusIdx) => {
            if (bon.y > GAME_HEIGHT) {
                delete this.bonus[bonusIdx];
            }
        });
        this.setupBonus();

        // Check if any bullet should die
        // this.bullets.forEach((bullet, bulletIdx) => {
        //     if (bullet.y < GAME_HEIGHT) {
        //         delete this.bullet[bulletIdx];
        //     }
        // });
        // this.setupBullets();

        // Check if player is dead
        if (this.isPlayerDead() && PLAYER_LIVES < 1) {
            // If they are dead, then it's game over!
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#6F2F15';
            this.ctx.fillText("SCORE: " + this.score, 115, 200);
            this.ctx.fillText('GAME OVER', 120, 100);
            this.playAgain();
            this.music0.pause();
            this.lose.play();

        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#6F2F15';
            this.ctx.fillText(this.score, 5, 30);
            for(var i = 0; i < 5; i++) {
                if(this.bonus[i] !== undefined && this.player.x === this.bonus[i].x && (this.bonus[i].y + BONUS_HEIGHT) > this.player.y && !(this.bonus[i].y > this.player.y)) {
                    this.score += 1000;
                    this.coin.play();
                    delete this.bonus[i];
                   
                }
            }
            if(PLAYER_LIVES === 3) {
                this.ctx.drawImage(images['live.png'], 10, 50)
                this.ctx.drawImage(images['live1.png'], 60, 50)
                this.ctx.drawImage(images['live2.png'], 110, 50)
            } else if(PLAYER_LIVES === 2) {
                this.ctx.drawImage(images['live.png'], 10, 50)
                this.ctx.drawImage(images['live1.png'], 60, 50)
                
                
            } else {
                this.ctx.drawImage(images['live.png'], 10, 50)
                
            }
            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

        

    isPlayerDead() {
        for(var i = 0; i < 5; i++) {
            if(this.enemies[i] !== undefined && this.player.x === this.enemies[i].x && (this.enemies[i].y + ENEMY_HEIGHT) > this.player.y && !(this.enemies[i].y > this.player.y)) {
                this.contact.play();
                PLAYER_LIVES--;
                delete this.enemies[i];
                return true;  
            }
        }
        return false;      
    }


    playAgain() {
        this.ctx.fillText('PRESS SPACE TO PLAY AGAIN', 20, 350);
        document.addEventListener("keydown", f => {
            if (f.keyCode === SPACE_CODE) {
                location.reload();
            }
        });
    }

    
}





// This section will start the game
function startGame() {
    var gameEngine = new Engine(document.getElementById('app'));
    gameEngine.start();    
}

startGame();

