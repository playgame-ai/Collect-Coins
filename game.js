"use strict";

/*
===========================================================
COIN RUSH - VERSION 3
===========================================================

Original game code.
No external libraries.
No external images.
No external music.
No copyrighted characters/assets.

===========================================================
*/


// ========================================================
// CANVAS
// ========================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// ========================================================
// UI
// ========================================================

const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const bestEl = document.getElementById("best");

const finalScoreEl = document.getElementById("finalScore");
const finalCoinsEl = document.getElementById("finalCoins");
const finalBestEl = document.getElementById("finalBest");
const finalComboEl = document.getElementById("finalCombo");

const heartsEl = document.getElementById("hearts");

const boostBtn = document.getElementById("boostBtn");
const shieldBtn = document.getElementById("shieldBtn");

const boostBar = document.getElementById("boostBar");
const shieldBar = document.getElementById("shieldBar");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");


// ========================================================
// GAME VARIABLES
// ========================================================

let width = 0;
let height = 0;

let animationId = null;

let gameRunning = false;
let paused = false;

let lastTime = 0;


// ========================================================
// PLAYER
// ========================================================

const player = {

    x: 0,
    y: 0,

    width: 38,
    height: 50,

    speed: 280,

    targetX: 0,

    invincibleTimer: 0,

    shieldTimer: 0,

    boostTimer: 0
};


// ========================================================
// GAME STATE
// ========================================================

let score = 0;
let coinsCollected = 0;

let bestScore =
    Number(localStorage.getItem("coinRushBest")) || 0;

let totalCoins =
    Number(localStorage.getItem("coinRushCoins")) || 0;

let lives = 3;

let combo = 0;
let comboTimer = 0;

let distance = 0;


// ========================================================
// SPEED
// ========================================================

// IMPORTANT:
// The game starts deliberately slow.

const BASE_SPEED = 95;

let roadSpeed = BASE_SPEED;

const MAX_SPEED = 240;


// ========================================================
// POWER
// ========================================================

let boostEnergy = 0;
let shieldEnergy = 0;

const MAX_POWER = 100;

let boostActive = false;


// ========================================================
// OBJECT ARRAYS
// ========================================================

let coins = [];
let obstacles = [];
let particles = [];
let stars = [];


// ========================================================
// SPAWN TIMERS
// ========================================================

let coinTimer = 0;
let obstacleTimer = 0;


// ========================================================
// AUDIO
// ========================================================

let audioContext = null;


function initializeAudio() {

    if (!audioContext) {

        audioContext =
            new (window.AudioContext ||
                window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {

        audioContext.resume();
    }
}


function playSound(
    frequency,
    duration,
    type = "sine",
    volume = 0.05
) {

    if (!audioContext) {
        return;
    }

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


// ========================================================
// RESIZE
// ========================================================

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width =
        Math.floor(width * dpr);

    canvas.height =
        Math.floor(height * dpr);

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    if (!gameRunning) {

        player.x =
            width / 2;

        player.targetX =
            width / 2;

        player.y =
            height - 100;
    }
}


window.addEventListener(
    "resize",
    resizeCanvas
);


// ========================================================
// BACKGROUND STARS
// ========================================================

function createStars() {

    stars = [];

    for (let i = 0; i < 55; i++) {

        stars.push({

            x: Math.random() * width,

            y: Math.random() * height,

            size:
                Math.random() * 2 + 0.5,

            speed:
                Math.random() * 20 + 8,

            alpha:
                Math.random() * 0.5 + 0.2
        });
    }
}


// ========================================================
// RESET GAME
// ========================================================

function resetGame() {

    score = 0;
    coinsCollected = 0;

    lives = 3;

    combo = 0;
    comboTimer = 0;

    distance = 0;

    roadSpeed = BASE_SPEED;

    boostEnergy = 0;
    shieldEnergy = 0;

    boostActive = false;

    coinTimer = 0;
    obstacleTimer = 0;

    coins = [];
    obstacles = [];
    particles = [];

    player.invincibleTimer = 0;
    player.shieldTimer = 0;
    player.boostTimer = 0;

    player.x =
        width / 2;

    player.targetX =
        width / 2;

    player.y =
        height - 100;

    updateUI();
}


// ========================================================
// START GAME
// ========================================================

function startGame() {

    initializeAudio();

    resetGame();

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    pauseScreen.classList.add("hidden");

    paused = false;

    gameRunning = true;

    lastTime =
        performance.now();

    cancelAnimationFrame(animationId);

    animationId =
        requestAnimationFrame(gameLoop);

    playSound(
        500,
        0.12,
        "sine",
        0.04
    );
}


// ========================================================
// GAME OVER
// ========================================================

function endGame() {

    gameRunning = false;

    boostActive = false;

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "coinRushBest",
            bestScore
        );
    }

    localStorage.setItem(
        "coinRushCoins",
        totalCoins
    );

    finalScoreEl.textContent =
        Math.floor(score);

    finalCoinsEl.textContent =
        coinsCollected;

    finalBestEl.textContent =
        bestScore;

    finalComboEl.textContent =
        combo;

    gameOverScreen.classList.remove(
        "hidden"
    );

    playSound(
        150,
        0.35,
        "sawtooth",
        0.06
    );

    updateUI();
}


// ========================================================
// PAUSE
// ========================================================

function togglePause() {

    if (!gameRunning) {
        return;
    }

    paused = !paused;

    if (paused) {

        pauseScreen.classList.remove(
            "hidden"
        );

        pauseBtn.textContent = "▶";

    } else {

        pauseScreen.classList.add(
            "hidden"
        );

        pauseBtn.textContent = "II";

        lastTime =
            performance.now();
    }
}


// ========================================================
// PLAYER MOVEMENT
// ========================================================

function movePlayer(direction) {

    if (!gameRunning || paused) {
        return;
    }

    const movement =
        width * 0.17;

    player.targetX +=
        direction * movement;

    const margin =
        player.width / 2 + 10;

    player.targetX =
        Math.max(
            margin,
            Math.min(
                width - margin,
                player.targetX
            )
        );
}


// ========================================================
// KEYBOARD
// ========================================================

window.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            event.preventDefault();

            movePlayer(-1);
        }

        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            event.preventDefault();

            movePlayer(1);
        }

        if (
            event.key === " " ||
            event.key.toLowerCase() === "p"
        ) {

            event.preventDefault();

            togglePause();
        }

        if (
            event.key.toLowerCase() === "b"
        ) {

            activateBoost();
        }

        if (
            event.key.toLowerCase() === "s"
        ) {

            activateShield();
        }
    }
);


// ========================================================
// TOUCH CONTROLS
// ========================================================

canvas.addEventListener(
    "pointerdown",
    function(event) {

        if (!gameRunning || paused) {
            return;
        }

        initializeAudio();

        const rect =
            canvas.getBoundingClientRect();

        const touchX =
            event.clientX - rect.left;

        if (touchX < width / 2) {

            movePlayer(-1);

        } else {

            movePlayer(1);
        }
    }
);


// ========================================================
// BOOST
// ========================================================

function activateBoost() {

    if (
        !gameRunning ||
        paused ||
        boostActive ||
        boostEnergy < 100
    ) {

        return;
    }

    boostActive = true;

    player.boostTimer = 2.5;

    boostEnergy = 0;

    playSound(
        700,
        0.15,
        "square",
        0.05
    );
}


// ========================================================
// SHIELD
// ========================================================

function activateShield() {

    if (
        !gameRunning ||
        paused ||
        player.shieldTimer > 0 ||
        shieldEnergy < 100
    ) {

        return;
    }

    player.shieldTimer = 5;

    shieldEnergy = 0;

    playSound(
        400,
        0.2,
        "triangle",
        0.05
    );
}


// ========================================================
// CREATE COIN
// ========================================================

function spawnCoin() {

    const margin = 30;

    coins.push({

        x:
            margin +
            Math.random() *
            (width - margin * 2),

        y: -30,

        radius: 12,

        rotation:
            Math.random() * Math.PI,

        speed:
            roadSpeed +
            Math.random() * 15
    });
}


// ========================================================
// CREATE OBSTACLE
// ========================================================

function spawnObstacle() {

    const obstacleWidth =
        35 + Math.random() * 20;

    const obstacleHeight =
        35 + Math.random() * 25;

    const margin = 25;

    obstacles.push({

        x:
            margin +
            Math.random() *
            (width -
                margin * 2 -
                obstacleWidth),

        y:
            -obstacleHeight - 20,

        width:
            obstacleWidth,

        height:
            obstacleHeight,

        speed:
            roadSpeed +
            Math.random() * 20,

        rotation:
            Math.random() * 0.2 - 0.1
    });
}


// ========================================================
// PARTICLE
// ========================================================

function createParticles(
    x,
    y,
    amount = 10
) {

    for (let i = 0; i < amount; i++) {

        particles.push({

            x,
            y,

            vx:
                (Math.random() - 0.5) * 150,

            vy:
                (Math.random() - 0.5) * 150,

            life: 0.6,

            maxLife: 0.6,

            size:
                Math.random() * 4 + 2
        });
    }
}


// ========================================================
// COLLISION
// ========================================================

function rectanglesOverlap(
    a,
    b
) {

    return (
        a.x - a.width / 2 <
        b.x + b.width / 2 &&

        a.x + a.width / 2 >
        b.x - b.width / 2 &&

        a.y - a.height / 2 <
        b.y + b.height / 2 &&

        a.y + a.height / 2 >
        b.y - b.height / 2
    );
}


// ========================================================
// COIN COLLISION
// ========================================================

function collectCoins() {

    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];

        const dx =
            player.x - coin.x;

        const dy =
            player.y - coin.y;

        const distanceToCoin =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distanceToCoin <
            player.width / 2 +
            coin.radius
        ) {

            coins.splice(i, 1);

            coinsCollected++;

            totalCoins++;

            combo++;

            comboTimer = 2.5;

            score +=
                10 +
                combo * 2;

            boostEnergy =
                Math.min(
                    MAX_POWER,
                    boostEnergy + 12
                );

            shieldEnergy =
                Math.min(
                    MAX_POWER,
                    shieldEnergy + 8
                );

            createParticles(
                coin.x,
                coin.y,
                12
            );

            playSound(
                700 + combo * 20,
                0.08,
                "sine",
                0.035
            );
        }
    }
}


// ========================================================
// OBSTACLE COLLISION
// ========================================================

function checkObstacles() {

    const playerBox = {

        x: player.x,

        y: player.y,

        width:
            player.width - 10,

        height:
            player.height - 10
    };


    for (
        let i = obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle =
            obstacles[i];

        const obstacleBox = {

            x: obstacle.x,

            y: obstacle.y,

            width:
                obstacle.width,

            height:
                obstacle.height
        };


        if (
            rectanglesOverlap(
                playerBox,
                obstacleBox
            )
        ) {

            obstacles.splice(i, 1);

            createParticles(
                player.x,
                player.y,
                20
            );


            // SHIELD

            if (
                player.shieldTimer > 0
            ) {

                player.shieldTimer = 0;

                playSound(
                    900,
                    0.12,
                    "triangle",
                    0.05
                );

                continue;
            }


            // INVINCIBILITY

            if (
                player.invincibleTimer > 0
            ) {

                continue;
            }


            lives--;

            player.invincibleTimer =
                1.4;

            combo = 0;

            playSound(
                100,
                0.25,
                "square",
                0.06
            );

            updateUI();


            if (lives <= 0) {

                endGame();

                return;
            }
        }
    }
}


// ========================================================
// UPDATE
// ========================================================

function update(dt) {

    // ------------------------------------------
    // SPEED
    // ------------------------------------------

    distance +=
        roadSpeed * dt;

    // Very gradual speed increase.
    roadSpeed =
        Math.min(
            MAX_SPEED,
            BASE_SPEED +
            distance * 0.004
        );


    // ------------------------------------------
    // PLAYER
    // ------------------------------------------

    const followSpeed =
        8;

    player.x +=
        (
            player.targetX -
            player.x
        ) *
        Math.min(
            1,
            followSpeed * dt
        );


    // ------------------------------------------
    // INVINCIBILITY
    // ------------------------------------------

    if (
        player.invincibleTimer > 0
    ) {

        player.invincibleTimer -= dt;
    }


    // ------------------------------------------
    // SHIELD
    // ------------------------------------------

    if (
        player.shieldTimer > 0
    ) {

        player.shieldTimer -= dt;
    }


    // ------------------------------------------
    // BOOST
    // ------------------------------------------

    if (
        player.boostTimer > 0
    ) {

        player.boostTimer -= dt;

        if (
            player.boostTimer <= 0
        ) {

            boostActive = false;
        }
    }


    // ------------------------------------------
    // COMBO
    // ------------------------------------------

    if (comboTimer > 0) {

        comboTimer -= dt;

        if (
            comboTimer <= 0
        ) {

            combo = 0;
        }
    }


    // ------------------------------------------
    // SCORE
    // ------------------------------------------

    score +=
        roadSpeed *
        dt *
        0.045;


    // ------------------------------------------
    // SPAWN COINS
    // ------------------------------------------

    coinTimer -= dt;

    if (coinTimer <= 0) {

        spawnCoin();

        coinTimer =
            0.8 +
            Math.random() * 0.7;
    }


    // ------------------------------------------
    // SPAWN OBSTACLES
    // ------------------------------------------

    obstacleTimer -= dt;

    if (obstacleTimer <= 0) {

        spawnObstacle();

        // Slow obstacle spawning at first.

        obstacleTimer =
            Math.max(
                0.85,
                1.8 -
                distance * 0.00005
            );
    }


    // ------------------------------------------
    // COINS
    // ------------------------------------------

    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];

        coin.y +=
            coin.speed *
            dt;

        coin.rotation +=
            dt * 4;

        if (
            coin.y >
            height + 40
        ) {

            coins.splice(i, 1);
        }
    }


    // ------------------------------------------
    // OBSTACLES
    // ------------------------------------------

    for (
        let i = obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle =
            obstacles[i];

        const speedMultiplier =
            boostActive
                ? 1.7
                : 1;

        obstacle.y +=
            obstacle.speed *
            speedMultiplier *
            dt;

        if (
            obstacle.y >
            height + 80
        ) {

            obstacles.splice(i, 1);
        }
    }


    // ------------------------------------------
    // PARTICLES
    // ------------------------------------------

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];

        particle.x +=
            particle.vx * dt;

        particle.y +=
            particle.vy * dt;

        particle.life -= dt;

        if (
            particle.life <= 0
        ) {

            particles.splice(i, 1);
        }
    }


    // ------------------------------------------
    // POWER RECHARGE
    // ------------------------------------------

    if (!boostActive) {

        boostEnergy =
            Math.min(
                MAX_POWER,
                boostEnergy +
                dt * 1.5
            );
    }


    shieldEnergy =
        Math.min(
            MAX_POWER,
            shieldEnergy +
            dt * 1.1
        );


    collectCoins();

    checkObstacles();

    updateUI();
}


// ========================================================
// DRAW BACKGROUND
// ========================================================

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );

    gradient.addColorStop(
        0,
        "#101923"
    );

    gradient.addColorStop(
        1,
        "#060a10"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // ROAD

    const roadWidth =
        Math.min(
            width * 0.75,
            500
        );

    const roadLeft =
        (width - roadWidth) / 2;

    ctx.fillStyle =
        "#121a25";

    ctx.fillRect(
        roadLeft,
        0,
        roadWidth,
        height
    );


    // ROAD EDGES

    ctx.fillStyle =
        "#3b3420";

    ctx.fillRect(
        roadLeft,
        0,
        5,
        height
    );

    ctx.fillRect(
        roadLeft + roadWidth - 5,
        0,
        5,
        height
    );


    // ROAD LINES

    const lineWidth = 8;

    const lineHeight = 55;

    const gap = 65;

    const offset =
        (
            distance *
            0.65
        ) %
        (lineHeight + gap);

    ctx.fillStyle =
        "#293342";

    for (
        let y =
            -lineHeight +
            offset;

        y < height;

        y +=
            lineHeight +
            gap
    ) {

        ctx.fillRect(
            width / 2 - lineWidth / 2,
            y,
            lineWidth,
            lineHeight
        );
    }


    // STARS

    for (
        const star of stars
    ) {

        star.y +=
            star.speed *
            0.016;

        if (
            star.y >
            height
        ) {

            star.y = -5;

            star.x =
                Math.random() *
                width;
        }

        ctx.globalAlpha =
            star.alpha;

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}


// ========================================================
// DRAW PLAYER
// ========================================================

function drawPlayer() {

    if (
        player.invincibleTimer > 0 &&
        Math.floor(
            player.invincibleTimer * 12
        ) % 2 === 0
    ) {

        return;
    }


    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    // SHIELD

    if (
        player.shieldTimer > 0
    ) {

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            40,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "#55d9ff";

        ctx.lineWidth = 4;

        ctx.shadowBlur = 15;

        ctx.shadowColor =
            "#55d9ff";

        ctx.stroke();

        ctx.shadowBlur = 0;
    }


    // PLAYER BODY

    ctx.fillStyle =
        "#2d8cff";

    ctx.beginPath();

    ctx.roundRect(
        -19,
        -25,
        38,
        50,
        9
    );

    ctx.fill();


    // PLAYER TOP

    ctx.fillStyle =
        "#53b4ff";

    ctx.beginPath();

    ctx.roundRect(
        -13,
        -19,
        26,
        14,
        5
    );

    ctx.fill();


    // FACE

    ctx.fillStyle =
        "#07111e";

    ctx.beginPath();

    ctx.arc(
        -7,
        -4,
        3,
        0,
        Math.PI * 2
    );

    ctx.arc(
        7,
        -4,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // BODY LIGHT

    ctx.fillStyle =
        "#1d6ec9";

    ctx.fillRect(
        -12,
        8,
        24,
        8
    );


    // BOOST FLAME

    if (boostActive) {

        ctx.fillStyle =
            "#ffd21c";

        ctx.beginPath();

        ctx.moveTo(
            -9,
            25
        );

        ctx.lineTo(
            0,
            42 +
            Math.random() * 8
        );

        ctx.lineTo(
            9,
            25
        );

        ctx.closePath();

        ctx.fill();

        ctx.fillStyle =
            "#ff772b";

        ctx.beginPath();

        ctx.moveTo(
            -5,
            25
        );

        ctx.lineTo(
            0,
            35 +
            Math.random() * 5
        );

        ctx.lineTo(
            5,
            25
        );

        ctx.closePath();

        ctx.fill();
    }


    ctx.restore();
}


// ========================================================
// DRAW COIN
// ========================================================

function drawCoin(coin) {

    ctx.save();

    ctx.translate(
        coin.x,
        coin.y
    );

    const scale =
        Math.abs(
            Math.cos(
                coin.rotation
            )
        );

    ctx.scale(
        Math.max(
            0.25,
            scale
        ),
        1
    );


    // outer circle

    ctx.fillStyle =
        "#f5b900";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        coin.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // inner circle

    ctx.fillStyle =
        "#ffd83d";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        coin.radius - 3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // center symbol

    ctx.fillStyle =
        "#d89b00";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        "$",
        0,
        1
    );

    ctx.restore();
}


// ========================================================
// DRAW OBSTACLE
// ========================================================

function drawObstacle(obstacle) {

    ctx.save();

    ctx.translate(
        obstacle.x,
        obstacle.y
    );

    ctx.rotate(
        obstacle.rotation
    );


    ctx.fillStyle =
        "#9d3041";

    ctx.beginPath();

    ctx.roundRect(
        -obstacle.width / 2,
        -obstacle.height / 2,
        obstacle.width,
        obstacle.height,
        6
    );

    ctx.fill();


    ctx.strokeStyle =
        "#e04459";

    ctx.lineWidth = 4;

    ctx.stroke();


    ctx.fillStyle =
        "#141923";

    ctx.beginPath();

    ctx.roundRect(
        -obstacle.width / 2 + 7,
        -obstacle.height / 2 + 7,
        obstacle.width - 14,
        obstacle.height - 14,
        3
    );

    ctx.fill();

    ctx.restore();
}


// ========================================================
// DRAW PARTICLES
// ========================================================

function drawParticles() {

    for (
        const particle of particles
    ) {

        ctx.globalAlpha =
            particle.life /
            particle.maxLife;

        ctx.fillStyle =
            "#ffd21c";

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


// ========================================================
// DRAW BOOST EFFECT
// ========================================================

function drawBoostEffect() {

    if (!boostActive) {
        return;
    }

    ctx.save();

    ctx.globalAlpha = 0.16;

    ctx.fillStyle =
        "#ffd21c";

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const x =
            Math.random() *
            width;

        const y =
            Math.random() *
            height;

        ctx.fillRect(
            x,
            y,
            2,
            30 +
            Math.random() * 30
        );
    }

    ctx.restore();
}


// ========================================================
// DRAW
// ========================================================

function draw() {

    drawBackground();

    drawBoostEffect();


    for (
        const coin of coins
    ) {

        drawCoin(coin);
    }


    for (
        const obstacle of obstacles
    ) {

        drawObstacle(obstacle);
    }


    drawPlayer();

    drawParticles();
}


// ========================================================
// GAME LOOP
// ========================================================

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }


    const delta =
        Math.min(
            (timestamp - lastTime) /
            1000,
            0.033
        );

    lastTime =
        timestamp;


    if (!paused) {

        update(delta);

        draw();
    }


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


// ========================================================
// UI UPDATE
// ========================================================

function updateUI() {

    scoreEl.textContent =
        Math.floor(score);

    coinsEl.textContent =
        totalCoins;

    bestEl.textContent =
        bestScore;


    // HEARTS

    let hearts = "";

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        hearts +=
            i < lives
                ? "❤️ "
                : "🖤 ";
    }

    heartsEl.textContent =
        hearts;


    // POWER

    boostBar.style.width =
        `${boostEnergy}%`;

    shieldBar.style.width =
        `${shieldEnergy}%`;


    // BUTTON STATES

    boostBtn.style.opacity =
        boostEnergy >= 100
            ? "1"
            : "0.65";

    shieldBtn.style.opacity =
        shieldEnergy >= 100
            ? "1"
            : "0.65";
}


// ========================================================
// BUTTON EVENTS
// ========================================================

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);

pauseBtn.addEventListener(
    "click",
    togglePause
);

resumeBtn.addEventListener(
    "click",
    togglePause
);

boostBtn.addEventListener(
    "click",
    function() {

        initializeAudio();

        activateBoost();
    }
);

shieldBtn.addEventListener(
    "click",
    function() {

        initializeAudio();

        activateShield();
    }
);


// ========================================================
// INITIALIZE
// ========================================================

function initializeGame() {

    resizeCanvas();

    createStars();

    bestEl.textContent =
        bestScore;

    coinsEl.textContent =
        totalCoins;

    player.x =
        width / 2;

    player.targetX =
        width / 2;

    player.y =
        height - 100;

    draw();

    updateUI();
}


initializeGame();
