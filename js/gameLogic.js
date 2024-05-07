// Space war - Script!

// Programado por MegaStick. (Fabricio Isaac Gutiérrez Moreno)


// _____ ______   _______   ________  ________  ________  _________  ___  ________  ___  __       
// |\   _ \  _   \|\  ___ \ |\   ____\|\   __  \|\   ____\|\___   ___\\  \|\   ____\|\  \|\  \     
// \ \  \\\__\ \  \ \   __/|\ \  \___|\ \  \|\  \ \  \___|\|___ \  \_\ \  \ \  \___|\ \  \/  /|_   
// \ \  \\|__| \  \ \  \_|/_\ \  \  __\ \   __  \ \_____  \   \ \  \ \ \  \ \  \    \ \   ___  \  
//  \ \  \    \ \  \ \  \_|\ \ \  \|\  \ \  \ \  \|____|\  \   \ \  \ \ \  \ \  \____\ \  \\ \  \ 
//   \ \__\    \ \__\ \_______\ \_______\ \__\ \__\____\_\  \   \ \__\ \ \__\ \_______\ \__\\ \__\
//    \|__|     \|__|\|_______|\|_______|\|__|\|__|\_________\   \|__|  \|__|\|_______|\|__| \|__|
//                                                \|_________|                                    

//                                             ARCHIVO JS.

// Ingeniería TIC'S.


// Variables del juego:
// --------------------
let nave = document.querySelector('.nave'); // Selecciona el elemento que representa la nave
let body = document.querySelector('body'); // Selecciona el cuerpo del documento
let live = document.querySelector('i'); // Selecciona el elemento para mostrar las vidas
let times = document.getElementById('times'); // Selecciona el elemento para mostrar el tiempo
let scoreDisplay = document.getElementById('score'); // Selecciona el elemento para mostrar el puntaje
let highScoreDisplay = document.getElementById('highScore'); // Selecciona el elemento para mostrar el puntaje más alto
let lives = 5; // Inicia el jugador con 5 vidas
let second = 60; // Establece el tiempo de juego en 60 segundos
let score = 0; // Puntaje inicial del jugador
let highScore = localStorage.getItem('highScore') || 0; // Recupera el puntaje más alto del almacenamiento local o inicia en 0
let explosionSound = new Audio('audio/explosion.mp3'); // Carga el sonido de explosión
let isNaveActive = true; // Controla si la nave está activa para moverse y disparar
let isInvulnerable = false; // Controla si la nave es temporalmente invulnerable
// --------------------

// Función para reproducir la música de fondo al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    var audio = document.getElementById("bgm");

    function playAudio() {
        audio.play().catch(error => {
            console.log("La reproducción automática no fue permitida inicialmente: ", error);
            setTimeout(playAudio, 1000); // Intenta reproducir de nuevo automáticamente después de un segundo
        });
    }

    playAudio(); // Intenta reproducir el audio al cargar
});


// Muestra el puntaje y el puntaje más alto al cargar
scoreDisplay.textContent = `Score: ${score}`;
highScoreDisplay.textContent = `High Score: ${highScore}`;

// Timer de juego que decrementa el tiempo cada segundo y finaliza el juego al llegar a 0
setInterval(() => {
    second--;
    times.textContent = second;
    if (second == 0) {
        endGame(); // Finaliza el juego cuando el tiempo se acaba
    }
}, 1000);



// Controla el movimiento de la nave en respuesta al movimiento del mouse
document.addEventListener('mousemove', (e) => {
    if (isNaveActive) {
        nave.style.left = `${e.clientX - 40}px`;
    }
});

// Genera un disparo al hacer clic y reproduce el sonido del disparo
document.addEventListener('click', () => {
    if (isNaveActive) {
        let bala = document.createElement('div');
        bala.classList.add('bala');
        bala.style.top = `${window.innerHeight - 120}px`;
        bala.style.left = `${nave.getBoundingClientRect().left + 40}px`;
        body.append(bala);
        playSound('audio/laser.mp3');
    }
});

// Bucle principal del juego que se ejecuta en cada cuadro de animación
function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);
    let now = Date.now();
    if (!lastTime) lastTime = now;
    let deltaTime = now - lastTime;
    lastTime = now;

    moveBullets(deltaTime); // Mueve las balas en la pantalla
    moveEnemies(deltaTime); // Mueve los enemigos en la pantalla
    detectCollisions(); // Detecta colisiones entre balas y enemigos o la nave y enemigos
    updateUI(); // Actualiza la interfaz de usuario con las vidas y el puntaje
}

// Función para mover las balas en la pantalla y eliminarlas cuando salen del área visible
function moveBullets() {
    document.querySelectorAll('.bala').forEach(bala => {
        let newY = parseInt(bala.style.top) - 5;
        bala.style.top = `${newY}px`;
        if (newY <= 0) {
            bala.remove();
        }
    });
}

// Función para mover los enemigos hacia abajo en la pantalla y eliminarlos cuando pasan el área visible
function moveEnemies(deltaTime) {
    let moveAmount = 0.10 * deltaTime;
    let enemigos = document.querySelectorAll('.enemigo');
    enemigos.forEach(enemigo => {
        let newY = parseFloat(enemigo.style.top) + moveAmount;
        enemigo.style.top = `${newY}px`;
        if (newY > window.innerHeight) enemigo.remove();
    });
}

// Función para detectar colisiones entre la nave y los enemigos o las balas y los enemigos
function detectCollisions() {
    let balas = document.querySelectorAll('.bala');
    let enemigos = document.querySelectorAll('.enemigo');

    balas.forEach(bala => {
        enemigos.forEach(enemigo => {
            if (isCollision(bala, enemigo)) {
                handleCollision(bala, enemigo);
                incrementScore(10);
            }
        });
    });

    enemigos.forEach(enemigo => {
        if (isCollision(nave, enemigo) && !enemigo.hasCollided && !isInvulnerable) {
            handleNaveCollision(enemigo);
            enemigo.hasCollided = true;
        }
    });
}

// Verifica si dos objetos colisionan en la pantalla
function isCollision(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    return (
        aRect.top <= bRect.top + bRect.height &&
        aRect.top + aRect.height >= bRect.top &&
        aRect.left <= bRect.left + bRect.width &&
        aRect.left + aRect.width >= bRect.left
    );
}

// Maneja las colisiones entre balas y enemigos
function handleCollision(bala, enemigo) {
    enemigo.style.backgroundImage = 'url("img/explosion.png")';
    playSound('audio/explosion.mp3');
    setTimeout(() => {
        enemigo.remove();
    }, 100);
}

// Maneja las colisiones entre la nave y los enemigos
function handleNaveCollision(enemigo) {
    if (!isInvulnerable) {
        lives--;
        isNaveActive = false;
        playSound('audio/explosion.mp3');
        nave.style.backgroundImage = 'url("img/explosion.png")';
        setTimeout(() => {
            if (lives > 0) {
                nave.style.backgroundImage = 'url("../img/nave1.png")';
                nave.classList.add('respawn'); // Aplica la animación de respawn
                nave.style.left = 'calc(50vw - 40px)'; // Centra la nave horizontalmente
                setTimeout(() => {
                    isNaveActive = true;
                    makeInvulnerable();
                    nave.classList.remove('respawn'); // Remueve la clase después que la animación termine
                }, 1000); // Duración de la animación
            } else {
                alert("Game Ovah");
                location.reload();
            }
        }, 1000);
    }
}

// Hace la nave temporalmente invulnerable cuando respawnea
function makeInvulnerable() {
    isInvulnerable = true;
    nave.classList.add('invulnerable'); // Inicia la animación de invulnerabilidad
    setTimeout(() => {
        isInvulnerable = false;
        nave.classList.remove('invulnerable'); // Detiene la animación (Ya volverá a ser vulnerable el jugador)
    }, 3000);
}

// Incrementa el puntaje y actualiza la UI
function incrementScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = `High Score: ${highScore}`;
        localStorage.setItem('highScore', highScore);
    }
}

// Actualiza la interfaz de usuario mostrando las vidas restantes
function updateUI() {
    live.textContent = ` ${lives}`;
}

// Reproduce sonidos de efectos
function playSound(url) {
    if (url === 'audio/explosion.mp3' && !explosionSound.paused) {
        return;  // No reproduce el sonido si ya se está reproduciendo
    }
    const audio = new Audio(url);
    audio.play();
    if (url === 'audio/explosion.mp3') {
        explosionSound = audio;
    }
}

// Generar enemigos de manera periódica
let lastTime = 0;
let aparecer = 0;
setInterval(() => {
    aparecer++;
    if (aparecer % 10 == 0) {
        let enemigo = document.createElement('div');
        enemigo.classList.add('enemigo');
        body.append(enemigo);
        enemigo.style.left = `${Math.random() * (window.innerWidth - 100)}px`;
        enemigo.style.top = '0px';
        enemigo.hasCollided = false;
    }
}, 100);

// Finaliza el juego y reinicia según el resultado
function endGame() {
    let message = lives > 0 ? 'Se acabó el tiempo! Solo Sobreviviste' : 'Game Over';
    if (lives > 0 && score > highScore) {
        message = "Congrats, Ganaste!, superaste la nueva puntuación!";
    } else if (lives > 0) {
        message = "Ganaste pero solo sobreviviste! Ahora intenta superar la puntuación máxima!";
    }
    alert(message);
    location.reload();
}

 // Inicia el bucle principal del juego
requestAnimationFrame(gameLoop);