```javascript
// ============================================================
// COIN RUSH - VERSION 3
// ============================================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d", {
        alpha: false
    });


// ============================================================
// UI
// ============================================================

const startScreen =
    document.getElementById("startScreen");

const pauseScreen =
    document.getElementById("pauseScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const pauseButton =
    document.getElementById("pauseButton");

const resumeButton =
    document.getElementById("resumeButton");

const scoreDisplay =
    document.getElementById("scoreDisplay");

const coinDisplay =
    document.getElementById("coinDisplay");

const bestDisplay =
    document.getElementById("bestDisplay");

const livesDisplay =
    document.getElementById("livesDisplay");

const levelDisplay =
    document.getElementById("levelDisplay");

const finalScore =
    document.getElementById("finalScore");

const finalCoins =
    document.getElementById("finalCoins");

const finalBest =
    document.getElementById("finalBest");

const finalCombo =
    document.getElementById("finalCombo");

const powerMessage =
    document.getElementById("powerMessage");

const comboDisplay =
    document.getElementById("comboDisplay");

const shieldStatus =
    document.getElementById("shieldStatus");

const boostStatus =
    document.getElementById("boostStatus");

const magnetStatus =
    document.getElementById("magnetStatus");

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");


// ============================================================
// CANVAS
// ============================================================

function resizeCanvas() {

    canvas.width =
        canvas.clientWidth;

    canvas.height =
        canvas.clientHeight;

    if (!gameRunning) {

        player.x =
            canvas.width / 2 -
            player.width / 2;

        player.y =
            canvas.height - 120;
    }
}

window.addEventListener(
    "resize",
    resizeCanvas
);


// ============================================================
// GAME STATE
// ============================================================

let gameRunning = false;

let gamePaused = false;

let score = 0;

let coinsCollected = 0;

let lives = 3;

let level = 1;

let gameSpeed = 4;

let roadOffset = 0;

let coinTimer = 0;

let obstacleTimer = 0;

let powerTimer = 0;

let animationId = null;

let lastTime = 0;

const MAX_DELTA = 32;


// ============================================================
// POWER-UPS
// ============================================================

let shieldActive = false;

let boostActive = false;

let magnetActive = false;

let shieldTime = 0;

let boostTime = 0;

let magnetTime = 0;


// ============================================================
// COMBO
// ============================================================

let combo = 0;

let maxCombo = 0;

let comboTimer = 0;

const COMBO_DURATION = 150;


// ============================================================
// BEST SCORE
// ============================================================

let bestScore =
    Number(
        localStorage.getItem(
            "coinRushBest"
        )
    ) || 0;

bestDisplay.textContent =
    bestScore;


// ============================================================
// PLAYER
// ============================================================

const player = {

    width: 45,

    height: 65,

    x: 0,

    y: 0,

    speed: 430,

    movingLeft: false,

    movingRight: false
};


// ============================================================
// OBJECT ARRAYS
// ============================================================

const coins = [];

const obstacles = [];

const powerUps = [];

const particles = [];


// ============================================================
// AUDIO
// ============================================================

let audioContext = null;


function initAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }
}


function playSound(
    frequency,
    duration = 0.08,
    type = "sine"
) {

    if (!audioContext) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        0.07,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime +
        duration
    );

    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime +
        duration
    );
}


// ============================================================
// START GAME
// ============================================================

function startGame() {

    initAudio();

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {

        audioContext.resume();
    }

    startScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    score = 0;

    coinsCollected = 0;

    lives = 3;

    level = 1;

    gameSpeed = 4;

    roadOffset = 0;

    coinTimer = 0;

    obstacleTimer = 0;

    powerTimer = 0;

    combo = 0;

    maxCombo = 0;

    comboTimer = 0;

    shieldActive = false;

    boostActive = false;

    magnetActive = false;

    shieldTime = 0;

    boostTime = 0;

    magnetTime = 0;

    player.movingLeft = false;

    player.movingRight = false;

    coins.length = 0;

    obstacles.length = 0;

    powerUps.length = 0;

    particles.length = 0;

    player.x =
        canvas.width / 2 -
        player.width / 2;

    player.y =
        canvas.height - 120;

    gameRunning = true;

    gamePaused = false;

    updateUI();

    hidePowerStatuses();

    updateComboUI();

    lastTime =
        performance.now();

    cancelAnimationFrame(
        animationId
    );

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


// ============================================================
// PAUSE
// ============================================================

function pauseGame() {

    if (!gameRunning) return;

    gamePaused = true;

    player.movingLeft = false;

    player.movingRight = false;

    pauseScreen.classList.remove(
        "hidden"
    );
}


function resumeGame() {

    if (!gameRunning) return;

    gamePaused = false;

    pauseScreen.classList.add(
        "hidden"
    );

    lastTime =
        performance.now();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


// ============================================================
// GAME OVER
// ============================================================

function endGame() {

    gameRunning = false;

    gamePaused = false;

    player.movingLeft = false;

    player.movingRight = false;

    if (
        score >
        bestScore
    ) {

        bestScore = score;

        localStorage.setItem(
            "coinRushBest",
            bestScore
        );
    }

    finalScore.textContent =
        score;

    finalCoins.textContent =
        coinsCollected;

    finalBest.textContent =
        bestScore;

    finalCombo.textContent =
        maxCombo;

    bestDisplay.textContent =
        bestScore;

    gameOverScreen.classList.remove(
        "hidden"
    );

    playSound(
        120,
        0.4,
        "sawtooth"
    );
}


// ============================================================
// UI
// ============================================================

function updateUI() {

    scoreDisplay.textContent =
        score;

    coinDisplay.textContent =
        coinsCollected;

    bestDisplay.textContent =
        bestScore;

    livesDisplay.textContent =
        lives;

    levelDisplay.textContent =
        level;
}


// ============================================================
// PLAYER DRAW
// ============================================================

function drawPlayer() {

    const px =
        player.x;

    const py =
        player.y;


    // Shield ring

    if (shieldActive) {

        ctx.beginPath();

        ctx.arc(
            px +
            player.width / 2,

            py +
            player.height / 2,

            45,

            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(56, 189, 248, 0.9)";

        ctx.lineWidth = 4;

        ctx.stroke();
    }


    // Body

    ctx.fillStyle =
        "#3b82f6";

    ctx.fillRect(
        px,
        py,
        player.width,
        player.height
    );


    // Shirt

    ctx.fillStyle =
        "#1d4ed8";

    ctx.fillRect(
        px + 8,
        py + 8,
        player.width - 16,
        10
    );


    // Head

    ctx.fillStyle =
        "#f5cfa0";

    ctx.beginPath();

    ctx.arc(
        px +
        player.width / 2,

        py - 5,

        20,

        0,
        Math.PI * 2
    );

    ctx.fill();


    // Hair

    ctx.fillStyle =
        "#3f2d20";

    ctx.beginPath();

    ctx.arc(
        px +
        player.width / 2,

        py - 15,

        18,

        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle =
        "#111827";

    ctx.beginPath();

    ctx.arc(
        px + 17,
        py - 8,
        3,
        0,
        Math.PI * 2
    );

    ctx.arc(
        px + 28,
        py - 8,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Boost flame

    if (boostActive) {

        ctx.fillStyle =
            "#f97316";

        ctx.beginPath();

        ctx.moveTo(
            px + 10,
            py + player.height
        );

        ctx.lineTo(
            px + 18,
            py +
            player.height +
            25
        );

        ctx.lineTo(
            px + 23,
            py + player.height
        );

        ctx.fill();


        ctx.fillStyle =
            "#facc15";

        ctx.beginPath();

        ctx.moveTo(
            px + 24,
            py + player.height
        );

        ctx.lineTo(
            px + 30,
            py +
            player.height +
            18
        );

        ctx.lineTo(
            px + 35,
            py + player.height
        );

        ctx.fill();
    }
}


// ============================================================
// CREATE COIN
// ============================================================

function createCoin() {

    const radius = 13;

    // 15% chance of golden coin

    const golden =
        Math.random() < 0.15;

    coins.push({

        x:
            Math.random() *
            (
                canvas.width -
                radius * 2
            ) +
            radius,

        y: -30,

        radius,

        speed:
            gameSpeed +
            1,

        rotation: 0,

        golden
    });
}


// ============================================================
// UPDATE COINS
// ============================================================

function updateCoins(delta) {

    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];

        coin.y +=
            coin.speed *
            delta;

        coin.rotation +=
            7 *
            delta;


        // Magnet effect

        if (magnetActive) {

            const dx =
                player.x +
                player.width / 2 -
                coin.x;

            const dy =
                player.y +
                player.height / 2 -
                coin.y;

            const distanceSq =
                dx * dx +
                dy * dy;

            const magnetRange = 180;

            if (
                distanceSq <
                magnetRange *
                magnetRange
            ) {

                coin.x +=
                    dx *
                    delta *
                    5;

                coin.y +=
                    dy *
                    delta *
                    5;
            }
        }


        if (
            coin.y >
            canvas.height + 50
        ) {

            coins.splice(i, 1);
        }
    }
}


// ============================================================
// DRAW COINS
// ============================================================

function drawCoins() {

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.font =
        "bold 13px Arial";


    for (
        const coin of coins
    ) {

        const scale =
            Math.max(
                Math.abs(
                    Math.cos(
                        coin.rotation
                    )
                ),
                0.15
            );

        ctx.save();

        ctx.translate(
            coin.x,
            coin.y
        );

        ctx.scale(
            scale,
            1
        );


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );


        if (coin.golden) {

            ctx.fillStyle =
                "#fbbf24";

        } else {

            ctx.fillStyle =
                "#facc15";
        }

        ctx.fill();


        ctx.fillStyle =
            coin.golden
                ? "#78350f"
                : "#92400e";


        ctx.fillText(
            coin.golden
                ? "★"
                : "$",
            0,
            0
        );


        ctx.restore();
    }
}


// ============================================================
// CREATE OBSTACLE
// ============================================================

function createObstacle() {

    const width =
        35 +
        Math.random() *
        35;

    const height =
        35 +
        Math.random() *
        35;

    obstacles.push({

        x:
            Math.random() *
            (
                canvas.width -
                width
            ),

        y:
            -height,

        width,

        height,

        speed:
            gameSpeed +
            Math.random() *
            1.5,

        rotation:
            Math.random() *
            Math.PI
    });
}


// ============================================================
// UPDATE OBSTACLES
// ============================================================

function updateObstacles(delta) {

    for (
        let i =
            obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle =
            obstacles[i];

        obstacle.y +=
            obstacle.speed *
            delta;

        obstacle.rotation +=
            0.9 *
            delta;


        if (
            obstacle.y >
            canvas.height +
            100
        ) {

            obstacles.splice(i, 1);
        }
    }
}


// ============================================================
// DRAW OBSTACLES
// ============================================================

function drawObstacles() {

    for (
        const obstacle of obstacles
    ) {

        const centerX =
            obstacle.x +
            obstacle.width / 2;

        const centerY =
            obstacle.y +
            obstacle.height / 2;

        ctx.save();

        ctx.translate(
            centerX,
            centerY
        );

        ctx.rotate(
            obstacle.rotation
        );

        ctx.fillStyle =
            "#ef4444";

        ctx.fillRect(
            -obstacle.width / 2,
            -obstacle.height / 2,
            obstacle.width,
            obstacle.height
        );

        ctx.fillStyle =
            "#7f1d1d";

        ctx.fillRect(
            -obstacle.width / 2 + 8,
            -obstacle.height / 2 + 8,
            obstacle.width - 16,
            obstacle.height - 16
        );

        ctx.restore();
    }
}


// ============================================================
// CREATE POWER-UP
// ============================================================

function createPowerUp() {

    const random =
        Math.random();

    let type;

    if (random < 0.34) {

        type = "shield";

    } else if (random < 0.67) {

        type = "boost";

    } else {

        type = "magnet";
    }


    powerUps.push({

        x:
            Math.random() *
            (
                canvas.width - 40
            ) +
            20,

        y: -40,

        radius: 18,

        type,

        speed:
            gameSpeed +
            0.5,

        rotation: 0
    });
}


// ============================================================
// UPDATE POWER-UPS
// ============================================================

function updatePowerUps(delta) {

    for (
        let i =
            powerUps.length - 1;
        i >= 0;
        i--
    ) {

        const power =
            powerUps[i];

        power.y +=
            power.speed *
            delta;

        power.rotation +=
            3.5 *
            delta;


        if (
            power.y >
            canvas.height +
            60
        ) {

            powerUps.splice(i, 1);
        }
    }
}


// ============================================================
// DRAW POWER-UPS
// ============================================================

function drawPowerUps() {

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.font =
        "bold 17px Arial";


    for (
        const power of powerUps
    ) {

        ctx.save();

        ctx.translate(
            power.x,
            power.y
        );

        ctx.rotate(
            power.rotation
        );


        if (
            power.type ===
            "shield"
        ) {

            ctx.fillStyle =
                "#38bdf8";

            ctx.beginPath();

            ctx.moveTo(
                0,
                -18
            );

            ctx.lineTo(
                15,
                -10
            );

            ctx.lineTo(
                11,
                10
            );

            ctx.lineTo(
                0,
                18
            );

            ctx.lineTo(
                -11,
                10
            );

            ctx.lineTo(
                -15,
                -10
            );

            ctx.closePath();

            ctx.fill();

            ctx.fillStyle =
                "white";

            ctx.fillText(
                "S",
                0,
                1
            );


        } else if (
            power.type ===
            "boost"
        ) {

            ctx.fillStyle =
                "#f97316";

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                17,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "white";

            ctx.fillText(
                "⚡",
                0,
                1
            );


        } else {

            // Magnet

            ctx.fillStyle =
                "#c084fc";

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                18,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "white";

            ctx.fillText(
                "🧲",
                0,
                1
            );
        }

        ctx.restore();
    }
}


// ============================================================
// COLLISION
// ============================================================

function isColliding(
    a,
    b
) {

    return (

        a.x <
        b.x + b.width &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.height &&

        a.y + a.height >
        b.y
    );
}


// ============================================================
// COIN COLLECTION
// ============================================================

function collectCoins() {

    const playerCenterX =
        player.x +
        player.width / 2;

    const playerCenterY =
        player.y +
        player.height / 2;


    for (
        let i =
            coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];

        const dx =
            playerCenterX -
            coin.x;

        const dy =
            playerCenterY -
            coin.y;

        const radius =
            coin.radius +
            player.width / 2;

        if (
            dx * dx +
            dy * dy <
            radius * radius
        ) {

            coins.splice(i, 1);

            coinsCollected++;

            // Combo

            combo++;

            comboTimer =
                COMBO_DURATION;

            if (
                combo >
                maxCombo
            ) {

                maxCombo =
                    combo;
            }


            let points =
                coin.golden
                    ? 25
                    : 10;


            // Combo bonus

            if (
                combo >= 5
            ) {

                points +=
                    Math.min(
                        combo * 2,
                        30
                    );
            }


            score +=
                points;


            createParticles(
                coin.x,
                coin.y,
                coin.golden
                    ? 14
                    : 8
            );


            playSound(
                coin.golden
                    ? 1000
                    : 700,

                0.08,

                "square"
            );


            if (
                combo === 5 ||
                combo === 10 ||
                combo === 20
            ) {

                showPowerMessage(
                    "🔥 COMBO x" +
                    combo
                );
            }


            updateUI();

            updateComboUI();
        }
    }
}


// ============================================================
// POWER-UP COLLECTION
// ============================================================

function collectPowerUps() {

    const playerCenterX =
        player.x +
        player.width / 2;

    const playerCenterY =
        player.y +
        player.height / 2;


    for (
        let i =
            powerUps.length - 1;
        i >= 0;
        i--
    ) {

        const power =
            powerUps[i];

        const dx =
            playerCenterX -
            power.x;

        const dy =
            playerCenterY -
            power.y;

        const radius =
            power.radius +
            player.width / 2;


        if (
            dx * dx +
            dy * dy <
            radius * radius
        ) {

            powerUps.splice(i, 1);


            if (
                power.type ===
                "shield"
            ) {

                shieldActive =
                    true;

                shieldTime =
                    600;

                showPowerMessage(
                    "🛡️ SHIELD ACTIVATED!"
                );

                playSound(
                    500,
                    0.2,
                    "sine"
                );


            } else if (
                power.type ===
                "boost"
            ) {

                boostActive =
                    true;

                boostTime =
                    480;

                showPowerMessage(
                    "⚡ SPEED BOOST!"
                );

                playSound(
                    900,
                    0.2,
                    "square"
                );


            } else {

                magnetActive =
                    true;

                magnetTime =
                    540;

                showPowerMessage(
                    "🧲 MAGNET ACTIVATED!"
                );

                playSound(
                    750,
                    0.2,
                    "triangle"
                );
            }

            updatePowerStatus();
        }
    }
}


// ============================================================
// OBSTACLE COLLISION
// ============================================================

function checkObstacleCollision() {

    for (
        let i =
            obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle =
            obstacles[i];


        if (
            isColliding(
                player,
                obstacle
            )
        ) {

            obstacles.splice(
                i,
                1
            );


            if (
                shieldActive
            ) {

                shieldActive =
                    false;

                shieldTime =
                    0;

                createParticles(
                    player.x +
                    player.width / 2,

                    player.y +
                    player.height / 2,

                    18
                );

                showPowerMessage(
                    "🛡️ SHIELD SAVED YOU!"
                );

                playSound(
                    350,
                    0.15,
                    "square"
                );

                updatePowerStatus();

                return;
            }


            lives--;

            combo = 0;

            comboTimer = 0;

            updateComboUI();


            createParticles(
                player.x +
                player.width / 2,

                player.y +
                player.height / 2,

                18
            );


            playSound(
                150,
                0.2,
                "sawtooth"
            );


            updateUI();


            if (
                lives <= 0
            ) {

                endGame();

                return;
            }


            // Push player

            player.x +=
                player.x <
                canvas.width / 2
                    ? 40
                    : -40;


            player.x =
                Math.max(
                    0,

                    Math.min(
                        canvas.width -
                        player.width,

                        player.x
                    )
                );


            return;
        }
    }
}


// ============================================================
// UPDATE PLAYER
// ============================================================

function updatePlayer(delta) {

    let currentSpeed =
        player.speed;


    if (
        boostActive
    ) {

        currentSpeed *=
            1.8;
    }


    if (
        player.movingLeft
    ) {

        player.x -=
            currentSpeed *
            delta;
    }


    if (
        player.movingRight
    ) {

        player.x +=
            currentSpeed *
            delta;
    }


    if (
        player.x < 0
    ) {

        player.x = 0;
    }


    if (
        player.x +
        player.width >
        canvas.width
    ) {

        player.x =
            canvas.width -
            player.width;
    }
}


// ============================================================
// POWER TIMERS
// ============================================================

function updatePowerTimers(
    delta
) {

    if (
        shieldActive
    ) {

        shieldTime -=
            delta * 60;

        if (
            shieldTime <= 0
        ) {

            shieldTime = 0;

            shieldActive =
                false;

            showPowerMessage(
                "🛡️ SHIELD ENDED"
            );
        }
    }


    if (
        boostActive
    ) {

        boostTime -=
            delta * 60;

        if (
            boostTime <= 0
        ) {

            boostTime = 0;

            boostActive =
                false;

            showPowerMessage(
                "⚡ BOOST ENDED"
            );
        }
    }


    if (
        magnetActive
    ) {

        magnetTime -=
            delta * 60;

        if (
            magnetTime <= 0
        ) {

            magnetTime = 0;

            magnetActive =
                false;

            showPowerMessage(
                "🧲 MAGNET ENDED"
            );
        }
    }


    updatePowerStatus();
}


// ============================================================
// POWER STATUS UI
// ============================================================

function updatePowerStatus() {

    shieldStatus.classList.toggle(
        "hidden",
        !shieldActive
    );

    boostStatus.classList.toggle(
        "hidden",
        !boostActive
    );

    magnetStatus.classList.toggle(
        "hidden",
        !magnetActive
    );
}


function hidePowerStatuses() {

    shieldStatus.classList.add(
        "hidden"
    );

    boostStatus.classList.add(
        "hidden"
    );

    magnetStatus.classList.add(
        "hidden"
    );
}


// ============================================================
// POWER MESSAGE
// ============================================================

let powerMessageTimer =
    null;


function showPowerMessage(
    message
) {

    powerMessage.textContent =
        message;

    powerMessage.classList.add(
        "show"
    );


    clearTimeout(
        powerMessageTimer
    );


    powerMessageTimer =
        setTimeout(
            () => {

                powerMessage.classList.remove(
                    "show"
                );

            },
            1200
        );
}


// ============================================================
// COMBO UI
// ============================================================

function updateComboUI() {

    if (
        combo > 1
    ) {

        comboDisplay.textContent =
            "🔥 COMBO x" +
            combo;

        comboDisplay.classList.add(
            "show"
        );

    } else {

        comboDisplay.classList.remove(
            "show"
        );
    }
}


function updateCombo(delta) {

    if (
        combo <= 0
    ) {
        return;
    }


    comboTimer -=
        delta * 60;


    if (
        comboTimer <= 0
    ) {

        combo = 0;

        comboTimer = 0;

        updateComboUI();
    }
}


// ============================================================
// PARTICLES
// ============================================================

function createParticles(
    x,
    y,
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        particles.push({

            x,

            y,

            vx:
                (
                    Math.random() -
                    0.5
                ) * 6,

            vy:
                (
                    Math.random() -
                    0.5
                ) * 6,

            life:
                30 +
                Math.random() *
                20,

            size:
                2 +
                Math.random() *
                4
        });
    }
}


function updateParticles(
    delta
) {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.vx *
            delta *
            60;


        particle.y +=
            particle.vy *
            delta *
            60;


        particle.vy +=
            0.08 *
            delta *
            60;


        particle.life -=
            delta *
            60;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}


function drawParticles() {

    for (
        const particle of particles
    ) {

        ctx.globalAlpha =
            particle.life /
            50;

        ctx.fillStyle =
            "#facc15";

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    ctx.globalAlpha = 1;
}


// ============================================================
// BACKGROUND
// ============================================================

function drawBackground(
    delta
) {

    ctx.fillStyle =
        "#374151";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    roadOffset +=
        gameSpeed *
        delta *
        60;


    if (
        roadOffset > 50
    ) {

        roadOffset %= 50;
    }


    // Center road lines

    ctx.fillStyle =
        "#9ca3af";


    for (
        let y =
            -50 +
            roadOffset;

        y <
        canvas.height;

        y += 100
    ) {

        ctx.fillRect(

            canvas.width / 2 -
            5,

            y,

            10,

            50
        );
    }


    // Side lines

    ctx.fillStyle =
        "#facc15";


    ctx.fillRect(
        10,
        0,
        5,
        canvas.height
    );


    ctx.fillRect(
        canvas.width - 15,
        0,
        5,
        canvas.height
    );
}


// ============================================================
// SCORE + LEVEL
// ============================================================

let scoreTimer = 0;


function updateScore(
    delta
) {

    scoreTimer +=
        delta;


    if (
        scoreTimer >=
        1 / 60
    ) {

        score++;

        scoreTimer = 0;

        scoreDisplay.textContent =
            score;
    }


    const newLevel =
        Math.floor(
            score / 500
        ) + 1;


    if (
        newLevel !== level
    ) {

        level =
            newLevel;


        gameSpeed =
            4 +
            (level - 1) *
            0.5;


        showPowerMessage(
            "🔥 LEVEL " +
            level
        );


        playSound(
            600,
            0.2,
            "triangle"
        );


        updateUI();
    }
}


// ============================================================
// GAME LOOP
// ============================================================

function gameLoop(
    currentTime
) {

    if (
        !gameRunning ||
        gamePaused
    ) {

        return;
    }


    let delta =
        currentTime -
        lastTime;


    lastTime =
        currentTime;


    delta =
        Math.min(
            delta,
            MAX_DELTA
        ) / 1000;


    // Clear

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Background

    drawBackground(
        delta
    );


    // Player

    updatePlayer(
        delta
    );

    drawPlayer();


    // ========================================================
    // COINS
    // ========================================================

    coinTimer +=
        delta *
        60;


    const coinSpawnRate =
        Math.max(
            25,
            58 -
            level * 2
        );


    if (
        coinTimer >=
        coinSpawnRate
    ) {

        createCoin();

        coinTimer = 0;
    }


    updateCoins(
        delta
    );

    collectCoins();

    drawCoins();


    // ========================================================
    // OBSTACLES
    // ========================================================

    obstacleTimer +=
        delta *
        60;


    const obstacleSpawnRate =
        Math.max(
            42,
            88 -
            level * 3
        );


    if (
        obstacleTimer >=
        obstacleSpawnRate
    ) {

        createObstacle();

        obstacleTimer = 0;
    }


    updateObstacles(
        delta
    );

    checkObstacleCollision();

    drawObstacles();


    // ========================================================
    // POWER-UPS
    // ========================================================

    powerTimer +=
        delta *
        60;


    // First power-up after
    // approximately 11.5 seconds

    if (
        powerTimer >=
        690
    ) {

        createPowerUp();

        powerTimer = 0;
    }


    updatePowerUps(
        delta
    );

    collectPowerUps();

    drawPowerUps();


    // ========================================================
    // PARTICLES
    // ========================================================

    updateParticles(
        delta
    );

    drawParticles();


    // ========================================================
    // TIMERS
    // ========================================================

    updatePowerTimers(
        delta
    );

    updateCombo(
        delta
    );


    // ========================================================
    // SCORE
    // ========================================================

    updateScore(
        delta
    );


    // Continue

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


// ============================================================
// KEYBOARD CONTROLS
// ============================================================

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            event.preventDefault();

            player.movingLeft =
                true;
        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {

            event.preventDefault();

            player.movingRight =
                true;
        }


        // Pause with P or Escape

        if (
            key === "p" ||
            key === "escape"
        ) {

            event.preventDefault();

            if (
                gameRunning
            ) {

                if (
                    gamePaused
                ) {

                    resumeGame();

                } else {

                    pauseGame();
                }
            }
        }
    }
);


document.addEventListener(
    "keyup",
    function(event) {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            player.movingLeft =
                false;
        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {

            player.movingRight =
                false;
        }
    }
);


// ============================================================
// MOBILE CONTROLS
// ============================================================

function startMovingLeft(
    event
) {

    event.preventDefault();

    player.movingLeft =
        true;
}


function stopMovingLeft(
    event
) {

    event.preventDefault();

    player.movingLeft =
        false;
}


function startMovingRight(
    event
) {

    event.preventDefault();

    player.movingRight =
        true;
}


function stopMovingRight(
    event
) {

    event.preventDefault();

    player.movingRight =
        false;
}


leftButton.addEventListener(
    "pointerdown",
    startMovingLeft
);

leftButton.addEventListener(
    "pointerup",
    stopMovingLeft
);

leftButton.addEventListener(
    "pointercancel",
    stopMovingLeft
);

leftButton.addEventListener(
    "pointerleave",
    stopMovingLeft
);


rightButton.addEventListener(
    "pointerdown",
    startMovingRight
);

rightButton.addEventListener(
    "pointerup",
    stopMovingRight
);

rightButton.addEventListener(
    "pointercancel",
    stopMovingRight
);

rightButton.addEventListener(
    "pointerleave",
    stopMovingRight
);


// ============================================================
// BUTTONS
// ============================================================

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


pauseButton.addEventListener(
    "click",
    function() {

        if (!gameRunning) return;

        if (gamePaused) {

            resumeGame();

        } else {

            pauseGame();
        }
    }
);


resumeButton.addEventListener(
    "click",
    resumeGame
);


// ============================================================
// VISIBILITY
// ============================================================

// Automatically pause if the player
// switches browser tabs.

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.hidden &&
            gameRunning &&
            !gamePaused
        ) {

            pauseGame();
        }
    }
);


// ============================================================
// INITIALIZE
// ============================================================

resizeCanvas();

updateUI();

updatePowerStatus();

updateComboUI();
```
