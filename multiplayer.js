/**
 * multiplayer.js - HA INIM Online Multiplayer (PeerJS WebRTC)
 *
 * Arxitektura:
 *  - HOST : Xona ochadi, unikal ID = Xona kodi.
 *           Har bir harakatdan so ng to liq holatni broadcast qiladi.
 *  - GUEST: Xona kodini kiritib ulanadi.
 *           Faqat o z navbatida zarik tasha oladi.
 *
 * Ma lumot oqimi:
 *   HOST --[state]--> barcha GUEST-lar
 *   GUEST --[action]--> HOST
 */

// =================================================
// 1. HOLAT O ZGARUVCHILAR
// =================================================
let mpPeer         = null;
let mpConnections  = [];   // HOST: ulangan GUEST connection lari
let mpHostConn     = null; // GUEST: HOST ga ulanish
let mpIsHost       = false;
let mpIsOnline     = false;
let mpMyPlayerIdx  = -1;   // Bu qurilma qaysi o yinchini boshqaradi

const MP_CONFIG = {
    config: {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ]
    }
};

// =================================================
// 2. UI YORDAMCHI FUNKSIYALAR
// =================================================
function mpSetStatus(text, color) {
    color = color || "#aaa";
    var dot  = document.getElementById("mp-status-dot");
    var span = document.getElementById("mp-status-text");
    if (dot)  { dot.style.background  = color; dot.style.boxShadow = "0 0 8px " + color; }
    if (span) { span.textContent = text; }
}

function mpUpdatePeersList() {
    var box   = document.getElementById("mp-peers-list");
    var inner = document.getElementById("mp-peers-inner");
    if (!box || !inner) return;

    if (!mpIsOnline) { box.classList.add("hidden"); return; }

    box.classList.remove("hidden");
    inner.innerHTML = "";

    if (mpIsHost) {
        var youEl = document.createElement("span");
        youEl.className = "mp-peer-chip host";
        youEl.textContent = "Siz (Host)";
        inner.appendChild(youEl);

        mpConnections.forEach(function(c, i) {
            var chip = document.createElement("span");
            chip.className = "mp-peer-chip";
            chip.textContent = "Mehmon " + (i + 1);
            inner.appendChild(chip);
        });

        var startBtn = document.getElementById("btn-mp-start-online");
        if (startBtn) startBtn.classList.toggle("hidden", mpConnections.length === 0);
    } else {
        var chip = document.createElement("span");
        chip.className = "mp-peer-chip";
        chip.textContent = "Siz (Mehmon)";
        inner.appendChild(chip);
        var hostChip = document.createElement("span");
        hostChip.className = "mp-peer-chip host";
        hostChip.textContent = "Host";
        inner.appendChild(hostChip);
    }
}

function mpLockDiceButton() {
    if (!mpIsOnline) return;
    var rollBtn = document.getElementById("roll-dice-btn");
    if (!rollBtn) return;
    var isMyTurn = (activePlayerIdx === mpMyPlayerIdx);
    var blocked  = !isMyTurn || isRolling || isMoving;
    rollBtn.disabled = blocked;
    rollBtn.style.opacity = blocked ? "0.4" : "1";

    var hintEl = document.getElementById("mp-turn-hint");
    if (hintEl) {
        if (isMyTurn) {
            hintEl.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00ff88;box-shadow:0 0 8px #00ff88;margin-right:6px;"></span>Sizning navbatingiz!';
            hintEl.style.borderColor = "rgba(0, 255, 136, 0.4)";
            hintEl.style.background = "rgba(0, 255, 136, 0.08)";
            hintEl.style.color = "#00ff88";
        } else {
            var name = "Boshqa o'yinchi";
            if (gameConfig && gameConfig.players && gameConfig.players[activePlayerIdx]) {
                name = gameConfig.players[activePlayerIdx].name;
            }
            hintEl.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff4444;box-shadow:0 0 8px #ff4444;margin-right:6px;"></span>' + name + ' navbati...';
            hintEl.style.borderColor = "rgba(255, 68, 68, 0.4)";
            hintEl.style.background = "rgba(255, 68, 68, 0.08)";
            hintEl.style.color = "#ff4444";
        }
        hintEl.style.display = "block";
    }
}

// =================================================
// 3. HOLAT YUBORISH VA QABUL QILISH
// =================================================
function mpSerializeState() {
    var players = [];
    if (gameConfig && gameConfig.players) {
        gameConfig.players.forEach(function(p) {
            players.push({
                name:         p.name,
                emoji:        p.emoji || p.token,
                position:     p.position,
                checkpoint:   p.checkpoint,
                skipNextTurn: p.skipNextTurn,
                color:        p.color
            });
        });
    }
    return {
        type:          "STATE_SYNC",
        activePlayerIdx: activePlayerIdx,
        turnCount:     turnCount,
        isRolling:     isRolling,
        isMoving:      isMoving,
        players:       players,
        specialTiles:  JSON.stringify((gameConfig && gameConfig.specialTiles) || {}),
        totalSteps:    gameConfig && gameConfig.totalSteps,
        mapType:       gameConfig && gameConfig.mapType,
        hazardLevel:   gameConfig && gameConfig.hazardLevel
    };
}

function mpApplyState(data) {
    if (!data || data.type !== "STATE_SYNC") return;

    // Set configuration variables for guest
    if (data.mapType && gameConfig) gameConfig.mapType = data.mapType;
    if (data.totalSteps && gameConfig) gameConfig.totalSteps = data.totalSteps;
    if (data.hazardLevel && gameConfig) gameConfig.hazardLevel = data.hazardLevel;

    // Initialize or rebuild boardTiles on guest side
    if (typeof boardTiles === "undefined" || boardTiles.length === 0) {
        if (typeof buildBoardData === "function") buildBoardData();
    }

    if (data.players && gameConfig) {
        if (!gameConfig.players || gameConfig.players.length !== data.players.length) {
            gameConfig.players = data.players.map(function(p, i) {
                return {
                    id: i,
                    name: p.name,
                    token: p.emoji,
                    color: p.color,
                    position: p.position,
                    checkpoint: p.checkpoint,
                    skipNextTurn: p.skipNextTurn
                };
            });
        } else {
            data.players.forEach(function(remote, i) {
                if (gameConfig.players[i]) {
                    gameConfig.players[i].position     = remote.position;
                    gameConfig.players[i].checkpoint   = remote.checkpoint;
                    gameConfig.players[i].skipNextTurn = remote.skipNextTurn;
                }
            });
        }
    }

    activePlayerIdx = data.activePlayerIdx;
    turnCount       = data.turnCount;
    isRolling       = data.isRolling;
    isMoving        = data.isMoving;

    if (data.specialTiles) {
        try { gameConfig.specialTiles = JSON.parse(data.specialTiles); } catch(e) {}
    }

    if (typeof updateHUD === "function")            updateHUD();
    if (typeof syncTokenPositions === "function")   syncTokenPositions(true);
    if (typeof renderBoard === "function")          renderBoard();

    mpLockDiceButton();
}

function mpBroadcastState() {
    if (!mpIsHost) return;
    var state = mpSerializeState();
    mpConnections.forEach(function(conn) {
        if (conn.open) conn.send(state);
    });
}

function mpBroadcastMessage(msg) {
    mpConnections.forEach(function(c) { if (c.open) c.send(msg); });
}

function mpSendActionToHost(action) {
    if (mpIsHost || !mpHostConn || !mpHostConn.open) return;
    mpHostConn.send(Object.assign({ type: "ACTION" }, action));
}

// =================================================
// 4. HOST LOGIKASI
// =================================================
function mpCreateRoom() {
    var btn = document.getElementById("btn-create-room");
    if (btn) btn.disabled = true;
    mpSetStatus("Tayyorlanmoqda...", "#ffd700");

    if (mpPeer) { try { mpPeer.destroy(); } catch(e) {} mpPeer = null; }

    // Tasodifiy 6 xonali unikal xona kodini yaratamiz
    var code = Math.random().toString(36).substring(2, 8).toUpperCase();
    var customPeerId = "HAINIM-" + code;

    mpPeer        = new Peer(customPeerId, MP_CONFIG);
    mpIsHost      = true;
    mpMyPlayerIdx = 0;

    mpPeer.on("open", function(id) {
        document.getElementById("room-code-value").textContent = code;
        document.getElementById("room-code-display").classList.remove("hidden");
        document.getElementById("mp-waiting-msg").classList.remove("hidden");
        mpSetStatus("Xona tayyor - kutmoqda", "#00ff88");
        mpUpdatePeersList();
    });

    mpPeer.on("connection", function(conn) {
        conn.on("open", function() {
            mpConnections.push(conn);
            mpIsOnline = true;
            var guestIdx = mpConnections.length;
            mpSetStatus(mpConnections.length + " o yinchi ulandi", "#00f0ff");
            mpUpdatePeersList();
            conn.send({ type: "ASSIGN_PLAYER", playerIdx: guestIdx });
            if (typeof gameConfig !== "undefined" && gameConfig.players && gameConfig.players.length > 1) {
                conn.send(mpSerializeState());
            }
        });

        conn.on("data", function(data) {
            if (!data) return;
            if (data.type === "ACTION" && data.action === "ROLL") {
                if (data.playerIdx === activePlayerIdx && !isRolling && !isMoving) {
                    if (typeof triggerRollProcess === "function") triggerRollProcess();
                }
            }
        });

        conn.on("close", function() {
            mpConnections = mpConnections.filter(function(c) { return c !== conn; });
            mpSetStatus(mpConnections.length > 0 ? mpConnections.length + " o yinchi" : "Xona bo sh", "#ffa500");
            mpUpdatePeersList();
        });
    });

    mpPeer.on("error", function(err) {
        mpSetStatus("Xato: " + err.type, "#ff4444");
        if (btn) btn.disabled = false;
    });
}

// =================================================
// 5. GUEST LOGIKASI
// =================================================
function mpJoinRoom(shortCode) {
    shortCode = (shortCode || "").trim().toUpperCase();
    if (shortCode.length < 4) {
        alert("Iltimos to g ri xona kodini kiriting!"); return;
    }

    mpSetStatus("Ulanmoqda...", "#ffd700");
    var joinBtn = document.getElementById("btn-join-room");
    if (joinBtn) joinBtn.disabled = true;

    if (mpPeer) { try { mpPeer.destroy(); } catch(e) {} mpPeer = null; }
    mpPeer   = new Peer(undefined, MP_CONFIG);
    mpIsHost = false;

    mpPeer.on("open", function() {
        var hostPeerId = "HAINIM-" + shortCode;
        mpHostConn = mpPeer.connect(hostPeerId, { reliable: true });

        mpHostConn.on("open", function() {
            mpIsOnline = true;
            mpSetStatus("Host bilan ulandi", "#00ff88");
            mpUpdatePeersList();
        });

        mpHostConn.on("data", function(data) {
            if (!data) return;

            if (data.type === "ASSIGN_PLAYER") {
                mpMyPlayerIdx = data.playerIdx;
                mpSetStatus("Ulandi - " + (data.playerIdx + 1) + "-o yinchi", "#00ff88");
                return;
            }

            if (data.type === "STATE_SYNC") {
                // O yin hali boshlanmagan bo lsa, o yinni ochish
                var setupEl = document.getElementById("setup-screen");
                var gameEl  = document.getElementById("game-screen");
                if (setupEl && gameEl && !gameEl.classList.contains("active")) {
                    // Sozlamalarni HOST holatiga mos qilib o rnatish
                    if (data.mapType && typeof gameConfig !== "undefined") {
                        gameConfig.mapType = data.mapType;
                    }
                    if (data.totalSteps && typeof gameConfig !== "undefined") {
                        gameConfig.totalSteps = data.totalSteps;
                    }
                }
                mpApplyState(data);
                return;
            }

            if (data.type === "GAME_START") {
                var mpModal = document.getElementById("multiplayer-modal");
                if (mpModal) mpModal.classList.remove("active");
                // Switch screens for guest
                var setupEl2 = document.getElementById("setup-screen");
                var gameEl2  = document.getElementById("game-screen");
                if (setupEl2) setupEl2.classList.remove("active");
                if (gameEl2)  gameEl2.classList.add("active");
                return;
            }
        });

        mpHostConn.on("close", function() {
            mpSetStatus("Host bilan aloqa uzildi", "#ff4444");
            mpIsOnline = false;
        });

        mpHostConn.on("error", function(err) {
            mpSetStatus("Xato: " + err, "#ff4444");
        });
    });

    mpPeer.on("error", function(err) {
        mpSetStatus("Ulanishda xato: " + err.type, "#ff4444");
        if (joinBtn) joinBtn.disabled = false;
    });
}

// =================================================
// 6. SCRIPT.JS BILAN INTEGRATSIYA (Monkey-Patch)
// =================================================
(function patchUpdateHUD() {
    var _orig = window.updateHUD;
    window.updateHUD = function() {
        if (typeof _orig === "function") _orig.apply(this, arguments);
        if (mpIsHost && mpIsOnline) {
            setTimeout(mpBroadcastState, 80);
        }
        if (mpIsOnline) mpLockDiceButton();
    };
})();

// Roll tugmasi - GUEST bo sa HOST ga so rov yuboradi
function mpSetupRollInterceptor() {
    var rollBtn = document.getElementById("roll-dice-btn");
    if (!rollBtn) return;
    rollBtn.addEventListener("click", function(e) {
        if (!mpIsOnline || mpIsHost) return;
        e.stopImmediatePropagation();
        if (activePlayerIdx !== mpMyPlayerIdx) {
            alert("Bu sizning navbatingiz emas!"); return;
        }
        mpSendActionToHost({ action: "ROLL", playerIdx: mpMyPlayerIdx });
    }, true);
}

// =================================================
// 7. HOST O YINNI BOSHLASH
// =================================================
function mpStartOnlineGame() {
    if (!mpIsHost || mpConnections.length === 0) return;
    var totalPlayers = mpConnections.length + 1;
    document.querySelectorAll(".btn-count").forEach(function(b) {
        b.classList.remove("active");
        if (parseInt(b.dataset.count) === totalPlayers) b.classList.add("active");
    });
    var startBtn = document.getElementById("start-game-btn");
    if (startBtn) startBtn.click();
    setTimeout(function() {
        mpBroadcastMessage({ type: "GAME_START" });
        setTimeout(mpBroadcastState, 300);
    }, 600);
}

// =================================================
// 8. MODAL TUGMALARI - DOMContentLoaded
// =================================================
document.addEventListener("DOMContentLoaded", function() {
    var mpModal      = document.getElementById("multiplayer-modal");
    var openBtn      = document.getElementById("btn-multiplayer-open");
    var closeBtn     = document.getElementById("btn-mp-close");
    var createBtn    = document.getElementById("btn-create-room");
    var joinBtn      = document.getElementById("btn-join-room");
    var copyBtn      = document.getElementById("btn-copy-code");
    var startOnline  = document.getElementById("btn-mp-start-online");
    var codeInput    = document.getElementById("room-code-input");

    if (openBtn)  openBtn.addEventListener("click",  function() { mpModal.classList.add("active"); });
    if (closeBtn) closeBtn.addEventListener("click", function() { mpModal.classList.remove("active"); });
    if (createBtn) createBtn.addEventListener("click", mpCreateRoom);

    if (joinBtn) {
        joinBtn.addEventListener("click", function() {
            mpJoinRoom(codeInput ? codeInput.value : "");
        });
    }
    if (codeInput) {
        codeInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") mpJoinRoom(codeInput.value);
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", function() {
            var code = document.getElementById("room-code-value").textContent;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(code).then(function() {
                    copyBtn.textContent = "Nusxalandi!";
                    setTimeout(function() { copyBtn.textContent = "Nusxala"; }, 2000);
                });
            } else {
                prompt("Kodni nusxalang:", code);
            }
        });
    }

    if (startOnline) startOnline.addEventListener("click", mpStartOnlineGame);

    mpSetupRollInterceptor();

    // Navbat bildiruvi elementi
    var bottom = document.querySelector(".hud-bottom") || document.querySelector(".game-hud");
    if (bottom) {
        var hint = document.createElement("div");
        hint.id = "mp-turn-hint";
        hint.style.cssText = "display:none;text-align:center;font-size:0.8rem;color:#00f0ff;" +
            "font-weight:700;padding:3px 10px;border-radius:20px;background:rgba(0,240,255,0.1);" +
            "border:1px solid rgba(0,240,255,0.3);margin:4px auto;max-width:260px;";
        bottom.after(hint);
    }
});
