// ========================================
// ELEMENTOS
// ========================================
const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const points = document.getElementById("points");
const gameOverScreen = document.getElementById("gameOver");
const restartButton = document.getElementById("restart");
const levelText = document.getElementById("levelText");
const xpText = document.getElementById("xpText");
const xpProgress = document.getElementById("xpProgress");
const characterGrid = document.getElementById("characterGrid");

const settingsButton = document.getElementById("settingsButton");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const saveProgress = document.getElementById("saveProgress");
const makeBackup = document.getElementById("makeBackup");
const restoreBackup = document.getElementById("restoreBackup");
const resetProgress = document.getElementById("resetProgress");
const backupFile = document.getElementById("backupFile");

const attributePoints = document.getElementById("attributePoints");
const availablePointsText = document.getElementById("availablePointsText");
const xpMultiplierText = document.getElementById("xpMultiplierText");
const addPoint = document.getElementById("addPoint");
const removePoint = document.getElementById("removePoint");

// ========================================
// PROGRESSÃO
// NÍVEL 1 -> 2 = 500 XP
// NÍVEL 2 -> 3 = 1000 XP
// ...
// NÍVEL 49 -> 50 = 24500 XP
// ========================================
const MAX_LEVEL = 50;

let xp = Number(localStorage.getItem("dinoXP")) || 0;
let level = Number(localStorage.getItem("dinoLevel")) || 1;
let selectedDino = localStorage.getItem("dinoCharacter") || "img/DINO-VERDE.PNG";

// Cada nível subido concede 2 pontos.
// Cada ponto investido dá +10% de XP recebido.
let availableAttributePoints = Number(localStorage.getItem("dinoAttributePoints")) || 0;
let xpAttributePoints = Number(localStorage.getItem("dinoXPAttributePoints")) || 0;

// JOGO
let score = 0;
let jumping = false;
let gameRunning = true;

// CACTO
let cactusX = 900;
let cactusSpeed = 6;
let lastTime = performance.now();

// ========================================
// XP NECESSÁRIO
// ========================================
function getRequiredXP() {
    return level * 500;
}

// ========================================
// CRIA OS 50 PERSONAGENS
// 01 e 02 liberados.
// 03-50 bloqueados até nível 50.
// Para adicionar imagens depois:
// data-dino="img/DINO-AZUL.PNG"
// ========================================
function createCharacters() {
    characterGrid.innerHTML = "";

    for (let i = 1; i <= 50; i++) {
        const number = String(i).padStart(2, "0");
        const character = document.createElement("div");

        character.className = "character";
        character.dataset.number = number;

        if (i === 1) {
            character.dataset.dino = "img/DINO-VERDE.PNG";
            character.innerHTML = `
                <img src="img/DINO-VERDE.PNG" alt="Dino Verde">
                <span class="characterNumber">01</span>
            `;
        } else if (i === 2) {
            character.dataset.dino = "img/DINO-VERMELHO.PNG";
            character.innerHTML = `
                <img src="img/DINO-VERMELHO.PNG" alt="Dino Vermelho">
                <span class="characterNumber">02</span>
            `;
        } else {
            character.classList.add("locked");
            character.innerHTML = `
                🔒
                <span class="characterNumber">${number}</span>
            `;
        }

        character.addEventListener("click", () => selectCharacter(character));
        characterGrid.appendChild(character);
    }

    updateCharacters();
}

function selectCharacter(character) {
    if (character.classList.contains("locked")) {
        alert("🔒 Este personagem está bloqueado!\n\nChegue ao nível 50 para liberar todos os dinos.");
        return;
    }

    const image = character.dataset.dino;
    if (!image) {
        alert("🦖 Personagem ainda não configurado.");
        return;
    }

    selectedDino = image;
    dino.src = image;

    document.querySelectorAll(".character").forEach(item => {
        item.classList.remove("selected");
    });

    character.classList.add("selected");
    saveGame();
}

function updateCharacters() {
    document.querySelectorAll(".character").forEach(character => {
        const number = Number(character.dataset.number);

        if (number <= 2 || level >= MAX_LEVEL) {
            character.classList.remove("locked");
        } else {
            character.classList.add("locked");
        }

        character.classList.remove("selected");

        if (character.dataset.dino === selectedDino && !character.classList.contains("locked")) {
            character.classList.add("selected");
        }
    });
}

// ========================================
// XP
// ========================================
function updateXP() {
    if (level >= MAX_LEVEL) {
        level = MAX_LEVEL;
        levelText.textContent = "Nível 50";
        xpText.textContent = "MAX";
        xpProgress.style.width = "100%";
        updateCharacters();
        return;
    }

    const requiredXP = getRequiredXP();
    levelText.textContent = `Nível ${level}`;
    xpText.textContent = `${xp} / ${requiredXP} XP`;
    xpProgress.style.width = `${(xp / requiredXP) * 100}%`;
    updateCharacters();
}

function gainXP(amount) {
    if (level >= MAX_LEVEL) return;

    // Cada ponto investido aumenta o XP recebido em 10%.
    const multiplier = 1 + (xpAttributePoints * 0.10);
    xp += amount * multiplier;

    while (level < MAX_LEVEL && xp >= getRequiredXP()) {
        xp -= getRequiredXP();
        level++;

        // Cada nível novo concede 2 pontos.
        availableAttributePoints += 2;

        if (level === MAX_LEVEL) {
            xp = 0;
            alert("🏆 NÍVEL 50!\n\nTodos os 50 dinossauros foram desbloqueados!");
            break;
        }
    }

    saveGame();
    updateXP();
    updateAttributes();
}

// ========================================
// SALVAR
// ========================================
function saveGame() {
    localStorage.setItem("dinoXP", xp);
    localStorage.setItem("dinoLevel", level);
    localStorage.setItem("dinoCharacter", selectedDino);
    localStorage.setItem("dinoAttributePoints", availableAttributePoints);
    localStorage.setItem("dinoXPAttributePoints", xpAttributePoints);
}

// ========================================
// ATRIBUTOS DE XP
// ========================================
function updateAttributes() {
    const bonusPercent = xpAttributePoints * 10;

    attributePoints.textContent = xpAttributePoints;
    availablePointsText.textContent = `Pontos disponíveis: ${availableAttributePoints}`;
    xpMultiplierText.textContent = `+${bonusPercent}% XP`;

    addPoint.disabled = availableAttributePoints <= 0;
    removePoint.disabled = xpAttributePoints <= 0;
}

addPoint.addEventListener("click", () => {
    if (availableAttributePoints <= 0) return;

    availableAttributePoints--;
    xpAttributePoints++;

    saveGame();
    updateAttributes();
});

removePoint.addEventListener("click", () => {
    if (xpAttributePoints <= 0) return;

    xpAttributePoints--;
    availableAttributePoints++;

    saveGame();
    updateAttributes();
});

// ========================================
// PULO + AGACHAR
// ========================================
let crouching = false;

function jumpDino() {
    if (!gameRunning || jumping || crouching) return;

    jumping = true;
    dino.classList.add("jump");

    setTimeout(() => {
        dino.classList.remove("jump");
        jumping = false;
    }, 600);
}

function setCrouch(active) {
    if (!gameRunning) return;

    crouching = active;

    if (active && !jumping) {
        dino.classList.add("dino-small");
    } else {
        dino.classList.remove("dino-small");
    }
}

document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jumpDino();
    }

    if (event.code === "ArrowDown") {
        event.preventDefault();
        setCrouch(true);
    }
});

document.addEventListener("keyup", event => {
    if (event.code === "ArrowDown") {
        event.preventDefault();
        setCrouch(false);
    }
});

// ========================================
// PONTOS / XP
// ========================================
setInterval(() => {
    if (!gameRunning) return;

    score++;
    points.textContent = score;
    gainXP(1);
}, 100);

// ========================================
// SISTEMA DE OBSTÁCULOS
// Não existem obstáculos impossíveis.
// A dificuldade aumenta gradualmente.
// ========================================
const obstacle = document.getElementById("obstacle");

let obstacleX = 900;
let obstacleType = "cactus";
let obstacleActive = false;
let nextObstacleTime = 900;
let lastObstacleTime = performance.now();

const obstacleTypes = [
    { name: "smallCactus", emoji: "🌵", width: 45, height: 55, kind: "ground" },
    { name: "doubleCactus", emoji: "🌵🌵", width: 72, height: 55, kind: "ground" },
    { name: "tripleCactus", emoji: "🌵🌵🌵", width: 98, height: 55, kind: "ground" },
    { name: "rock", emoji: "🪨", width: 52, height: 42, kind: "ground" },
    { name: "bird", emoji: "🦅", width: 52, height: 42, kind: "air" }
];

function getDifficulty() {
    // Cresce suavemente com a pontuação, mas fica limitada.
    if (score < 150) return 1;
    if (score < 400) return 2;
    if (score < 800) return 3;
    if (score < 1500) return 4;
    return 5;
}

function chooseObstacle() {
    const difficulty = getDifficulty();

    // No começo, só obstáculos simples.
    if (difficulty === 1) {
        return obstacleTypes[0];
    }

    // Depois entram pedra e cacto duplo.
    if (difficulty === 2) {
        return Math.random() < 0.7 ? obstacleTypes[0] : obstacleTypes[3];
    }

    // Cacto triplo começa a aparecer, mas com baixa frequência.
    if (difficulty === 3) {
        const r = Math.random();
        if (r < 0.5) return obstacleTypes[0];
        if (r < 0.8) return obstacleTypes[1];
        if (r < 0.95) return obstacleTypes[3];
        return obstacleTypes[4];
    }

    // Aéreo: passar por baixo fica possível usando ↓.
    if (difficulty >= 4) {
        const r = Math.random();
        if (r < 0.35) return obstacleTypes[0];
        if (r < 0.60) return obstacleTypes[1];
        if (r < 0.75) return obstacleTypes[2];
        if (r < 0.87) return obstacleTypes[3];
        return obstacleTypes[4];
    }
}

function spawnObstacle() {
    const selected = chooseObstacle();

    obstacleType = selected.name;
    obstacle.textContent = selected.emoji;
    obstacle.style.width = `${selected.width}px`;
    obstacle.style.height = `${selected.height}px`;
    obstacle.style.bottom = selected.kind === "air" ? "42px" : "-5px";

    obstacleX = 900;
    obstacle.style.left = `${obstacleX}px`;
    obstacle.style.display = "block";
    obstacleActive = true;

    // Espaço entre obstáculos varia, evitando sequências injustas.
    const difficulty = getDifficulty();
    const minGap = Math.max(650, 1050 - difficulty * 50);
    const maxGap = Math.max(950, 1500 - difficulty * 60);
    nextObstacleTime = minGap + Math.random() * (maxGap - minGap);
    lastObstacleTime = performance.now();
}

function moveObstacles(currentTime) {
    const deltaTime = (currentTime - lastTime) / 16.67;

    if (gameRunning) {
        if (!obstacleActive) {
            if (currentTime - lastObstacleTime >= nextObstacleTime) {
                spawnObstacle();
            }
        } else {
            obstacleX -= cactusSpeed * deltaTime;
            obstacle.style.left = `${obstacleX}px`;

            if (obstacleX < -130) {
                obstacleActive = false;
                obstacle.style.display = "none";
                lastObstacleTime = currentTime;
            }
        }
    }
}

// ========================================
// MOVIMENTO FLUIDO
// ========================================
function moveCactus(currentTime) {
    // O cacto antigo deixa de se mover.
    // O sistema novo controla todos os obstáculos.
    moveObstacles(currentTime);
    lastTime = currentTime;
    requestAnimationFrame(moveCactus);
}

requestAnimationFrame(moveCactus);

setInterval(() => {
    if (!gameRunning) return;

    cactusSpeed += 0.08;
    if (cactusSpeed > 11) cactusSpeed = 11;
}, 1000);

// ========================================
// COLISÃO
// ========================================
setInterval(() => {
    if (!gameRunning || !obstacleActive) return;

    const dinoRect = dino.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // Margem generosa: pontos de atributo ajudam, mas não tornam
    // o jogo impossível nem alteram fisicamente a dificuldade.
    const marginX = 10;
    const marginY = 8;

    const collision =
        dinoRect.left + marginX < obstacleRect.right - marginX &&
        dinoRect.right - marginX > obstacleRect.left + marginX &&
        dinoRect.top + marginY < obstacleRect.bottom - marginY &&
        dinoRect.bottom - marginY > obstacleRect.top + marginY;

    if (collision) {
        endGame();
    }
}, 10);

// ========================================
// GAME OVER
// ========================================
function endGame() {
    gameRunning = false;
    crouching = false;
    jumping = false;

    dino.classList.remove("jump");
    dino.classList.remove("dino-small");

    gameOverScreen.style.display = "block";
}

// ========================================
// REINICIAR PARTIDA
// ========================================
restartButton.addEventListener("click", () => {
    score = 0;
    points.textContent = "0";

    cactusSpeed = 6;
    obstacleX = 900;
    obstacleActive = false;
    obstacle.style.display = "none";

    lastTime = performance.now();
    lastObstacleTime = performance.now();

    gameRunning = true;
    jumping = false;
    crouching = false;

    dino.classList.remove("jump");
    dino.classList.remove("dino-small");

    gameOverScreen.style.display = "none";
});

// ========================================
// CONFIGURAÇÕES
// ========================================
settingsButton.addEventListener("click", () => {
    settingsModal.style.display = "flex";
});

closeSettings.addEventListener("click", () => {
    settingsModal.style.display = "none";
});

settingsModal.addEventListener("click", event => {
    if (event.target === settingsModal) {
        settingsModal.style.display = "none";
    }
});

saveProgress.addEventListener("click", () => {
    saveGame();
    alert("💾 Progresso salvo!");
});

// ========================================
// BACKUP
// Backup fica separado do progresso.
// ========================================
makeBackup.addEventListener("click", () => {
    saveGame();

    const backup = {
        game: "Dino Runner",
        version: 2,
        date: new Date().toISOString(),
        xp,
        level,
        selectedDino,
        availableAttributePoints,
        xpAttributePoints
    };

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "dino-runner-backup.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    // Cópia interna do backup NÃO é apagada
    // quando o progresso é reiniciado.
    localStorage.setItem("dinoBackup", JSON.stringify(backup));

    alert("📦 Backup criado com sucesso!");
});

// ========================================
// RESTAURAR BACKUP
// ========================================
restoreBackup.addEventListener("click", () => {
    backupFile.click();
});

backupFile.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const backup = JSON.parse(reader.result);

            if (backup.game !== "Dino Runner") {
                throw new Error("Arquivo inválido");
            }

            xp = Number(backup.xp) || 0;
            level = Number(backup.level) || 1;
            selectedDino = backup.selectedDino || "img/DINO-VERDE.PNG";
            availableAttributePoints = Number(backup.availableAttributePoints) || 0;
            xpAttributePoints = Number(backup.xpAttributePoints) || 0;

            if (level < 1) level = 1;
            if (level > 50) level = 50;
            if (xp < 0) xp = 0;

            // Se o backup tiver XP demais para o nível,
            // normaliza a progressão.
            while (level < MAX_LEVEL && xp >= getRequiredXP()) {
                xp -= getRequiredXP();
                level++;
            }

            if (level === MAX_LEVEL) xp = 0;

            saveGame();
            dino.src = selectedDino;
            updateXP();

            alert("📥 Backup restaurado com sucesso!");
        } catch (error) {
            alert("❌ Este arquivo não é um backup válido do Dino Runner.");
        }

        backupFile.value = "";
    };

    reader.readAsText(file);
});

// ========================================
// REINICIAR PROGRESSO
// NÃO APAGA O BACKUP
// ========================================
resetProgress.addEventListener("click", () => {
    const confirmation = confirm(
        "⚠️ ATENÇÃO!\n\n" +
        "Isso vai apagar seu nível, XP e personagem selecionado.\n\n" +
        "📦 O BACKUP NÃO será apagado.\n\n" +
        "Deseja continuar?"
    );

    if (!confirmation) return;

    localStorage.removeItem("dinoXP");
    localStorage.removeItem("dinoLevel");
    localStorage.removeItem("dinoCharacter");
    localStorage.removeItem("dinoAttributePoints");
    localStorage.removeItem("dinoXPAttributePoints");

    // NÃO remover dinoBackup.

    xp = 0;
    level = 1;
    selectedDino = "img/DINO-VERDE.PNG";
    availableAttributePoints = 0;
    xpAttributePoints = 0;

    dino.src = selectedDino;

    saveGame();
    updateXP();

    alert("🔄 Progresso reiniciado!\n\n📦 Seu backup continua intacto.");
});

// ========================================
// INICIAR
// ========================================
createCharacters();
dino.src = selectedDino;
updateXP();
updateAttributes();
