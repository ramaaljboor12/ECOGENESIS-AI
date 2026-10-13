/* =========================================================
   ECOGENESIS AI
   CITY INTELLIGENCE ENGINE
   COMPLETE JAVASCRIPT ENGINE
========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
========================================================= */

const STORAGE_KEY = "ecogenesis-ai-v4";

const defaultState = {
    theme: "dark",
    voice: true,
    reducedMotion: false,
    highContrast: false,
    largeText: false,

    ecoScore: 84,
    learning: 73,
    level: 2,

    metrics: {
        air: 87,
        water: 91,
        energy: 76,
        waste: 82,
        biodiversity: 72
    },

    cityNight: false,
    satelliteMode: false,

    timeline: [],

    memory: [
        {
            title: "تحسين استهلاك الطاقة",
            detail: "تم خفض استهلاك الطاقة الليلية",
            confidence: 94
        },
        {
            title: "مراقبة المياه",
            detail: "تم اكتشاف نمط طبيعي في شبكة المياه",
            confidence: 91
        }
    ],

    missions: {
        air: false,
        water: false,
        energy: false,
        trees: false,
        crisis: false
    },

    future: {
        years: 10,
        renewable: 60,
        recycle: 55,
        green: 70,
        transport: 50
    },

    investigationComplete: false,
    selectedPlan: null,

    buildingsOptimized: 0,
    aiActions: 36,

    crisisActive: false,

    cityEvolution: 0
};

let state = loadState();

let liveChart = null;
let futureChart = null;

let cityScene = null;
let cityCamera = null;
let cityRenderer = null;
let cityControls = null;
let cityRaycaster = null;
let cityMouse = typeof THREE !== "undefined" ? new THREE.Vector2() : null;
let cityObjects = [];

let earthScene = null;
let earthCamera = null;
let earthRenderer = null;
let earthControls = null;

let speechRecognition = null;
let welcomeSpoken = false;

let currentInvestigationStep = 0;

let eventTimer = null;
let metricTimer = null;
let heartbeatTimer = null;


/* =========================================================
   HELPERS
========================================================= */

const $ = id => document.getElementById(id);

function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (!saved) {
            return structuredClone(defaultState);
        }

        return {
            ...structuredClone(defaultState),
            ...saved,
            metrics: {
                ...defaultState.metrics,
                ...(saved.metrics || {})
            },
            missions: {
                ...defaultState.missions,
                ...(saved.missions || {})
            },
            future: {
                ...defaultState.future,
                ...(saved.future || {})
            }
        };
    } catch {
        return structuredClone(defaultState);
    }
}

function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
}


/* =========================================================
   TOAST SYSTEM
========================================================= */

function showToast(message, type = "info", duration = 3500) {

    let container = $("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    const icons = {
        success: "fa-circle-check",
        error: "fa-circle-xmark",
        warning: "fa-triangle-exclamation",
        info: "fa-circle-info"
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${icons[type] || icons.info}"></i>
        </div>

        <div class="toast-content">
            <strong>ECOGENESIS AI</strong>
            <span>${message}</span>
        </div>

        <button class="toast-close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    toast.querySelector(".toast-close").onclick = () => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);
    };

    setTimeout(() => {

        if (!toast.isConnected) return;

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, duration);
}


/* =========================================================
   MODAL SYSTEM
========================================================= */

function createModal(title, content, options = {}) {

    closeModal();

    const modal = document.createElement("div");

    modal.className = "dynamic-modal";

    modal.innerHTML = `
        <div class="dynamic-modal-backdrop"></div>

        <div class="dynamic-modal-box">

            <button class="dynamic-modal-close">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="dynamic-modal-header">

                <div class="dynamic-modal-icon">
                    <i class="fa-solid ${options.icon || "fa-sparkles"}"></i>
                </div>

                <div>
                    <span>${options.kicker || "ECOGENESIS AI"}</span>
                    <h2>${title}</h2>
                </div>

            </div>

            <div class="dynamic-modal-body">
                ${content}
            </div>

        </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        modal.classList.add("show");
    });

    modal.querySelector(".dynamic-modal-close").onclick = closeModal;
    modal.querySelector(".dynamic-modal-backdrop").onclick = closeModal;

    return modal;
}

function closeModal() {

    const modal = qs(".dynamic-modal");

    if (!modal) return;

    modal.classList.remove("show");

    setTimeout(() => {
        modal.remove();
    }, 250);
}


/* =========================================================
   BOOT SYSTEM
========================================================= */

function bootSystem() {

    const boot = $("bootScreen");
    const app = $("app");
    const progress = $("bootProgress") || $("bootProgressBar");
    const percent = $("bootPercent");
    const text = $("bootText") || $("bootMessage");

    if (!boot || !app) return;

    const messages = [
        "Initializing ecological intelligence...",
        "Connecting city sensors...",
        "Loading digital twin...",
        "Calibrating environmental models...",
        "Activating AI reasoning engine...",
        "Synchronizing city memory...",
        "Preparing ECOGENESIS CORE..."
    ];

    let value = 0;

    const timer = setInterval(() => {

        value += random(3, 9);

        if (value > 100) {
            value = 100;
        }

        if (progress) {
            progress.style.width = `${value}%`;
        }

        if (percent) {
            percent.textContent = value;
        }

        const index = Math.min(
            messages.length - 1,
            Math.floor(value / 15)
        );

        if (text) {
            text.textContent = messages[index];
        }

        if (value >= 100) {

            clearInterval(timer);

            setTimeout(() => {

                boot.classList.add("hidden");
                app.classList.remove("hidden");

                applyState();

                setTimeout(() => {
                    speakWelcome();
                }, 900);

            }, 500);
        }

    }, 100);
}


/* =========================================================
   NAVIGATION
========================================================= */

const pageNames = {
    dashboard: "مركز القيادة",
    city: "المدينة الرقمية",
    detective: "المحقق البيئي",
    future: "محاكي المستقبل",
    decision: "غرفة القرار",
    memory: "ذاكرة المدينة",
    dna: "Eco DNA",
    earth: "القمر الصناعي",
    vision: "الرؤية الذكية",
    command: "AI Command",
    missions: "المهام البيئية",
    judge: "Judge Mode"
};

function navigate(page) {

    const target = $(`page-${page}`);

    if (!target) return;

    qsa(".page").forEach(p => {
        p.classList.remove("active");
    });

    target.classList.add("active");

    qsa(".nav-btn").forEach(btn => {

        btn.classList.toggle(
            "active",
            btn.dataset.page === page
        );

    });

    const name = $("currentPageName");

    if (name) {
        name.textContent = pageNames[page] || page;
    }

    window.scrollTo({
        top: 0,
        behavior: state.reducedMotion ? "auto" : "smooth"
    });

    if (page === "city") {
        setTimeout(initCity3D, 150);
    }

    if (page === "earth") {
        setTimeout(initEarth, 150);
    }

    if (page === "missions") {
        renderMissions();
    }

    if (page === "memory") {
        renderMemory();
    }

    if (page === "dna") {
        updateEcoDNA();
    }

    if (page === "judge") {
        prepareJudgeMode();
    }
}


/* =========================================================
   THEME
========================================================= */

function applyTheme() {

    document.body.classList.toggle(
        "light",
        state.theme === "light"
    );

    const icon = qs("#themeToggle i");

    if (icon) {

        icon.className =
            state.theme === "light"
                ? "fa-solid fa-sun"
                : "fa-solid fa-moon";
    }
}

function toggleTheme() {

    state.theme =
        state.theme === "dark"
            ? "light"
            : "dark";

    applyTheme();
    saveState();

    showToast(
        state.theme === "dark"
            ? "تم تفعيل الوضع الليلي"
            : "تم تفعيل الوضع النهاري",
        "success"
    );

    speak(
        state.theme === "dark"
            ? "تم تفعيل الوضع الليلي"
            : "تم تفعيل الوضع النهاري"
    );
}


/* =========================================================
   ACCESSIBILITY
========================================================= */

function applyAccessibility() {

    document.body.classList.toggle(
        "reduced-motion",
        state.reducedMotion
    );

    document.body.classList.toggle(
        "high-contrast",
        state.highContrast
    );

    document.body.classList.toggle(
        "large-text",
        state.largeText
    );
}

function toggleAccessibility(type) {

    state[type] = !state[type];

    applyAccessibility();
    saveState();

    const names = {
        reducedMotion: "تقليل الحركة",
        highContrast: "التباين العالي",
        largeText: "النص الكبير"
    };

    showToast(
        `${names[type]}: ${state[type] ? "مفعّل" : "متوقف"}`,
        "info"
    );
}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now = new Date();

    const clock = $("clock");
    const date = $("dateText");

    if (clock) {

        clock.textContent =
            now.toLocaleTimeString("en-GB");
    }

    if (date) {

        date.textContent =
            now.toLocaleDateString("ar-JO", {
                weekday: "long",
                day: "numeric",
                month: "long"
            });
    }
}


/* =========================================================
   DASHBOARD METRICS
========================================================= */

function updateMetricsUI() {

    const map = {
        air: "air",
        water: "water",
        energy: "energy",
        waste: "waste"
    };

    Object.entries(map).forEach(([key, prefix]) => {

        const value = state.metrics[key];

        const number = $(`${prefix}Value`);
        const bar = $(`${prefix}Bar`);

        if (number) {
            number.textContent = Math.round(value);
        }

        if (bar) {
            bar.style.width = `${value}%`;
        }
    });

    if ($("miniAir")) {
        $("miniAir").textContent =
            Math.round(state.metrics.air);
    }

    if ($("miniWater")) {
        $("miniWater").textContent =
            Math.round(state.metrics.water);
    }

    if ($("miniEnergy")) {
        $("miniEnergy").textContent =
            Math.round(state.metrics.energy);
    }

    updateHealthScore();
}

function calculateHealth() {

    const values = Object.values(state.metrics);

    return Math.round(
        values.reduce((a, b) => a + b, 0) /
        values.length
    );
}

function updateHealthScore() {

    const score = calculateHealth();

    state.ecoScore = score;

    const number = $("healthScore");

    if (number) {
        number.textContent = score;
    }

    const ring = $("healthRing");

    if (ring) {

        const circumference = 490;

        const offset =
            circumference -
            (score / 100) * circumference;

        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = offset;
    }

    const stateText = $("healthState");

    if (stateText) {

        if (score >= 85) {
            stateText.textContent = "Excellent";
        } else if (score >= 70) {
            stateText.textContent = "Healthy";
        } else if (score >= 50) {
            stateText.textContent = "Warning";
        } else {
            stateText.textContent = "Critical";
        }
    }
}


/* =========================================================
   LIVE CITY SIMULATION
========================================================= */

function simulateMetrics() {

    if (state.crisisActive) return;

    const keys = [
        "air",
        "water",
        "energy",
        "waste"
    ];

    keys.forEach(key => {

        const change = random(-2, 2);

        state.metrics[key] = clamp(
            state.metrics[key] + change,
            35,
            99
        );
    });

    updateMetricsUI();

    updateChart();

    updateCityHeartbeat();

    saveState();
}

function improveMetrics(amount = 3) {

    Object.keys(state.metrics).forEach(key => {

        state.metrics[key] = clamp(
            state.metrics[key] + random(1, amount),
            0,
            100
        );

    });

    state.aiActions++;

    state.learning = clamp(
        state.learning + 1,
        0,
        100
    );

    updateMetricsUI();
    updateLearningUI();

    saveState();
}


/* =========================================================
   LIVE CHART
========================================================= */

function initLiveChart() {

    const canvas = $("liveChart");

    if (!canvas || typeof Chart === "undefined") return;

    const labels = [];
    const values = [];

    for (let i = 0; i < 20; i++) {

        labels.push(
            new Date(
                Date.now() - (19 - i) * 1000
            ).toLocaleTimeString(
                "en-GB",
                {
                    minute: "2-digit",
                    second: "2-digit"
                }
            )
        );

        values.push(
            clamp(
                calculateHealth() + random(-7, 7),
                20,
                100
            )
        );
    }

    liveChart = new Chart(canvas, {

        type: "line",

        data: {

            labels,

            datasets: [{
                label: "Eco Health",
                data: values,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                x: {
                    display: false
                },

                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: "rgba(255,255,255,.05)"
                    }
                }

            }
        }

    });
}

function updateChart() {

    if (!liveChart) return;

    const now = new Date();

    liveChart.data.labels.push(
        now.toLocaleTimeString(
            "en-GB",
            {
                minute: "2-digit",
                second: "2-digit"
            }
        )
    );

    liveChart.data.datasets[0].data.push(
        calculateHealth()
    );

    if (liveChart.data.labels.length > 25) {

        liveChart.data.labels.shift();
        liveChart.data.datasets[0].data.shift();
    }

    liveChart.update("none");
}


/* =========================================================
   AI EVENT ENGINE
========================================================= */

const cityEvents = [
    {
        title: "اكتشاف ارتفاع حراري",
        description: "تم اكتشاف ارتفاع في درجة الحرارة داخل المنطقة B",
        confidence: 94,
        type: "warning"
    },
    {
        title: "تحسين شبكة المياه",
        description: "AI اكتشف فرصة لتقليل فقدان المياه",
        confidence: 97,
        type: "success"
    },
    {
        title: "تحسين استهلاك الطاقة",
        description: "تم العثور على حمل كهربائي يمكن تحسينه",
        confidence: 91,
        type: "success"
    },
    {
        title: "نشاط مروري غير طبيعي",
        description: "ارتفاع مؤقت في كثافة الحركة",
        confidence: 88,
        type: "warning"
    },
    {
        title: "تحسن جودة الهواء",
        description: "انخفاض مستوى الملوثات في المنطقة الشمالية",
        confidence: 96,
        type: "success"
    }
];

function generateAIEvent() {

    const event =
        cityEvents[random(0, cityEvents.length - 1)];

    const title = $("eventTitle");
    const description = $("eventDescription");
    const confidence = $("eventConfidence");

    if (title) {
        title.textContent = event.title;
    }

    if (description) {
        description.textContent = event.description;
    }

    if (confidence) {
        confidence.textContent =
            `${event.confidence}%`;
    }

    addTimelineEvent(
        event.title,
        event.description,
        event.type === "warning"
            ? "warning"
            : "success"
    );

    state.timeline.unshift({
        title: event.title,
        description: event.description,
        time: new Date().toISOString()
    });

    state.timeline =
        state.timeline.slice(0, 20);

    saveState();
}

function addTimelineEvent(
    title,
    description,
    type = "success"
) {

    const timeline = $("eventTimeline");

    if (!timeline) return;

    const icons = {
        success: "fa-check",
        warning: "fa-triangle-exclamation",
        info: "fa-circle-info",
        blue: "fa-droplet"
    };

    const item = document.createElement("div");

    item.className = "timeline-item";

    item.innerHTML = `
        <div class="timeline-icon ${type}">
            <i class="fa-solid ${icons[type] || icons.info}"></i>
        </div>

        <div>
            <strong>${title}</strong>
            <small>${description}</small>
        </div>
    `;

    timeline.prepend(item);

    while (timeline.children.length > 5) {
        timeline.lastElementChild.remove();
    }
}


/* =========================================================
   AI BRAIN
========================================================= */

function openAIBrain() {

    createModal(
        "عقل ECOGENESIS AI",
        `
        <div class="brain-modal">

            <div class="brain-chain">

                <div class="brain-step">
                    <i class="fa-solid fa-satellite-dish"></i>
                    <strong>1</strong>
                    <span>Sensors</span>
                    <small>جمع البيانات</small>
                </div>

                <div class="brain-arrow">
                    <i class="fa-solid fa-arrow-left"></i>
                </div>

                <div class="brain-step">
                    <i class="fa-solid fa-database"></i>
                    <strong>2</strong>
                    <span>Data</span>
                    <small>تنظيف البيانات</small>
                </div>

                <div class="brain-arrow">
                    <i class="fa-solid fa-arrow-left"></i>
                </div>

                <div class="brain-step active">
                    <i class="fa-solid fa-brain"></i>
                    <strong>3</strong>
                    <span>AI</span>
                    <small>تحليل الأنماط</small>
                </div>

                <div class="brain-arrow">
                    <i class="fa-solid fa-arrow-left"></i>
                </div>

                <div class="brain-step">
                    <i class="fa-solid fa-lightbulb"></i>
                    <strong>4</strong>
                    <span>Decision</span>
                    <small>اختيار الحل</small>
                </div>

                <div class="brain-arrow">
                    <i class="fa-solid fa-arrow-left"></i>
                </div>

                <div class="brain-step">
                    <i class="fa-solid fa-rocket"></i>
                    <strong>5</strong>
                    <span>Action</span>
                    <small>تنفيذ القرار</small>
                </div>

            </div>

            <div class="brain-explanation">

                <h3>
                    <i class="fa-solid fa-lightbulb"></i>
                    لماذا هذا القرار؟
                </h3>

                <p>
                    النظام يقارن بيانات الحساسات الحالية مع البيانات
                    السابقة ويبحث عن تغيرات غير طبيعية.
                    بعد ذلك يحسب مجموعة من الاحتمالات ويختار
                    الإجراء الذي يحقق أكبر تأثير بيئي بأقل تكلفة.
                </p>

            </div>

            <div class="brain-stats">

                <div>
                    <strong>1,284</strong>
                    <span>إشارة / ثانية</span>
                </div>

                <div>
                    <strong>96%</strong>
                    <span>دقة التحليل</span>
                </div>

                <div>
                    <strong>${state.aiActions}</strong>
                    <span>قرارات AI</span>
                </div>

            </div>

        </div>
        `,
        {
            icon: "fa-brain",
            kicker: "EXPLAINABLE AI"
        }
    );
}


/* =========================================================
   CITY 3D
========================================================= */

function initCity3D() {

    const container = $("city3D");

    if (!container || typeof THREE === "undefined") {
        return;
    }

    if (cityRenderer) {

        cityRenderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

        return;
    }

    cityScene = new THREE.Scene();

    cityScene.background =
        new THREE.Color(
            state.cityNight
                ? 0x02050b
                : 0x06101b
        );

    cityCamera = new THREE.PerspectiveCamera(
        55,
        container.clientWidth /
        container.clientHeight,
        0.1,
        1000
    );

    cityCamera.position.set(
        35,
        28,
        42
    );

    cityRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    cityRenderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    cityRenderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    container.innerHTML = "";

    container.appendChild(
        cityRenderer.domElement
    );

    if (THREE.OrbitControls) {

        cityControls =
            new THREE.OrbitControls(
                cityCamera,
                cityRenderer.domElement
            );

        cityControls.enableDamping = true;
        cityControls.dampingFactor = 0.06;
        cityControls.maxPolarAngle =
            Math.PI / 2.05;
    }

    cityRaycaster = new THREE.Raycaster();

    createCityLights();
    createCityGround();
    createRoads();
    createBuildings();
    createTrees();
    createCitySensors();

    const ambient = new THREE.AmbientLight(
        0x8ab4ff,
        1.7
    );

    cityScene.add(ambient);

    const directional = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    directional.position.set(
        20,
        40,
        20
    );

    cityScene.add(directional);

    animateCity();

    container.addEventListener(
        "pointerdown",
        handleCityClick
    );
}

function createCityLights() {

    const geometry =
        new THREE.BufferGeometry();

    const positions = [];

    for (let i = 0; i < 400; i++) {

        positions.push(
            random(-60, 60),
            random(5, 35),
            random(-60, 60)
        );
    }

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            positions,
            3
        )
    );

    const material =
        new THREE.PointsMaterial({
            color: 0x53ffb1,
            size: 0.12,
            transparent: true,
            opacity: 0.55
        });

    const stars =
        new THREE.Points(
            geometry,
            material
        );

    cityScene.add(stars);
}

function createCityGround() {

    const geometry =
        new THREE.PlaneGeometry(
            120,
            120
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x07151c,
            roughness: 0.85
        });

    const ground =
        new THREE.Mesh(
            geometry,
            material
        );

    ground.rotation.x =
        -Math.PI / 2;

    cityScene.add(ground);

    const grid =
        new THREE.GridHelper(
            120,
            40,
            0x16485b,
            0x0b2734
        );

    grid.position.y = 0.03;

    cityScene.add(grid);
}

function createRoads() {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x111b26
        });

    for (let i = -50; i <= 50; i += 12) {

        const horizontal =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    120,
                    0.15,
                    4
                ),
                material
            );

        horizontal.position.set(
            0,
            0.08,
            i
        );

        cityScene.add(horizontal);


        const vertical =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    4,
                    0.15,
                    120
                ),
                material
            );

        vertical.position.set(
            i,
            0.09,
            0
        );

        cityScene.add(vertical);
    }
}

function createBuildings() {

    const colors = [
        0x10253b,
        0x122d40,
        0x172943,
        0x172f35,
        0x1c2742
    ];

    for (let i = 0; i < 42; i++) {

        const x =
            Math.round(random(-48, 48) / 6) * 6;

        const z =
            Math.round(random(-48, 48) / 6) * 6;

        if (
            Math.abs(x) < 7 &&
            Math.abs(z) < 7
        ) {
            continue;
        }

        const width =
            random(3, 5);

        const depth =
            random(3, 5);

        const height =
            random(5, 18);

        const geometry =
            new THREE.BoxGeometry(
                width,
                height,
                depth
            );

        const material =
            new THREE.MeshStandardMaterial({
                color:
                    colors[
                        random(
                            0,
                            colors.length - 1
                        )
                    ],
                roughness: 0.6,
                metalness: 0.15
            });

        const building =
            new THREE.Mesh(
                geometry,
                material
            );

        building.position.set(
            x,
            height / 2,
            z
        );

        building.userData = {
            type: "building",
            id: `B-${String(i + 1).padStart(2, "0")}`,
            energy: random(30, 95),
            water: random(40, 95),
            efficiency: random(50, 98)
        };

        cityScene.add(building);

        cityObjects.push(building);

        addBuildingWindows(
            building,
            width,
            height,
            depth
        );
    }
}

function addBuildingWindows(
    building,
    width,
    height,
    depth
) {

    const windowMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x46d9ff
        });

    for (
        let y = 2;
        y < height - 1;
        y += 2.5
    ) {

        const window =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width * 0.55,
                    0.25,
                    0.04
                ),
                windowMaterial
            );

        window.position.set(
            building.position.x,
            y,
            building.position.z -
            depth / 2 -
            0.03
        );

        cityScene.add(window);
    }
}

function createTrees() {

    for (let i = 0; i < 35; i++) {

        const group =
            new THREE.Group();

        const trunk =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.18,
                    0.25,
                    1.5,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x5b3b24
                })
            );

        trunk.position.y = 0.75;

        const leaves =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    random(0.7, 1.3),
                    12,
                    12
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x1fa66a
                })
            );

        leaves.position.y = 1.8;

        group.add(trunk);
        group.add(leaves);

        group.position.set(
            random(-50, 50),
            0,
            random(-50, 50)
        );

        cityScene.add(group);
    }
}

function createCitySensors() {

    for (let i = 0; i < 28; i++) {

        const geometry =
            new THREE.SphereGeometry(
                0.35,
                12,
                12
            );

        const material =
            new THREE.MeshBasicMaterial({
                color:
                    i % 7 === 0
                        ? 0xff5577
                        : 0x53ffb1
            });

        const sensor =
            new THREE.Mesh(
                geometry,
                material
            );

        sensor.position.set(
            random(-50, 50),
            random(2, 12),
            random(-50, 50)
        );

        sensor.userData = {
            type: "sensor",
            id: `S-${String(i + 1).padStart(3, "0")}`,
            reading: random(60, 99),
            status:
                i % 7 === 0
                    ? "warning"
                    : "normal"
        };

        cityScene.add(sensor);
        cityObjects.push(sensor);
    }
}

function animateCity() {

    if (!cityRenderer || !cityScene) {
        return;
    }

    requestAnimationFrame(
        animateCity
    );

    if (cityControls) {
        cityControls.update();
    }

    cityRenderer.render(
        cityScene,
        cityCamera
    );
}

function handleCityClick(event) {

    if (
        !cityRenderer ||
        !cityCamera ||
        !cityScene
    ) {
        return;
    }

    const rect =
        cityRenderer.domElement.getBoundingClientRect();

    cityMouse.x =
        ((event.clientX - rect.left) /
            rect.width) * 2 - 1;

    cityMouse.y =
        -((event.clientY - rect.top) /
            rect.height) * 2 + 1;

    cityRaycaster.setFromCamera(
        cityMouse,
        cityCamera
    );

    const hits =
        cityRaycaster.intersectObjects(
            cityObjects,
            false
        );

    if (!hits.length) return;

    const object =
        hits[0].object;

    showCityObjectDetails(
        object.userData
    );
}

function showCityObjectDetails(data) {

    if (!data) return;

    if (data.type === "building") {

        createModal(
            `المبنى ${data.id}`,
            `
            <div class="object-details">

                <div class="object-hero building-object">
                    <i class="fa-solid fa-building"></i>
                </div>

                <div class="detail-grid">

                    <div>
                        <span>استهلاك الطاقة</span>
                        <strong>${data.energy}%</strong>
                    </div>

                    <div>
                        <span>استهلاك المياه</span>
                        <strong>${data.water}%</strong>
                    </div>

                    <div>
                        <span>الكفاءة</span>
                        <strong>${data.efficiency}%</strong>
                    </div>

                    <div>
                        <span>AI Status</span>
                        <strong>MONITORED</strong>
                    </div>

                </div>

                <button class="primary-btn full"
                        onclick="optimizeSelectedBuilding()">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    تحسين المبنى
                </button>

            </div>
            `,
            {
                icon: "fa-building",
                kicker: "DIGITAL TWIN"
            }
        );

    } else {

        createModal(
            `الحساس ${data.id}`,
            `
            <div class="object-details">

                <div class="object-hero sensor-object">
                    <i class="fa-solid fa-satellite-dish"></i>
                </div>

                <div class="detail-grid">

                    <div>
                        <span>القراءة</span>
                        <strong>${data.reading}%</strong>
                    </div>

                    <div>
                        <span>الحالة</span>
                        <strong>
                            ${data.status === "warning"
                                ? "WARNING"
                                : "NORMAL"}
                        </strong>
                    </div>

                </div>

                <div class="brain-explanation">
                    الحساس يرسل بياناته بشكل مستمر إلى
                    محرك الذكاء الاصطناعي.
                </div>

            </div>
            `,
            {
                icon: "fa-satellite-dish",
                kicker: "LIVE SENSOR"
            }
        );
    }
}

function optimizeSelectedBuilding() {

    closeModal();

    state.buildingsOptimized++;
    state.aiActions++;

    improveMetrics(4);

    addTimelineEvent(
        "تم تحسين مبنى ذكي",
        "AI طبق تحسيناً على Digital Twin",
        "success"
    );

    showToast(
        "تم تحسين المبنى بنجاح ورفع كفاءة المدينة",
        "success"
    );
}


/* =========================================================
   CITY CONTROLS
========================================================= */

function toggleDayNight() {

    state.cityNight =
        !state.cityNight;

    if (cityScene) {

        cityScene.background =
            new THREE.Color(
                state.cityNight
                    ? 0x02050b
                    : 0x06101b
            );
    }

    const button = $("dayNightBtn");

    if (button) {

        button.innerHTML =
            state.cityNight
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';
    }

    saveState();

    showToast(
        state.cityNight
            ? "تم تشغيل الوضع الليلي للمدينة"
            : "تم تشغيل الوضع النهاري للمدينة",
        "info"
    );
}

function resetCityCamera() {

    if (!cityCamera) return;

    cityCamera.position.set(
        35,
        28,
        42
    );

    if (cityControls) {
        cityControls.target.set(
            0,
            4,
            0
        );

        cityControls.update();
    }

    showToast(
        "تمت إعادة الكاميرا",
        "success"
    );
}

function optimizeCity() {

    const button = $("optimizeCityBtn");

    if (button) {
        button.classList.add("loading");
    }

    showToast(
        "AI يقوم بتحليل المدينة...",
        "info"
    );

    setTimeout(() => {

        improveMetrics(7);

        state.cityEvolution =
            clamp(
                state.cityEvolution + 10,
                0,
                100
            );

        state.aiActions += 5;

        addTimelineEvent(
            "تم تحسين المدينة",
            "تم تحسين الطاقة والمياه والنفايات",
            "success"
        );

        updateEvolutionUI();

        showToast(
            "اكتمل تحسين المدينة بنجاح",
            "success"
        );

        if (button) {
            button.classList.remove("loading");
        }

    }, 1500);
}

function updateCityHeartbeat() {

    const blips =
        qsa(".radar-blip");

    blips.forEach(blip => {

        blip.style.left =
            `${random(20, 80)}%`;

        blip.style.top =
            `${random(20, 80)}%`;
    });
}


/* =========================================================
   INVESTIGATION SYSTEM
========================================================= */

const investigationSteps = [
    {
        text: "جاري استقبال البيانات من حساسات المدينة...",
        delay: 600
    },
    {
        text: "تم اكتشاف انخفاض غير طبيعي في ضغط المياه...",
        delay: 800
    },
    {
        text: "AI يقارن البيانات مع السجل التاريخي...",
        delay: 900
    },
    {
        text: "تم اكتشاف نمط مشابه لحالات التسرب السابقة...",
        delay: 900
    },
    {
        text: "جاري تحديد المنطقة الأكثر احتمالاً...",
        delay: 800
    },
    {
        text: "تم تحديد القطاع B-07 كمنطقة مشتبه بها...",
        delay: 900
    },
    {
        text: "جاري حساب احتمالية السبب الجذري...",
        delay: 800
    },
    {
        text: "تم تحديد تسرب في خط المياه الرئيسي...",
        delay: 900
    }
];

function startInvestigation() {

    navigate("detective");

    currentInvestigationStep = 0;

    const consoleBox =
        $("investigationConsole");

    if (consoleBox) {
        consoleBox.innerHTML = "";
    }

    if ($("applyInvestigationBtn")) {
        $("applyInvestigationBtn").disabled = true;
    }

    state.investigationComplete = false;

    runInvestigationStep();
}

function runInvestigationStep() {

    if (
        currentInvestigationStep >=
        investigationSteps.length
    ) {

        finishInvestigation();

        return;
    }

    const step =
        investigationSteps[
            currentInvestigationStep
        ];

    const consoleBox =
        $("investigationConsole");

    if (consoleBox) {

        const line =
            document.createElement("div");

        line.className =
            "console-line active";

        line.innerHTML = `
            <span class="console-time">
                ${new Date().toLocaleTimeString(
                    "en-GB"
                )}
            </span>

            <span>${step.text}</span>
        `;

        consoleBox.appendChild(line);

        consoleBox.scrollTop =
            consoleBox.scrollHeight;
    }

    currentInvestigationStep++;

    setTimeout(
        runInvestigationStep,
        step.delay
    );
}

function finishInvestigation() {

    state.investigationComplete = true;

    $("findingTitle").textContent =
        "تسرب مياه في الخط الرئيسي";

    $("confidenceValue").textContent =
        "96%";

    $("findingLocation").textContent =
        "Sector B-07";

    $("findingProblem").textContent =
        "انخفاض ضغط المياه";

    $("findingSolution").textContent =
        "عزل الخط وإعادة توزيع التدفق";

    $("explainText").textContent =
        "اعتمد الذكاء الاصطناعي على انخفاض الضغط وتغير معدل التدفق ومقارنة النمط مع سجلات سابقة للوصول إلى السبب الأكثر احتمالاً.";

    const button =
        $("applyInvestigationBtn");

    if (button) {
        button.disabled = false;
    }

    addTimelineEvent(
        "تم اكتشاف السبب الجذري",
        "تسرب مياه في Sector B-07",
        "warning"
    );

    showToast(
        "اكتمل التحقيق وتم تحديد السبب الجذري",
        "success"
    );

    speak(
        "اكتمل التحقيق وتم تحديد السبب الجذري"
    );

    saveState();
}

function applyInvestigation() {

    if (!state.investigationComplete) return;

    improveMetrics(8);

    state.missions.water = true;

    state.aiActions += 3;

    addTimelineEvent(
        "تم تطبيق حل التسرب",
        "تمت إعادة موازنة شبكة المياه",
        "success"
    );

    showToast(
        "تم تطبيق الحل ورفع كفاءة المياه",
        "success"
    );

    renderMissions();

    saveState();
}


/* =========================================================
   FUTURE SIMULATOR
========================================================= */

function initFutureControls() {

    const controls = [
        ["renewableSlider", "renewableValue", "renewable"],
        ["recycleSlider", "recycleValue", "recycle"],
        ["greenSlider", "greenValue", "green"],
        ["transportSlider", "transportValue", "transport"]
    ];

    controls.forEach(([sliderId, valueId, key]) => {

        const slider = $(sliderId);

        if (!slider) return;

        slider.value =
            state.future[key];

        slider.addEventListener(
            "input",
            () => {

                state.future[key] =
                    Number(slider.value);

                const value =
                    $(valueId);

                if (value) {
                    value.textContent =
                        `${slider.value}%`;
                }

            }
        );
    });

    qsa(".year-btn").forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                qsa(".year-btn")
                    .forEach(b =>
                        b.classList.remove("active")
                    );

                btn.classList.add("active");

                state.future.years =
                    Number(btn.dataset.years);
            }
        );
    });
}

function runFutureSimulation() {

    const years =
        state.future.years;

    const renewable =
        state.future.renewable;

    const recycle =
        state.future.recycle;

    const green =
        state.future.green;

    const transport =
        state.future.transport;

    const sustainability =
        (
            renewable +
            recycle +
            green +
            transport
        ) / 4;

    const futureScore =
        clamp(
            Math.round(
                sustainability * 0.75 +
                state.ecoScore * 0.25 +
                years * 0.5
            ),
            0,
            100
        );

    const co2Reduction =
        clamp(
            Math.round(
                sustainability * 0.72
            ),
            0,
            90
        );

    const waterSaving =
        clamp(
            Math.round(
                recycle * 0.3 +
                green * 0.2
            ),
            0,
            70
        );

    createModal(
        `بعد ${years} سنوات`,
        `
        <div class="future-result">

            <div class="future-score">
                <div>
                    <span>PROJECTED ECO SCORE</span>
                    <strong>${futureScore}</strong>
                    <small>/100</small>
                </div>
            </div>

            <div class="future-result-grid">

                <div>
                    <i class="fa-solid fa-smog"></i>
                    <span>انخفاض CO₂</span>
                    <strong>${co2Reduction}%</strong>
                </div>

                <div>
                    <i class="fa-solid fa-droplet"></i>
                    <span>توفير المياه</span>
                    <strong>${waterSaving}%</strong>
                </div>

                <div>
                    <i class="fa-solid fa-solar-panel"></i>
                    <span>الطاقة النظيفة</span>
                    <strong>${renewable}%</strong>
                </div>

                <div>
                    <i class="fa-solid fa-tree"></i>
                    <span>المساحات الخضراء</span>
                    <strong>${green}%</strong>
                </div>

            </div>

            <div class="brain-explanation">
                المحاكاة تعتمد على نموذج افتراضي تعليمي يوضح
                كيف يمكن أن تتغير المؤشرات عند تغيير قرارات المدينة.
            </div>

            <button class="primary-btn full"
                    onclick="applyFutureScenario()">
                <i class="fa-solid fa-check"></i>
                اعتماد السيناريو
            </button>

        </div>
        `,
        {
            icon: "fa-forward-fast",
            kicker: "FUTURE SIMULATOR"
        }
    );

    state.aiActions++;

    addTimelineEvent(
        "تم تشغيل محاكاة مستقبلية",
        `توقعات ${years} سنوات`,
        "blue"
    );
}

function applyFutureScenario() {

    closeModal();

    improveMetrics(
        Math.max(
            3,
            Math.round(
                (
                    state.future.renewable +
                    state.future.recycle +
                    state.future.green +
                    state.future.transport
                ) / 100
            )
        )
    );

    state.cityEvolution =
        clamp(
            state.cityEvolution + 12,
            0,
            100
        );

    updateEvolutionUI();

    showToast(
        "تم اعتماد السيناريو المستقبلي",
        "success"
    );

    saveState();
}


/* =========================================================
   DECISION ROOM
========================================================= */

const decisionPlans = {

    A: {
        title: "خطة الطاقة الخضراء",
        description:
            "رفع الاعتماد على الطاقة الشمسية وتحسين الشبكة الذكية.",
        impact: {
            energy: 12,
            air: 6
        }
    },

    B: {
        title: "خطة المياه الذكية",
        description:
            "استخدام حساسات إضافية ومراقبة الضغط لتقليل الهدر.",
        impact: {
            water: 15,
            waste: 2
        }
    },

    C: {
        title: "خطة المدينة الخضراء",
        description:
            "زيادة المساحات الخضراء والنقل الذكي.",
        impact: {
            air: 10,
            biodiversity: 15
        }
    }

};

function choosePlan(plan) {

    const selected =
        decisionPlans[plan];

    if (!selected) return;

    state.selectedPlan = plan;

    Object.entries(
        selected.impact
    ).forEach(([key, value]) => {

        if (state.metrics[key] !== undefined) {

            state.metrics[key] =
                clamp(
                    state.metrics[key] + value,
                    0,
                    100
                );
        }

    });

    state.aiActions += 2;

    if (plan === "B") {
        state.missions.water = true;
    }

    improveMetrics(2);

    showButterflyEffect(
        selected
    );

    saveState();
}

function showButterflyEffect(plan) {

    createModal(
        "Butterfly Effect",
        `
        <div class="butterfly-effect">

            <div class="butterfly-intro">

                <div class="butterfly-icon">
                    <i class="fa-solid fa-dove"></i>
                </div>

                <h3>${plan.title}</h3>

                <p>${plan.description}</p>

            </div>

            <div class="effect-chain">

                <div>
                    <span>01</span>
                    <i class="fa-solid fa-user-gear"></i>
                    <strong>قرار بشري</strong>
                </div>

                <i class="fa-solid fa-arrow-left"></i>

                <div>
                    <span>02</span>
                    <i class="fa-solid fa-brain"></i>
                    <strong>تحليل AI</strong>
                </div>

                <i class="fa-solid fa-arrow-left"></i>

                <div>
                    <span>03</span>
                    <i class="fa-solid fa-city"></i>
                    <strong>تغير المدينة</strong>
                </div>

                <i class="fa-solid fa-arrow-left"></i>

                <div>
                    <span>04</span>
                    <i class="fa-solid fa-leaf"></i>
                    <strong>الأثر البيئي</strong>
                </div>

            </div>

            <div class="effect-message">
                قرار صغير يمكن أن يغير سلسلة كاملة من النتائج.
            </div>

        </div>
        `,
        {
            icon: "fa-wind",
            kicker: "BUTTERFLY EFFECT"
        }
    );
}


/* =========================================================
   MEMORY
========================================================= */

function renderMemory() {

    const container =
        $("memoryList");

    if (!container) return;

    container.innerHTML = "";

    if (!state.memory.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-brain"></i>
                <strong>لا توجد ذكريات بعد</strong>
                <span>سيبدأ النظام ببناء ذاكرته من قراراتك.</span>
            </div>
        `;

        return;
    }

    state.memory.forEach(memory => {

        const item =
            document.createElement("div");

        item.className =
            "memory-item";

        item.innerHTML = `
            <div class="memory-icon">
                <i class="fa-solid fa-brain"></i>
            </div>

            <div class="memory-content">
                <strong>${memory.title}</strong>
                <span>${memory.detail}</span>
            </div>

            <div class="memory-confidence">
                ${memory.confidence}%
            </div>
        `;

        container.appendChild(item);
    });
}

function addMemory(title, detail) {

    state.memory.unshift({
        title,
        detail,
        confidence: random(88, 98)
    });

    state.memory =
        state.memory.slice(0, 15);

    renderMemory();
    saveState();
}

function clearMemory() {

    state.memory = [];

    renderMemory();

    showToast(
        "تم تنظيف ذاكرة المدينة",
        "success"
    );

    saveState();
}


/* =========================================================
   ECO DNA
========================================================= */

function updateEcoDNA() {

    const values = {
        air: state.metrics.air,
        water: state.metrics.water,
        energy: state.metrics.energy,
        waste: state.metrics.waste,
        biodiversity: state.metrics.biodiversity
    };

    Object.entries(values).forEach(
        ([key, value]) => {

            const bar =
                $(`dna-${key}`);

            const number =
                $(`dna-${key}-value`);

            if (bar) {
                bar.style.width =
                    `${value}%`;
            }

            if (number) {
                number.textContent =
                    `${Math.round(value)}%`;
            }
        }
    );
}


/* =========================================================
   EARTH / SATELLITE
========================================================= */

function initEarth() {

    const container = $("earth3D");

    if (!container || typeof THREE === "undefined") {
        return;
    }

    if (earthRenderer) {

        earthRenderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

        return;
    }

    earthScene =
        new THREE.Scene();

    earthCamera =
        new THREE.PerspectiveCamera(
            45,
            container.clientWidth /
            container.clientHeight,
            0.1,
            1000
        );

    earthCamera.position.z = 5;

    earthRenderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

    earthRenderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    earthRenderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

    container.innerHTML = "";

    container.appendChild(
        earthRenderer.domElement
    );

    const earth =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1.7,
                64,
                64
            ),
            new THREE.MeshStandardMaterial({
                color: 0x185d75,
                roughness: 0.7,
                metalness: 0.1
            })
        );

    earthScene.add(earth);

    const atmosphere =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1.78,
                64,
                64
            ),
            new THREE.MeshBasicMaterial({
                color: 0x46d9ff,
                transparent: true,
                opacity: 0.08,
                side: THREE.BackSide
            })
        );

    earthScene.add(atmosphere);

    for (let i = 0; i < 120; i++) {

        const point =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.018,
                    6,
                    6
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x53ffb1
                })
            );

        const phi =
            Math.acos(
                -1 +
                (2 * i) / 120
            );

        const theta =
            Math.sqrt(
                120 * Math.PI
            ) * phi;

        point.position.set(
            1.76 *
                Math.cos(theta) *
                Math.sin(phi),

            1.76 *
                Math.sin(theta) *
                Math.sin(phi),

            1.76 *
                Math.cos(phi)
        );

        earthScene.add(point);
    }

    earthScene.add(
        new THREE.AmbientLight(
            0xffffff,
            1.7
        )
    );

    const light =
        new THREE.PointLight(
            0xffffff,
            3
        );

    light.position.set(
        5,
        3,
        5
    );

    earthScene.add(light);

    if (THREE.OrbitControls) {

        earthControls =
            new THREE.OrbitControls(
                earthCamera,
                earthRenderer.domElement
            );

        earthControls.enableDamping = true;
    }

    animateEarth();
}

function animateEarth() {

    if (!earthRenderer) return;

    requestAnimationFrame(
        animateEarth
    );

    if (earthControls) {
        earthControls.update();
    }

    earthScene.rotation.y += 0.0015;

    earthRenderer.render(
        earthScene,
        earthCamera
    );
}


/* =========================================================
   VISION AI
========================================================= */

function analyzeVision() {

    const result =
        $("visionResult");

    if (!result) return;

    result.innerHTML = `
        <div class="vision-analysis-loading">

            <div class="ai-spinner"></div>

            <strong>
                جاري تحليل الصورة...
            </strong>

            <span>
                Environmental Vision AI
            </span>

        </div>
    `;

    setTimeout(() => {

        const analyses = [
            {
                title: "مؤشر بيئي جيد",
                text: "تم اكتشاف مساحة خضراء ومؤشرات بيئية مستقرة."
            },
            {
                title: "مشكلة نفايات",
                text: "تم رصد تجمع نفايات يحتاج إلى تدخل."
            },
            {
                title: "ازدحام مروري",
                text: "تم رصد كثافة مركبات مرتفعة في المنطقة."
            },
            {
                title: "مساحة قابلة للتطوير",
                text: "تم اكتشاف مساحة يمكن تحويلها إلى منطقة خضراء."
            }
        ];

        const resultData =
            analyses[
                random(
                    0,
                    analyses.length - 1
                )
            ];

        result.innerHTML = `
            <div class="vision-result-icon">
                <i class="fa-solid fa-eye"></i>
            </div>

            <div>
                <span class="card-kicker">
                    AI VISION SIMULATION
                </span>

                <h3>${resultData.title}</h3>

                <p>${resultData.text}</p>

                <div class="vision-confidence">
                    Confidence ${random(91, 98)}%
                </div>
            </div>
        `;

        showToast(
            "اكتمل التحليل البصري",
            "success"
        );

    }, 1800);
}

function setupVisionUpload() {

    const input =
        $("visionInput");

    const dropzone =
        $("visionDropzone");

    if (!input || !dropzone) return;

    dropzone.addEventListener(
        "click",
        () => input.click()
    );

    input.addEventListener(
        "change",
        () => {

            if (
                input.files &&
                input.files.length
            ) {
                analyzeVision();
            }
        }
    );

    [
        "dragenter",
        "dragover"
    ].forEach(event => {

        dropzone.addEventListener(
            event,
            e => {
                e.preventDefault();
                dropzone.classList.add("dragging");
            }
        );
    });

    [
        "dragleave",
        "drop"
    ].forEach(event => {

        dropzone.addEventListener(
            event,
            e => {
                e.preventDefault();
                dropzone.classList.remove("dragging");
            }
        );
    });

    dropzone.addEventListener(
        "drop",
        e => {

            if (
                e.dataTransfer.files &&
                e.dataTransfer.files.length
            ) {
                analyzeVision();
            }
        }
    );
}


/* =========================================================
   AI COMMAND CENTER
========================================================= */

function processCommand(command) {

    if (!command) return;

    const text =
        command.toLowerCase();

    addCommandMessage(
        command,
        "user"
    );

    let response =
        "حللت الأمر وسأراقب المدينة.";

    if (
        text.includes("ماء") ||
        text.includes("مياه") ||
        text.includes("water")
    ) {

        response =
            `مؤشر المياه الحالي ${Math.round(
                state.metrics.water
            )}%. أوصي بمراقبة الضغط وتقليل الفقد في الشبكة.`;

    } else if (
        text.includes("طاقة") ||
        text.includes("كهرباء") ||
        text.includes("energy")
    ) {

        response =
            `كفاءة الطاقة الحالية ${Math.round(
                state.metrics.energy
            )}%. يمكن تحسين الأحمال وتشغيل الطاقة المتجددة.`;

    } else if (
        text.includes("هواء") ||
        text.includes("تلوث") ||
        text.includes("air")
    ) {

        response =
            `جودة الهواء الحالية ${Math.round(
                state.metrics.air
            )}%. سأتابع مناطق التلوث والازدحام.`;

    } else if (
        text.includes("مدينة") ||
        text.includes("city")
    ) {

        response =
            `الصحة البيئية للمدينة حالياً ${calculateHealth()}/100 والذكاء الاصطناعي يعمل بشكل طبيعي.`;

    } else if (
        text.includes("أزمة") ||
        text.includes("خطر") ||
        text.includes("crisis")
    ) {

        startCrisis();

        response =
            "تم تفعيل وضع الأزمة البيئية. راقب المؤشرات واتخذ القرار المناسب.";

    } else if (
        text.includes("مستقبل") ||
        text.includes("future")
    ) {

        navigate("future");

        response =
            "تم فتح محاكي المستقبل. يمكنك تغيير القرارات ومشاهدة تأثيرها.";

    } else if (
        text.includes("تحقيق") ||
        text.includes("مشكلة")
    ) {

        startInvestigation();

        response =
            "بدأت التحقيق البيئي وسأبحث عن السبب الجذري.";

    } else {

        response =
            "فهمت طلبك. يمكنني مراقبة المياه والطاقة والهواء والنفايات ومحاكاة الأزمات والمستقبل.";
    }

    setTimeout(() => {

        addCommandMessage(
            response,
            "ai"
        );

        speak(response);

    }, 450);
}

function addCommandMessage(
    message,
    type
) {

    const container =
        $("commandMessages");

    if (!container) return;

    const item =
        document.createElement("div");

    item.className =
        `command-message ${type}`;

    item.innerHTML = `
        <div class="command-avatar">
            <i class="fa-solid ${
                type === "ai"
                    ? "fa-brain"
                    : "fa-user"
            }"></i>
        </div>

        <div class="command-bubble">
            ${message}
        </div>
    `;

    container.appendChild(item);

    container.scrollTop =
        container.scrollHeight;
}


/* =========================================================
   VOICE SYSTEM
========================================================= */

function findArabicVoice() {

    const voices =
        speechSynthesis.getVoices();

    return (
        voices.find(
            v =>
                v.lang &&
                v.lang.toLowerCase()
                    .startsWith("ar")
        ) ||
        voices[0]
    );
}

function speak(text) {

    if (!state.voice) return;

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang = "ar-JO";
    utterance.rate = 0.92;
    utterance.pitch = 1;

    const voice =
        findArabicVoice();

    if (voice) {
        utterance.voice = voice;
    }

    speechSynthesis.speak(
        utterance
    );
}

function speakWelcome() {

    if (
        welcomeSpoken ||
        !state.voice
    ) {
        return;
    }

    welcomeSpoken = true;

    speak(
        "أهلاً بك في منصة ECOGENESIS AI، المدينة التي تتعلم من نفسها. تم تشغيل نظام الذكاء البيئي."
    );
}

function toggleVoice() {

    state.voice = !state.voice;

    const status =
        $("voiceStatus");

    const icon =
        qs("#voiceToggle i");

    if (status) {
        status.textContent =
            state.voice
                ? "ON"
                : "OFF";
    }

    if (icon) {
        icon.className =
            state.voice
                ? "fa-solid fa-volume-high"
                : "fa-solid fa-volume-xmark";
    }

    if (!state.voice) {
        speechSynthesis.cancel();
    }

    saveState();

    showToast(
        state.voice
            ? "تم تشغيل الصوت الذكي"
            : "تم إيقاف الصوت الذكي",
        "info"
    );
}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeechRecognition() {

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!Recognition) {
        return;
    }

    speechRecognition =
        new Recognition();

    speechRecognition.lang =
        "ar-JO";

    speechRecognition.continuous =
        false;

    speechRecognition.interimResults =
        false;

    speechRecognition.onstart = () => {

        showToast(
            "استمع إليك النظام الآن...",
            "info"
        );

        const btn =
            $("voiceCommandBtn");

        if (btn) {
            btn.classList.add("recording");
        }
    };

    speechRecognition.onend = () => {

        const btn =
            $("voiceCommandBtn");

        if (btn) {
            btn.classList.remove("recording");
        }
    };

    speechRecognition.onerror = () => {

        showToast(
            "تعذر فهم الأمر الصوتي",
            "warning"
        );
    };

    speechRecognition.onresult = event => {

        const transcript =
            event.results[0][0].transcript;

        processCommand(
            transcript
        );
    };
}

function startVoiceCommand() {

    if (!speechRecognition) {

        showToast(
            "المتصفح لا يدعم الأوامر الصوتية",
            "warning"
        );

        return;
    }

    try {
        speechRecognition.start();
    } catch {
        // recognition already running
    }
}


/* =========================================================
   CRISIS MODE
========================================================= */

const crisisTypes = [
    {
        title: "أزمة مياه",
        icon: "fa-droplet",
        description:
            "تم اكتشاف تسرب كبير في شبكة المياه.",
        actions: [
            "عزل المنطقة",
            "إعادة توزيع التدفق",
            "إرسال فريق الصيانة"
        ]
    },
    {
        title: "موجة حرارة",
        icon: "fa-temperature-high",
        description:
            "ارتفاع مفاجئ في الحرارة داخل عدة مناطق.",
        actions: [
            "تشغيل التبريد الذكي",
            "زيادة المساحات المظللة",
            "خفض الأحمال"
        ]
    },
    {
        title: "تلوث هوائي",
        icon: "fa-smog",
        description:
            "ارتفاع مستويات الملوثات في منطقة صناعية.",
        actions: [
            "تحويل حركة المرور",
            "زيادة التهوية",
            "تفعيل مراقبة المصانع"
        ]
    }
];

let currentCrisis = null;

function startCrisis() {

    currentCrisis =
        crisisTypes[
            random(
                0,
                crisisTypes.length - 1
            )
        ];

    state.crisisActive = true;

    createModal(
        currentCrisis.title,
        `
        <div class="crisis-modal">

            <div class="crisis-warning">

                <div class="crisis-pulse">
                    <i class="fa-solid ${currentCrisis.icon}"></i>
                </div>

                <div>
                    <span>CRITICAL EVENT</span>
                    <strong>
                        ${currentCrisis.description}
                    </strong>
                </div>

            </div>

            <h3>
                اختر الإجراء الذي ستتخذه المدينة
            </h3>

            <div class="crisis-actions">

                ${currentCrisis.actions.map(
                    (action, index) => `
                    <button
                        class="crisis-action"
                        onclick="resolveCrisis(${index})">

                        <span>
                            0${index + 1}
                        </span>

                        <i class="fa-solid ${
                            index === 0
                                ? "fa-shield"
                                : index === 1
                                    ? "fa-arrows-rotate"
                                    : "fa-users-gear"
                        }"></i>

                        <strong>
                            ${action}
                        </strong>

                        <i class="fa-solid fa-arrow-left"></i>

                    </button>
                `
                ).join("")}

            </div>

        </div>
        `,
        {
            icon: "fa-triangle-exclamation",
            kicker: "CRISIS CONTROL CENTER"
        }
    );

    showToast(
        "تم اكتشاف أزمة بيئية!",
        "error"
    );

    speak(
        `تحذير. ${currentCrisis.title}. تم تفعيل مركز التحكم بالطوارئ.`
    );
}

function resolveCrisis(index) {

    closeModal();

    state.crisisActive = false;

    const quality =
        index === 0
            ? 9
            : index === 1
                ? 7
                : 5;

    improveMetrics(
        quality
    );

    state.missions.crisis = true;

    state.aiActions += 4;

    addTimelineEvent(
        "تم احتواء الأزمة",
        currentCrisis.title,
        "success"
    );

    addMemory(
        "إدارة أزمة",
        `تم التعامل مع ${currentCrisis.title}`
    );

    showToast(
        "تم احتواء الأزمة بنجاح",
        "success"
    );

    saveState();

    renderMissions();
}


/* =========================================================
   EXPERIMENT LAB
========================================================= */

function openExperimentLab() {

    createModal(
        "Eco Experiment Lab",
        `
        <div class="experiment-lab">

            <div class="experiment-intro">
                جرّب تغيير متغير بيئي وشاهد النتيجة الافتراضية.
            </div>

            <div class="experiment-grid">

                <button
                    class="experiment-card"
                    onclick="runExperiment('trees')">

                    <i class="fa-solid fa-tree"></i>

                    <strong>
                        إضافة أشجار
                    </strong>

                    <span>
                        تأثير المساحات الخضراء
                    </span>

                </button>

                <button
                    class="experiment-card"
                    onclick="runExperiment('solar')">

                    <i class="fa-solid fa-solar-panel"></i>

                    <strong>
                        الطاقة الشمسية
                    </strong>

                    <span>
                        تقليل الاعتماد على الشبكة
                    </span>

                </button>

                <button
                    class="experiment-card"
                    onclick="runExperiment('recycle')">

                    <i class="fa-solid fa-recycle"></i>

                    <strong>
                        إعادة التدوير
                    </strong>

                    <span>
                        تقليل النفايات
                    </span>

                </button>

                <button
                    class="experiment-card"
                    onclick="runExperiment('water')">

                    <i class="fa-solid fa-droplet"></i>

                    <strong>
                        المياه الذكية
                    </strong>

                    <span>
                        تقليل الهدر
                    </span>

                </button>

            </div>

        </div>
        `,
        {
            icon: "fa-flask",
            kicker: "ECO EXPERIMENT LAB"
        }
    );
}

function runExperiment(type) {

    const effects = {

        trees: {
            message:
                "زيادة الأشجار يمكن أن تحسن جودة الهواء والتنوع الحيوي.",
            metrics: {
                air: 5,
                biodiversity: 8
            }
        },

        solar: {
            message:
                "الطاقة الشمسية يمكن أن تقلل الضغط على شبكة الكهرباء.",
            metrics: {
                energy: 8,
                air: 3
            }
        },

        recycle: {
            message:
                "رفع إعادة التدوير يساعد على تقليل النفايات.",
            metrics: {
                waste: 10
            }
        },

        water: {
            message:
                "المراقبة الذكية للمياه تساعد على اكتشاف التسرب مبكراً.",
            metrics: {
                water: 9
            }
        }
    };

    const result =
        effects[type];

    if (!result) return;

    Object.entries(
        result.metrics
    ).forEach(([key, value]) => {

        if (state.metrics[key] !== undefined) {

            state.metrics[key] =
                clamp(
                    state.metrics[key] + value,
                    0,
                    100
                );
        }

    });

    state.aiActions++;

    updateMetricsUI();

    addTimelineEvent(
        "Eco Experiment",
        result.message,
        "success"
    );

    showToast(
        result.message,
        "success"
    );

    saveState();

    closeModal();
}


/* =========================================================
   CITY EVOLUTION
========================================================= */

function updateEvolutionUI() {

    const value =
        state.cityEvolution;

    const bar =
        $("evolutionBar");

    const number =
        $("evolutionValue");

    if (bar) {
        bar.style.width =
            `${value}%`;
    }

    if (number) {
        number.textContent =
            `${value}%`;
    }
}

function openEvolution() {

    const stages = [
        "Genesis",
        "Green",
        "Sustainable",
        "Intelligent",
        "EcoGenesis"
    ];

    const index =
        Math.min(
            4,
            Math.floor(
                state.cityEvolution / 20
            )
        );

    createModal(
        "تطور المدينة",
        `
        <div class="evolution-modal">

            <div class="evolution-score">
                <strong>${state.cityEvolution}%</strong>
                <span>City Evolution</span>
            </div>

            <div class="evolution-stages">

                ${stages.map(
                    (stage, i) => `
                    <div class="
                        evolution-stage
                        ${i <= index ? "unlocked" : ""}
                        ${i === index ? "current" : ""}
                    ">

                        <div class="stage-number">
                            ${i + 1}
                        </div>

                        <strong>${stage}</strong>

                        <small>
                            ${
                                i <= index
                                    ? "UNLOCKED"
                                    : "LOCKED"
                            }
                        </small>

                    </div>
                `
                ).join("")}

            </div>

        </div>
        `,
        {
            icon: "fa-seedling",
            kicker: "CITY EVOLUTION"
        }
    );
}


/* =========================================================
   MISSIONS
========================================================= */

const missionData = [
    {
        key: "air",
        title: "نظف الهواء",
        description:
            "ارفع مؤشر جودة الهواء إلى 90%",
        icon: "fa-wind"
    },
    {
        key: "water",
        title: "احمِ المياه",
        description:
            "أكمل تحقيقاً بيئياً عن المياه",
        icon: "fa-droplet"
    },
    {
        key: "energy",
        title: "طاقة ذكية",
        description:
            "ارفع كفاءة الطاقة إلى 85%",
        icon: "fa-bolt"
    },
    {
        key: "trees",
        title: "مدينة خضراء",
        description:
            "شغّل تجربة الأشجار",
        icon: "fa-tree"
    },
    {
        key: "crisis",
        title: "منقذ المدينة",
        description:
            "تعامل مع أزمة بيئية",
        icon: "fa-shield-halved"
    }
];

function checkMissions() {

    if (state.metrics.air >= 90) {
        state.missions.air = true;
    }

    if (state.metrics.energy >= 85) {
        state.missions.energy = true;
    }
}

function renderMissions() {

    checkMissions();

    const container =
        $("missionsList");

    if (!container) return;

    container.innerHTML = "";

    missionData.forEach(
        mission => {

            const completed =
                state.missions[
                    mission.key
                ];

            const item =
                document.createElement("div");

            item.className =
                `mission-card ${
                    completed
                        ? "completed"
                        : ""
                }`;

            item.innerHTML = `

                <div class="mission-icon">
                    <i class="fa-solid ${mission.icon}"></i>
                </div>

                <div class="mission-content">

                    <span>
                        ${
                            completed
                                ? "COMPLETED"
                                : "MISSION"
                        }
                    </span>

                    <strong>
                        ${mission.title}
                    </strong>

                    <p>
                        ${mission.description}
                    </p>

                </div>

                <div class="mission-state">

                    ${
                        completed
                            ? `
                                <i class="fa-solid fa-check"></i>
                              `
                            : `
                                <i class="fa-solid fa-lock-open"></i>
                              `
                    }

                </div>

            `;

            container.appendChild(item);
        }
    );

    saveState();
}


/* =========================================================
   COMMAND SHORTCUTS
========================================================= */

function openAssistant() {

    createModal(
        "AI Co-Pilot",
        `
        <div class="assistant-modal">

            <div class="assistant-avatar">
                <i class="fa-solid fa-sparkles"></i>
            </div>

            <h3>
                كيف يمكنني مساعدتك؟
            </h3>

            <p>
                يمكنك كتابة أو قول أي أمر متعلق بالمدينة.
            </p>

            <div class="assistant-suggestions">

                <button onclick="
                    closeModal();
                    processCommand('حلل حالة المياه');
                ">
                    <i class="fa-solid fa-droplet"></i>
                    حلل المياه
                </button>

                <button onclick="
                    closeModal();
                    processCommand('حلل الطاقة');
                ">
                    <i class="fa-solid fa-bolt"></i>
                    حلل الطاقة
                </button>

                <button onclick="
                    closeModal();
                    processCommand('ابدأ تحقيق');
                ">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    ابدأ تحقيق
                </button>

                <button onclick="
                    closeModal();
                    startCrisis();
                ">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    محاكاة أزمة
                </button>

            </div>

        </div>
        `,
        {
            icon: "fa-sparkles",
            kicker: "AI CO-PILOT"
        }
    );
}


/* =========================================================
   REPORT EXPORT
========================================================= */

function exportReport() {

    const report = `
ECOGENESIS AI
CITY INTELLIGENCE ENGINE
=================================

تقرير حالة المدينة

التاريخ:
${new Date().toLocaleString("ar-JO")}

---------------------------------
المؤشرات البيئية
---------------------------------

جودة الهواء:
${Math.round(state.metrics.air)}%

كفاءة المياه:
${Math.round(state.metrics.water)}%

كفاءة الطاقة:
${Math.round(state.metrics.energy)}%

إدارة النفايات:
${Math.round(state.metrics.waste)}%

التنوع الحيوي:
${Math.round(state.metrics.biodiversity)}%

الصحة البيئية:
${calculateHealth()}/100

---------------------------------
الذكاء الاصطناعي
---------------------------------

مستوى التعلم:
${state.learning}%

عدد قرارات AI:
${state.aiActions}

المباني المحسنة:
${state.buildingsOptimized}

تطور المدينة:
${state.cityEvolution}%

---------------------------------
المهام
---------------------------------

${Object.entries(state.missions)
    .map(
        ([key, value]) =>
            `${key}: ${value ? "COMPLETED" : "PENDING"}`
    )
    .join("\n")}

---------------------------------

هذا التقرير تم توليده بواسطة
ECOGENESIS AI

ملاحظة:
بعض نتائج المحاكاة والرؤية الذكية
هي نماذج تعليمية محاكاة وليست نظام
ذكاء اصطناعي إنتاجي متصل ببيانات مدينة حقيقية.
`;

    const blob =
        new Blob(
            [report],
            {
                type: "text/plain;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "ECOGENESIS-AI-REPORT.txt";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast(
        "تم إنشاء تقرير المدينة",
        "success"
    );
}


/* =========================================================
   JUDGE MODE
========================================================= */

const judgeSteps = [
    {
        page: "dashboard",
        title: "مركز القيادة",
        text:
            "نبدأ من مركز القيادة لمشاهدة الحالة البيئية الحية."
    },
    {
        page: "city",
        title: "Digital Twin",
        text:
            "هذه نسخة رقمية تفاعلية من المدينة."
    },
    {
        page: "detective",
        title: "Environmental Detective",
        text:
            "هنا يستطيع الذكاء الاصطناعي اكتشاف السبب الجذري للمشكلة."
    },
    {
        page: "future",
        title: "Future Simulator",
        text:
            "يمكننا اختبار قرارات مختلفة ومعرفة أثرها المستقبلي."
    },
    {
        page: "decision",
        title: "Decision Room",
        text:
            "كل قرار يصنع سلسلة من التأثيرات داخل المدينة."
    }
];

let judgeIndex = 0;

function prepareJudgeMode() {

    const progress =
        $("judgeProgress");

    if (progress) {
        progress.style.width =
            `${((judgeIndex + 1) /
                judgeSteps.length) * 100}%`;
    }
}

function startJudgeMode() {

    judgeIndex = 0;

    runJudgeStep();
}

function runJudgeStep() {

    const step =
        judgeSteps[judgeIndex];

    if (!step) return;

    navigate(step.page);

    setTimeout(() => {

        createModal(
            step.title,
            `
            <div class="judge-modal">

                <div class="judge-number">
                    ${String(
                        judgeIndex + 1
                    ).padStart(2, "0")}
                </div>

                <p>
                    ${step.text}
                </p>

                <div class="judge-controls">

                    ${
                        judgeIndex > 0
                            ? `
                            <button
                                class="secondary-btn"
                                onclick="
                                    closeModal();
                                    judgeIndex--;
                                    runJudgeStep();
                                ">
                                السابق
                            </button>
                            `
                            : ""
                    }

                    ${
                        judgeIndex <
                        judgeSteps.length - 1
                            ? `
                            <button
                                class="primary-btn"
                                onclick="
                                    closeModal();
                                    judgeIndex++;
                                    runJudgeStep();
                                ">
                                التالي
                                <i class="fa-solid fa-arrow-left"></i>
                            </button>
                            `
                            : `
                            <button
                                class="primary-btn"
                                onclick="
                                    closeModal();
                                    showToast(
                                        'انتهى العرض التقديمي',
                                        'success'
                                    );
                                ">
                                إنهاء العرض
                            </button>
                            `
                    }

                </div>

            </div>
            `,
            {
                icon: "fa-display",
                kicker: "JUDGE MODE"
            }
        );

    }, 250);
}


/* =========================================================
   COPILOT
========================================================= */

function applyCopilot() {

    improveMetrics(5);

    state.aiActions++;

    state.learning =
        clamp(
            state.learning + 3,
            0,
            100
        );

    addMemory(
        "اقتراح AI",
        "تم تطبيق اقتراح تحسين استهلاك الطاقة"
    );

    showToast(
        "تم تطبيق اقتراح AI",
        "success"
    );

    const title =
        $("copilotTitle");

    const message =
        $("copilotMessage");

    if (title) {
        title.textContent =
            "تم تنفيذ الاقتراح";
    }

    if (message) {
        message.textContent =
            "تم تحسين المؤشرات البيئية وتحديث ذاكرة المدينة.";
    }

    saveState();
}

function ignoreCopilot() {

    const title =
        $("copilotTitle");

    const message =
        $("copilotMessage");

    if (title) {
        title.textContent =
            "سأراقب النتيجة";
    }

    if (message) {
        message.textContent =
            "يمكنك تطبيق الاقتراح لاحقاً.";
    }

    showToast(
        "تم تأجيل الاقتراح",
        "info"
    );
}


/* =========================================================
   SATELLITE MODE
========================================================= */

function toggleSatelliteMode() {

    state.satelliteMode =
        !state.satelliteMode;

    if (state.satelliteMode) {

        document.body.classList.add(
            "satellite-mode"
        );

        showToast(
            "تم تفعيل Satellite Intelligence Mode",
            "success"
        );

    } else {

        document.body.classList.remove(
            "satellite-mode"
        );

        showToast(
            "تم إيقاف Satellite Mode",
            "info"
        );
    }

    saveState();
}


/* =========================================================
   AI LEARNING
========================================================= */

function increaseLearning(amount = 1) {

    state.learning =
        clamp(
            state.learning + amount,
            0,
            100
        );

    updateLearningUI();

    saveState();
}

function updateLearningUI() {

    const number =
        $("learningPercent");

    const bar =
        $("learningBar");

    if (number) {
        number.textContent =
            `${Math.round(state.learning)}%`;
    }

    if (bar) {
        bar.style.width =
            `${state.learning}%`;
    }
}


/* =========================================================
   RESET SYSTEM
========================================================= */

function resetSystem() {

    const confirmed =
        confirm(
            "هل تريدين إعادة ECOGENESIS AI إلى الحالة الافتراضية؟"
        );

    if (!confirmed) return;

    state =
        structuredClone(defaultState);

    localStorage.removeItem(
        STORAGE_KEY
    );

    applyState();

    showToast(
        "تمت إعادة النظام بنجاح",
        "success"
    );

    setTimeout(
        () => location.reload(),
        800
    );
}


/* =========================================================
   APPLY STATE
========================================================= */

function applyState() {

    applyTheme();
    applyAccessibility();

    updateMetricsUI();
    updateLearningUI();
    updateEcoDNA();
    updateEvolutionUI();

    if ($("voiceStatus")) {

        $("voiceStatus").textContent =
            state.voice
                ? "ON"
                : "OFF";
    }

    const voiceIcon =
        qs("#voiceToggle i");

    if (voiceIcon) {

        voiceIcon.className =
            state.voice
                ? "fa-solid fa-volume-high"
                : "fa-solid fa-volume-xmark";
    }

    const sliders = {
        renewableSlider:
            state.future.renewable,
        recycleSlider:
            state.future.recycle,
        greenSlider:
            state.future.green,
        transportSlider:
            state.future.transport
    };

    Object.entries(sliders)
        .forEach(([id, value]) => {

            const slider = $(id);

            if (slider) {
                slider.value = value;
            }
        });

    qsa(".year-btn")
        .forEach(btn => {

            btn.classList.toggle(
                "active",
                Number(
                    btn.dataset.years
                ) ===
                state.future.years
            );
        });

    renderMissions();
}


/* =========================================================
   EVENT REPLAY
========================================================= */

function replayEvents() {

    const timeline =
        $("eventTimeline");

    if (!timeline) return;

    const items =
        qsa(
            ".timeline-item",
            timeline
        );

    items.forEach(
        (item, index) => {

            item.style.animation =
                "none";

            void item.offsetWidth;

            item.style.animation =
                `timelineReplay .5s ease ${
                    index * 0.15
                }s both`;
        }
    );

    showToast(
        "جاري إعادة عرض الأحداث",
        "info"
    );
}


/* =========================================================
   GLOBAL ACTION HANDLER
========================================================= */

function handleAction(action) {

    switch (action) {

        case "healthDetails":

            createModal(
                "تحليل صحة المدينة",
                `
                <div class="health-details-modal">

                    <div class="health-big">
                        ${calculateHealth()}
                        <small>/100</small>
                    </div>

                    <p>
                        يعتمد المؤشر على جودة الهواء والمياه
                        والطاقة والنفايات والتنوع الحيوي.
                    </p>

                    <div class="detail-grid">

                        <div>
                            <span>Air</span>
                            <strong>
                                ${Math.round(
                                    state.metrics.air
                                )}%
                            </strong>
                        </div>

                        <div>
                            <span>Water</span>
                            <strong>
                                ${Math.round(
                                    state.metrics.water
                                )}%
                            </strong>
                        </div>

                        <div>
                            <span>Energy</span>
                            <strong>
                                ${Math.round(
                                    state.metrics.energy
                                )}%
                            </strong>
                        </div>

                        <div>
                            <span>Waste</span>
                            <strong>
                                ${Math.round(
                                    state.metrics.waste
                                )}%
                            </strong>
                        </div>

                    </div>

                </div>
                `,
                {
                    icon: "fa-heart-pulse",
                    kicker: "CITY HEALTH"
                }
            );

            break;


        case "openBrain":
            openAIBrain();
            break;


        case "experiment":
            openExperimentLab();
            break;


        case "evolution":
            openEvolution();
            break;


        case "report":
            exportReport();
            break;


        case "future":
            navigate("future");
            break;


        case "city":
            navigate("city");
            break;


        case "detective":
            startInvestigation();
            break;


        case "crisis":
            startCrisis();
            break;
    }
}


/* =========================================================
   DOM EVENTS
========================================================= */

function setupEvents() {

    /* Navigation */

    qsa(".nav-btn").forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    navigate(
                        button.dataset.page
                    );

                    const sidebar =
                        qs(".sidebar");

                    if (sidebar) {
                        sidebar.classList.remove(
                            "mobile-open"
                        );
                    }
                }
            );
        }
    );


    /* Theme */

    const theme =
        $("themeToggle");

    if (theme) {
        theme.addEventListener(
            "click",
            toggleTheme
        );
    }


    /* Voice */

    const voice =
        $("voiceToggle");

    if (voice) {
        voice.addEventListener(
            "click",
            toggleVoice
        );
    }


    /* Voice command */

    const voiceCommand =
        $("voiceCommandBtn");

    if (voiceCommand) {

        voiceCommand.addEventListener(
            "click",
            startVoiceCommand
        );
    }


    /* AI assistant */

    const assistant =
        $("aiAssistantBtn");

    if (assistant) {

        assistant.addEventListener(
            "click",
            openAssistant
        );
    }


    /* Mobile menu */

    const mobileMenu =
        $("mobileMenu");

    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            () => {

                const sidebar =
                    qs(".sidebar");

                if (sidebar) {
                    sidebar.classList.toggle(
                        "mobile-open"
                    );
                }
            }
        );
    }


    /* Dashboard */

    $("startCrisisBtn")
        ?.addEventListener(
            "click",
            startCrisis
        );

    $("runAIBtn")
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "AI يقوم بتحليل المدينة...",
                    "info"
                );

                setTimeout(() => {

                    improveMetrics(4);

                    generateAIEvent();

                    increaseLearning(2);

                    showToast(
                        "اكتمل تحليل AI",
                        "success"
                    );

                }, 1200);
            }
        );


    $("openBrainBtn")
        ?.addEventListener(
            "click",
            openAIBrain
        );


    $("replayEventsBtn")
        ?.addEventListener(
            "click",
            replayEvents
        );


    $("applyCopilotBtn")
        ?.addEventListener(
            "click",
            applyCopilot
        );


    $("ignoreCopilotBtn")
        ?.addEventListener(
            "click",
            ignoreCopilot
        );


    /* City */

    $("dayNightBtn")
        ?.addEventListener(
            "click",
            toggleDayNight
        );

    $("resetCityCamera")
        ?.addEventListener(
            "click",
            resetCityCamera
        );

    $("optimizeCityBtn")
        ?.addEventListener(
            "click",
            optimizeCity
        );

    $("satelliteCityBtn")
        ?.addEventListener(
            "click",
            toggleSatelliteMode
        );


    $("radarBtn")
        ?.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "radar-expanded"
                );

                showToast(
                    "تم تحديث نظام الرادار",
                    "info"
                );
            }
        );


    $("evolveCityBtn")
        ?.addEventListener(
            "click",
            openEvolution
        );


    /* Detective */

    $("startInvestigationBtn")
        ?.addEventListener(
            "click",
            startInvestigation
        );

    $("applyInvestigationBtn")
        ?.addEventListener(
            "click",
            applyInvestigation
        );


    /* Future */

    $("runFutureSimulationBtn")
        ?.addEventListener(
            "click",
            runFutureSimulation
        );


    /* Generic action buttons */

    qsa("[data-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    handleAction(
                        button.dataset.action
                    );
                }
            );
        });


    /* Decision buttons */

    qsa("[data-plan]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    choosePlan(
                        button.dataset.plan
                    );
                }
            );
        });


    /* Accessibility */

    qsa("[data-accessibility]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleAccessibility(
                        button.dataset.accessibility
                    );
                }
            );
        });


    /* Reset */

    $("resetSystem")
        ?.addEventListener(
            "click",
            resetSystem
        );


    /* Command input */

    const commandInput =
        $("commandInput");

    const commandSend =
        $("commandSend");

    if (commandInput) {

        commandInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    processCommand(
                        commandInput.value
                    );

                    commandInput.value = "";
                }
            }
        );
    }

    if (commandSend) {

        commandSend.addEventListener(
            "click",
            () => {

                if (!commandInput) return;

                processCommand(
                    commandInput.value
                );

                commandInput.value = "";
            }
        );
    }


    /* Vision */

    setupVisionUpload();


    /* Future controls */

    initFutureControls();
}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function setupKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.target.tagName ===
                "INPUT" ||
                event.target.tagName ===
                "TEXTAREA"
            ) {
                return;
            }

            switch (event.key.toLowerCase()) {

                case "d":
                    navigate("dashboard");
                    break;

                case "c":
                    navigate("city");
                    break;

                case "f":
                    navigate("future");
                    break;

                case "e":
                    navigate("detective");
                    break;

                case "j":
                    navigate("judge");
                    break;

                case "v":
                    startVoiceCommand();
                    break;

                case "r":
                    startCrisis();
                    break;

                case "escape":
                    closeModal();
                    break;
            }
        }
    );
}


/* =========================================================
   RESIZE
========================================================= */

function setupResize() {

    window.addEventListener(
        "resize",
        () => {

            if (
                cityRenderer &&
                cityCamera
            ) {

                const container =
                    $("city3D");

                if (container) {

                    cityCamera.aspect =
                        container.clientWidth /
                        container.clientHeight;

                    cityCamera.updateProjectionMatrix();

                    cityRenderer.setSize(
                        container.clientWidth,
                        container.clientHeight
                    );
                }
            }


            if (
                earthRenderer &&
                earthCamera
            ) {

                const container =
                    $("earth3D");

                if (container) {

                    earthCamera.aspect =
                        container.clientWidth /
                        container.clientHeight;

                    earthCamera.updateProjectionMatrix();

                    earthRenderer.setSize(
                        container.clientWidth,
                        container.clientHeight
                    );
                }
            }

        }
    );
}


/* =========================================================
   REAL-TIME ENGINE
========================================================= */

function startRealtimeEngine() {

    metricTimer =
        setInterval(
            simulateMetrics,
            5000
        );

    eventTimer =
        setInterval(
            generateAIEvent,
            12000
        );

    heartbeatTimer =
        setInterval(
            updateCityHeartbeat,
            2500
        );
}


/* =========================================================
   FIRST INTERACTION VOICE
========================================================= */

function setupVoiceUnlock() {

    const unlock = () => {

        if (
            !welcomeSpoken &&
            state.voice
        ) {
            speakWelcome();
        }

        document.removeEventListener(
            "pointerdown",
            unlock
        );
    };

    document.addEventListener(
        "pointerdown",
        unlock,
        {
            once: true
        }
    );
}


/* =========================================================
   ADD DEFAULT TIMELINE
========================================================= */

function restoreTimeline() {

    if (
        state.timeline &&
        state.timeline.length
    ) {

        const container =
            $("eventTimeline");

        if (!container) return;

        container.innerHTML = "";

        state.timeline
            .slice(0, 5)
            .forEach(event => {

                addTimelineEvent(
                    event.title,
                    event.description,
                    "success"
                );
            });
    }
}


/* =========================================================
   AI STATUS LOOP
========================================================= */

function startAILearningLoop() {

    setInterval(() => {

        if (
            Math.random() <
            0.35
        ) {

            increaseLearning(
                random(0, 1)
            );
        }

        const message =
            $("brainMessage");

        if (message) {

            const messages = [
                "الذكاء الاصطناعي يحلل إشارات المدينة...",
                "AI يقارن البيانات الحالية بالسجل التاريخي...",
                "جاري اكتشاف الأنماط البيئية...",
                "تم تحديث نموذج المدينة الرقمي...",
                "جاري حساب أفضل قرار بيئي..."
            ];

            message.textContent =
                messages[
                    random(
                        0,
                        messages.length - 1
                    )
                ];
        }

    }, 7000);
}


/* =========================================================
   INITIALIZE
========================================================= */

function init() {

    updateClock();

    setInterval(
        updateClock,
        1000
    );

    setupEvents();

    setupKeyboard();

    setupResize();

    setupSpeechRecognition();

    setupVoiceUnlock();

    initLiveChart();

    startRealtimeEngine();

    startAILearningLoop();

    applyState();

    restoreTimeline();

    console.log(
        "%c ECOGENESIS AI ",
        "background:#53ffb1;color:#050914;font-size:20px;font-weight:bold;padding:8px 14px;border-radius:8px"
    );

    console.log(
        "CITY INTELLIGENCE ENGINE ONLINE"
    );
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            init();
            bootSystem();

        }
    );

} else {

    init();
    bootSystem();
}/* ECOGENESIS AI — COMPETITION EXPERIENCE UPGRADE */
(function(){
"use strict";
const U={id:id=>document.getElementById(id),q:s=>document.querySelector(s),qa:s=>[...document.querySelectorAll(s)]};
const alias={"eco-dna":"dna",dashboard:"dashboard",city:"city",detective:"detective",future:"future",decision:"decision",memory:"memory",dna:"dna",earth:"earth",vision:"vision",command:"command",judge:"judge"};
function toast(m,t="info"){try{if(typeof showToast==="function")showToast(m,t)}catch(e){}}
function say(m){try{if(typeof speak==="function"&&typeof state!=="undefined"&&state.voice)speak(m)}catch(e){}}
function m(k,d){try{return Math.round(Number((typeof state!=="undefined"&&state.metrics?state.metrics[k]:d)??d))}catch(e){return d}}
function eco(){try{return Math.round(Number((typeof state!=="undefined"?state.ecoScore:82)??82))}catch(e){return 82}}
function learn(){try{return Math.round(Number((typeof state!=="undefined"?state.learning:76)??76))}catch(e){return 76}}
function save(){try{if(typeof saveState==="function")saveState()}catch(e){}}
function nav(raw){
 const p=alias[raw]||raw,t=U.id(`page-${p}`); if(!t){toast(`الصفحة غير موجودة: ${raw}`,"error");return}
 U.qa(".page").forEach(x=>x.classList.remove("active"));t.classList.add("active");
 U.qa(".nav-item,.nav-btn").forEach(b=>b.classList.toggle("active",(alias[b.dataset.page]||b.dataset.page)===p));
 const n=U.id("currentPageName");if(n)n.textContent=({dashboard:"مركز القيادة",city:"المدينة الرقمية",detective:"المحقق البيئي",future:"محاكي المستقبل",decision:"غرفة القرار",memory:"ذاكرة المدينة",dna:"Eco DNA",earth:"القمر الصناعي",vision:"الرؤية الذكية",command:"AI Command",judge:"Judge Mode"})[p]||p;
 window.scrollTo({top:0,behavior:"smooth"});
 if(p==="city")setTimeout(()=>{try{if(typeof initCity3D==="function")initCity3D();}catch(e){}window.dispatchEvent(new Event("resize"))},180);
 if(p==="earth")setTimeout(()=>{try{if(typeof initEarth==="function")initEarth()}catch(e){}},180);
 if(p==="memory")try{if(typeof renderMemory==="function")renderMemory()}catch(e){}
 if(p==="dna")try{if(typeof updateEcoDNA==="function")updateEcoDNA()}catch(e){}
 if(p==="judge")try{if(typeof prepareJudgeMode==="function")prepareJudgeMode()}catch(e){}
}
window.ecoNavigate=nav;

function injectButton(){
 const host=U.q(".topbar-actions")||U.q(".topbar");if(!host||U.id("ecoSuperBtn"))return;
 const b=document.createElement("button");b.id="ecoSuperBtn";b.className="eco-upgrade-btn";b.innerHTML='<i class="fa-solid fa-microchip"></i><span>AI SUPER CONSOLE</span>';b.onclick=openConsole;host.appendChild(b);
}

function openConsole(){
 let modal=U.id("ecoSuperModal");if(!modal){modal=document.createElement("div");modal.id="ecoSuperModal";modal.className="eco-super-modal";document.body.appendChild(modal);}
 modal.innerHTML=`<div class="eco-super-card" role="dialog" aria-modal="true">
 <button class="eco-super-close" id="ecoSuperClose"><i class="fa-solid fa-xmark"></i></button>
 <div class="eco-super-head"><div><div class="eco-super-kicker">ECOGENESIS AI / DECISION INTELLIGENCE</div><h2>مركز الذكاء المتقدم</h2><p>من البيانات إلى التفسير، المحاكاة، القرار، التنفيذ والتعلّم.</p></div><div class="eco-super-status"><i class="fa-solid fa-circle"></i> AI CORE ONLINE</div></div>
 <div class="eco-super-tabs">
 <button class="eco-tab active" data-tab="overview">نظرة حية</button><button class="eco-tab" data-tab="explain">لماذا اتخذ AI القرار؟</button><button class="eco-tab" data-tab="stress">Stress Test</button><button class="eco-tab" data-tab="sensors">Sensor Network</button><button class="eco-tab" data-tab="challenge">AI Challenge</button><button class="eco-tab" data-tab="audit">Audit Log</button>
 </div>
 <section class="eco-panel active" id="eco-panel-overview"><div class="eco-grid">
 ${metricCard("Eco Score",eco()+"/100","+4.8%", "fa-leaf")}${metricCard("Water",m("water",91)+"%","LIVE","fa-droplet")}${metricCard("Energy",m("energy",76)+"%","LIVE","fa-bolt")}${metricCard("AI Learning",learn()+"%","MEMORY +1","fa-brain")}</div>
 <div class="eco-section-title"><h3>سلسلة الذكاء</h3><button class="eco-mini-btn" id="ecoRunDemo"><i class="fa-solid fa-play"></i> تشغيل السيناريو</button></div>
 <div class="eco-timeline" id="ecoFlow"><div class="eco-audit"><time>01</time><strong>Sensor Network</strong><span>جمع إشارات المدينة</span></div><div class="eco-audit"><time>02</time><strong>AI Detective</strong><span>اكتشاف الشذوذ</span></div><div class="eco-audit"><time>03</time><strong>Explainable AI</strong><span>تفسير السبب والثقة</span></div><div class="eco-audit"><time>04</time><strong>Decision Room</strong><span>مقارنة الحلول</span></div><div class="eco-audit"><time>05</time><strong>City Memory</strong><span>حفظ ما تعلّمه النظام</span></div></div>
 <div class="eco-live-strip"><span class="eco-live-chip">CITY PULSE <b id="ecoPulseValue">87</b> BPM</span><span class="eco-live-chip">SENSORS <b>1,284</b></span><span class="eco-live-chip">CONFIDENCE <b>94%</b></span><span class="eco-live-chip">ANOMALIES <b>01</b></span></div></section>
 <section class="eco-panel" id="eco-panel-explain"><div class="eco-reason"><div class="eco-reason-box"><div class="eco-section-title"><h3>Explainable AI</h3><span class="eco-live-chip">CONFIDENCE <b>94%</b></span></div>${factor("ارتفاع استهلاك المياه","31%",88)}${factor("ارتفاع الحرارة","4.2°C",76)}${factor("هطول الأمطار","0 mm",91)}${factor("إشارات المستشعرات الشاذة","14 Sensors",83)}<p style="color:#8ea4b1;margin-top:14px">الاستنتاج المحاكى: احتمال وجود ضغط غير طبيعي على شبكة المياه في المنطقة الشمالية.</p></div><div class="eco-reason-box"><h3>AI Recommendation</h3><p style="color:#8ea4b1">تقليل ضغط الشبكة، إرسال فريق فحص، ثم قياس التأثير قبل تنفيذ إجراء أوسع.</p><div class="eco-approve-row"><button class="eco-approve primary" data-eco-approve="approve">APPROVE</button><button class="eco-approve alt" data-eco-approve="modify">MODIFY</button><button class="eco-approve alt" data-eco-approve="reject">REJECT</button></div></div></div><div class="eco-section-title"><h3>مقارنة الحلول</h3></div><div class="eco-solutions">${solution("إصلاح الشبكة","تأثير مرتفع","تكلفة متوسطة","مخاطر منخفضة")}${solution("خفض الضغط","تأثير متوسط","تكلفة منخفضة","مخاطر منخفضة")}${solution("عزل المنطقة","تأثير مرتفع","تكلفة مرتفعة","مخاطر متوسطة")}</div></section>
 <section class="eco-panel" id="eco-panel-stress"><div class="eco-section-title"><h3>Climate Stress Test</h3><span class="eco-live-chip">SIMULATION / NOT FORECAST</span></div><div class="eco-stress-controls">${slider("heat","موجة حر",35)}${slider("water","ضغط المياه",30)}${slider("waste","النفايات",20)}${slider("energy","الطاقة",25)}</div><div class="eco-stress-result"><div>RESILIENCE SCORE</div><div class="eco-stress-score" id="ecoStressScore">82</div><p id="ecoStressText">غيّر المتغيرات لاختبار قدرة المدينة على الاستجابة.</p><div class="eco-stress-actions"><button class="eco-mini-btn" id="ecoRunStress">تشغيل الاختبار</button><button class="eco-mini-btn" id="ecoApplyStress">تطبيق تدخل AI</button></div></div></section>
 <section class="eco-panel" id="eco-panel-sensors"><div class="eco-section-title"><h3>شبكة المستشعرات</h3><span class="eco-live-chip">1,284 ONLINE</span></div><div class="eco-sensors">${sensor("N-14","WATER","DANGER",31)}${sensor("A-27","AIR","STABLE",87)}${sensor("E-08","ENERGY","WARNING",76)}${sensor("R-31","WASTE","STABLE",68)}${sensor("T-19","TEMP","WARNING",82)}${sensor("G-04","GREEN","STABLE",84)}${sensor("W-22","WATER","STABLE",91)}${sensor("C-11","TRAFFIC","WARNING",73)}</div></section>
 <section class="eco-panel" id="eco-panel-challenge"><div class="eco-challenge"><div class="eco-reason-box"><span class="eco-super-kicker">LIVE CHALLENGE</span><h3>اكتشف المشكلة</h3><p style="color:#9db1bc">ارتفع استهلاك المياه في المنطقة الشمالية 31%. أي خطوة تريد أن تبدأ بها؟</p><button class="eco-choice" data-choice="inspect">🔎 فحص المستشعرات</button><button class="eco-choice" data-choice="pressure">💧 خفض الضغط مؤقتًا</button><button class="eco-choice" data-choice="isolate">🛑 عزل المنطقة</button></div><div class="eco-reason-box"><h3 id="ecoChallengeTitle">AI Evaluation</h3><p id="ecoChallengeText" style="color:#8ea4b1">اختر قرارًا لترى كيف يحلل النظام تأثيره وتكلفته ومخاطره.</p><div class="eco-grid" style="grid-template-columns:repeat(2,1fr)">${metricCard("Impact","—","","fa-chart-line")}${metricCard("Risk","—","","fa-shield-halved")}</div></div></div></section>
 <section class="eco-panel" id="eco-panel-audit"><div class="eco-section-title"><h3>AI Audit Trail</h3><button class="eco-mini-btn" id="ecoClearAudit">مسح السجل</button></div><div class="eco-timeline" id="ecoAuditList"></div></section>
 </div>`;
 bindConsole(modal);requestAnimationFrame(()=>modal.classList.add("active"));refreshAudit();
}
function metricCard(t,v,s,i){return `<div class="eco-metric"><span><i class="fa-solid ${i}"></i> ${t}</span><strong>${v}</strong><small>${s}</small></div>`}
function factor(t,v,p){return `<div class="eco-factor"><div><strong>${t}</strong><div class="eco-bar"><i style="width:${p}%"></i></div></div><b>${v}</b></div>`}
function solution(t,a,c,r){return `<div class="eco-solution"><h4>${t}</h4><p>حل محاكى ضمن Decision Intelligence.</p><div class="eco-solution-meta"><span>${a}</span><span>${c}</span><span>${r}</span></div></div>`}
function slider(id,l,v){return `<div class="eco-slider"><label><span>${l}</span><b id="${id}Val">${v}%</b></label><input id="${id}Slider" type="range" min="0" max="100" value="${v}"></div>`}
function sensor(id,type,status,val){const cls=status==="DANGER"?"danger":status==="WARNING"?"warning":"";return `<div class="eco-sensor ${cls}"><strong><span>${id}</span><b>${status}</b></strong><small>${type}</small><div class="eco-bar"><i style="width:${val}%"></i></div><span>${val}%</span></div>`}
function bindConsole(modal){
 U.id("ecoSuperClose").onclick=()=>modal.classList.remove("active");
 modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("active")});
 U.qa(".eco-tab",modal).forEach(b=>b.onclick=()=>{U.qa(".eco-tab",modal).forEach(x=>x.classList.remove("active"));U.qa(".eco-panel",modal).forEach(x=>x.classList.remove("active"));b.classList.add("active");U.id(`eco-panel-${b.dataset.tab}`).classList.add("active")});
 U.id("ecoRunDemo").onclick=runDemo;
 ["heat","water","waste","energy"].forEach(k=>{const s=U.id(`${k}Slider`);if(s)s.oninput=()=>U.id(`${k}Val`).textContent=s.value+"%"});
 U.id("ecoRunStress").onclick=runStress;U.id("ecoApplyStress").onclick=applyStress;
 U.qa("[data-eco-approve]",modal).forEach(b=>b.onclick=()=>approveDecision(b.dataset.ecoApprove));
 U.qa("[data-choice]",modal).forEach(b=>b.onclick=()=>challenge(b.dataset.choice));
 U.id("ecoClearAudit").onclick=()=>{localStorage.removeItem("ecogenesis-audit");refreshAudit()};
}
function audit(action,detail){
 const key="ecogenesis-audit";let list=[];try{list=JSON.parse(localStorage.getItem(key)||"[]")}catch(e){}
 list.unshift({time:new Date().toLocaleTimeString("ar-JO"),action,detail});list=list.slice(0,30);localStorage.setItem(key,JSON.stringify(list));refreshAudit();
}
function refreshAudit(){const box=U.id("ecoAuditList");if(!box)return;let list=[];try{list=JSON.parse(localStorage.getItem("ecogenesis-audit")||"[]")}catch(e){}if(!list.length){box.innerHTML='<div class="eco-audit"><time>--:--:--</time><strong>System ready</strong><span>بانتظار أول قرار</span></div>';return}box.innerHTML=list.map(x=>`<div class="eco-audit"><time>${x.time}</time><strong>${x.action}</strong><span>${x.detail}</span></div>`).join("")}
function approveDecision(kind){const map={approve:["تمت الموافقة على توصية AI","بدأ تنفيذ التدخل المحاكى","success"],modify:["تم تعديل توصية AI","Human-in-the-loop: القرار يحتاج تخصيصًا","info"],reject:["تم رفض التوصية","سيواصل النظام المراقبة دون تنفيذ","warning"]};const x=map[kind]||map.approve;audit(x[0],x[1]);toast(x[0],x[2]);say(x[0])}
function runStress(){const vals=["heat","water","waste","energy"].map(k=>Number(U.id(`${k}Slider`)?.value||0));let penalty=Math.round(vals.reduce((a,b)=>a+b,0)*.18);let s=Math.max(25,Math.min(100,eco()-penalty));U.id("ecoStressScore").textContent=s;U.id("ecoStressText").textContent=`الضغط البيئي المحاكى خفّض مرونة المدينة من ${eco()} إلى ${s}. هذه محاكاة تفاعلية وليست توقعًا حقيقيًا.`;audit("Stress Test",`Resilience ${eco()} → ${s}`);toast("اكتمل اختبار الضغط البيئي","info")}
function applyStress(){const old=Number(U.id("ecoStressScore")?.textContent||eco());const next=Math.min(100,old+Math.max(4,Math.round((100-old)*.35)));U.id("ecoStressScore").textContent=next;U.id("ecoStressText").textContent=`طبّق AI تدخلًا محاكى: تحسنت المرونة إلى ${next}.`;audit("AI Intervention",`Stress resilience ${old} → ${next}`);toast("تم تطبيق تدخل AI المحاكى","success");say("تم تطبيق تدخل الذكاء الاصطناعي وتحسنت مرونة المدينة")}
function challenge(choice){const data={inspect:["فحص المستشعرات","Impact: مرتفع | Risk: منخفض","تحليل إضافي قبل قرار أكبر"],pressure:["خفض الضغط مؤقتًا","Impact: متوسط | Risk: منخفض","حل سريع مع مراقبة مستمرة"],isolate:["عزل المنطقة","Impact: مرتفع | Risk: متوسط","أقوى تدخل لكنه أعلى كلفة"]}[choice];U.id("ecoChallengeTitle").textContent=data[0];U.id("ecoChallengeText").textContent=`${data[1]} — ${data[2]}`;audit("AI Challenge",data[0]);toast("تم تحليل القرار","success")}
function runDemo(){const steps=[["SENSOR SCAN","جاري فحص 1,284 مستشعرًا..."],["ANOMALY DETECTED","ارتفاع استهلاك المياه +31% في المنطقة الشمالية"],["AI REASONING","ربط المياه + الحرارة + المطر + سجل المدينة"],["DECISION","توليد ومقارنة 3 حلول"],["ACTION","تطبيق تدخل محاكى"],["LEARNING","حفظ التجربة في City Memory"]];let i=0;const tick=()=>{if(i>=steps.length){toast("اكتمل سيناريو المدينة الذكية","success");say("اكتمل السيناريو. تم حفظ تجربة جديدة في ذاكرة المدينة");return}const [a,d]=steps[i++];audit(a,d);toast(d,i===2?"warning":"info");setTimeout(tick,850)};tick()}
function emergency(){let el=U.id("ecoEmergency");if(!el){el=document.createElement("div");el.id="ecoEmergency";el.className="eco-emergency";document.body.appendChild(el)}el.innerHTML=`<div class="eco-emergency-card"><div class="eco-emergency-icon"><i class="fa-solid fa-triangle-exclamation"></i></div><div class="eco-super-kicker">AI EMERGENCY DEMO</div><h2 id="ecoEmergencyTitle">ANOMALY DETECTED</h2><p id="ecoEmergencyText">النظام يلتقط تغيرًا غير طبيعي في شبكة المياه.</p><div class="eco-emergency-progress"><i id="ecoEmergencyBar"></i></div><strong id="ecoEmergencyStep">01 / 06</strong><br><br><button class="eco-emergency-close" id="ecoEmergencyClose">إنهاء العرض</button></div>`;el.classList.add("active");document.body.classList.add("eco-emergency-active");const steps=["فحص المستشعرات","تأكيد الشذوذ","تحليل السبب","مقارنة الحلول","تنفيذ التدخل","حفظ الدرس في الذاكرة"];let i=0;const text=["تم الاتصال بـ 1,284 مستشعرًا.","Confidence 94% — N-14 يحتاج إلى فحص.","البيانات تشير إلى ضغط غير طبيعي على شبكة المياه.","AI يقارن 3 خيارات قبل التنفيذ.","تم تطبيق التدخل المحاكى وبدأ قياس الأثر.","تم إنشاء Memory جديدة للمدينة."];const next=()=>{if(!U.id("ecoEmergency")?.classList.contains("active"))return;if(i<steps.length){U.id("ecoEmergencyTitle").textContent=steps[i];U.id("ecoEmergencyText").textContent=text[i];U.id("ecoEmergencyBar").style.width=((i+1)/steps.length*100)+"%";U.id("ecoEmergencyStep").textContent=String(i+1).padStart(2,"0")+" / 06";audit("Emergency Demo",steps[i]);i++;setTimeout(next,1050)}else{toast("انتهى العرض: Detect → Think → Decide → Act → Learn","success");say("انتهى العرض. المدينة اكتشفت المشكلة وحللتها واتخذت قرارًا وتعلمت منها")}};next();U.id("ecoEmergencyClose").onclick=()=>{el.classList.remove("active");document.body.classList.remove("eco-emergency-active")}}
function bindGlobal(){U.qa(".nav-item,.nav-btn").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();nav(b.dataset.page)},{capture:true}));if(!U.id("ecoEmergencyTrigger")){const host=U.q(".topbar-actions")||U.q(".topbar");if(host){const b=document.createElement("button");b.id="ecoEmergencyTrigger";b.className="eco-upgrade-btn";b.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i><span>EMERGENCY DEMO</span>';b.onclick=emergency;host.appendChild(b)}}injectButton()}
function liveLoop(){const pulse=U.id("pulseRate")||U.id("ecoPulseValue");if(pulse)pulse.textContent=String(82+Math.floor(Math.random()*12));const count=U.id("sensorCount");if(count)count.textContent=(1284+Math.floor(Math.random()*9)).toLocaleString("en-US")}
function bootUpgrade(){bindGlobal();setInterval(liveLoop,2500);liveLoop();audit("System Upgrade","Competition Experience Layer online");console.log("%c ECOGENESIS UPGRADE ONLINE ","background:#53ffb1;color:#03100a;font-weight:900;padding:7px 12px;border-radius:8px")}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(bootUpgrade,900));else setTimeout(bootUpgrade,900);
window.addEventListener("keydown",e=>{if(e.key==="Escape"){const modal=U.id("ecoSuperModal");if(modal)modal.classList.remove("active");const em=U.id("ecoEmergency");if(em){em.classList.remove("active");document.body.classList.remove("eco-emergency-active")}}});
})();


/* =========================================================
   ECOGENESIS 5.0 — JORDAN ECO INTELLIGENCE LAYER
   Real map + browser AI vision + fusion + prediction + decisions
========================================================= */
(function(){
"use strict";
const E={
  id:id=>document.getElementById(id),
  q:s=>document.querySelector(s),
  qa:s=>[...document.querySelectorAll(s)],
  toast:(m,t="info")=>{try{if(typeof showToast==="function")showToast(m,t)}catch(e){}},
  speak:m=>{try{if(typeof speak==="function")speak(m)}catch(e){}}
};

const JORDAN_ZONES=[
 {id:"amman",name:"عمّان",lat:31.9539,lng:35.9106,risk:68,type:"Urban / Traffic",reason:"كثافة حضرية وحركة مرور عالية تجعل المنطقة مناسبة للمراقبة المستمرة.",factors:{air:71,traffic:78,industry:46,green:54,history:66},color:"medium"},
 {id:"zarqa",name:"الزرقاء",lat:32.0728,lng:36.0879,risk:79,type:"Industrial Monitoring",reason:"منطقة ذات أولوية للمراقبة البيئية ضمن نطاقات النشاط الصناعي والحضري والرصد الرسمي.",factors:{air:78,traffic:67,industry:91,green:38,history:76},color:"high"},
 {id:"hashemiyah",name:"الهاشمية • الزرقاء",lat:32.145,lng:36.118,risk:82,type:"Industrial Hotspot",reason:"منطقة مرتبطة بالمراقبة الصناعية؛ تُعرض هنا كأولوية تحليل وليست حكمًا على جودة الهواء اللحظية.",factors:{air:82,traffic:61,industry:94,green:31,history:81},color:"critical"},
 {id:"irbid",name:"إربد",lat:32.5556,lng:35.8500,risk:48,type:"Urban / Agricultural",reason:"مزيج من النشاط الحضري والزراعي يستدعي مراقبة متعددة المؤشرات.",factors:{air:49,traffic:55,industry:35,green:67,history:43},color:"medium"},
 {id:"aqaba",name:"العقبة",lat:29.5321,lng:35.0063,risk:62,type:"Coastal / Industrial",reason:"منطقة ساحلية وصناعية ذات أهمية بيئية، مناسبة للمراقبة متعددة الطبقات.",factors:{air:60,traffic:58,industry:73,green:44,history:61},color:"medium"},
 {id:"tafila",name:"الطفيلة",lat:30.8375,lng:35.6044,risk:43,type:"Monitoring Zone",reason:"نقطة مراقبة جنوبية ضمن منظومة الرصد البيئي الأردنية.",factors:{air:41,traffic:32,industry:49,green:63,history:38},color:"low"},
 {id:"hasa",name:"الحسا",lat:30.7400,lng:35.9400,risk:58,type:"Industrial / Mining",reason:"منطقة جنوبية مرتبطة بأنشطة صناعية ومراقبة بيئية.",factors:{air:57,traffic:41,industry:68,green:36,history:55},color:"medium"},
 {id:"rashadiya",name:"الرشادية",lat:30.7500,lng:35.6100,risk:51,type:"Monitoring Zone",reason:"منطقة جنوبية تظهر ضمن نطاقات الرصد البيئي المرجعية للمشروع.",factors:{air:53,traffic:28,industry:61,green:47,history:49},color:"medium"}
];
let jordanMap=null, jordanMarkers={}, jordanActive=JORDAN_ZONES[1], visionModel=null, visionImageFile=null, visionScore=0, visionObjectUrl=null;

function zoneById(id){return JORDAN_ZONES.find(z=>z.id===id)||JORDAN_ZONES[1]}
function setText(id,v){const x=E.id(id);if(x)x.textContent=v}
function clamp(n,a=0,b=100){return Math.max(a,Math.min(b,n))}
function safeNumber(v,d=0){const n=Number(v);return Number.isFinite(n)?n:d}

/* ---------- navigation ---------- */
function ecoNavigate(page){
  const p=page;
  const target=E.id("page-"+p); if(!target)return false;
  E.qa(".page").forEach(x=>x.classList.remove("active")); target.classList.add("active");
  E.qa(".nav-item,.nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===page || (page==="eco-dna"&&b.dataset.page==="eco-dna")));
  const labels={dashboard:["مركز قيادة المدينة","Environmental Intelligence Dashboard"],city:["التوأم الرقمي","Digital Twin Engine"],detective:["المحقق البيئي","AI Environmental Detective"],future:["محاكي المستقبل","Predictive Simulation"],decision:["غرفة القرار","AI Decision Room"],memory:["ذاكرة المدينة","City Learning Memory"],"eco-dna":["Eco DNA","Environmental Identity"],earth:["القمر الصناعي","Satellite Intelligence"],jordan:["خريطة الأردن البيئية","Jordan Eco Intelligence Map"],vision:["عين المدينة","Computer Vision AI"],command:["AI Command Center","Natural Language Interface"],judge:["وضع التحكيم","International Competition Demo"]};
  const l=labels[page]||labels[p]||labels.dashboard; setText("currentPageLabel",l[0]); setText("currentPageSub",l[1]);
  if(p==="jordan")setTimeout(()=>{initJordanMap();if(jordanMap)jordanMap.invalidateSize()},100);
  return true;
}
function bindNavigation(){
 E.qa(".nav-item,.nav-btn").forEach(btn=>{
   btn.addEventListener("click",function(ev){
     const page=this.dataset.page;if(!page)return;
     if(page==="jordan"||page==="vision"||page==="earth"||page==="eco-dna"){
       ev.preventDefault();ev.stopImmediatePropagation();ecoNavigate(page);
     }
   },true);
 });
}

/* ---------- Jordan map ---------- */
function riskClass(r){return r>=80?"critical":r>=65?"high":r>=50?"medium":"low"}
function initJordanMap(){
 if(jordanMap||!window.L||!E.id("jordanMap"))return;
 jordanMap=L.map("jordanMap",{zoomControl:true,scrollWheelZoom:true}).setView([31.20,36.30],7);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(jordanMap);
 JORDAN_ZONES.forEach(z=>{
   const cls=riskClass(z.risk);
   const marker=L.circleMarker([z.lat,z.lng],{radius:z.risk>=80?13:10,weight:3,fillOpacity:.72,className:"eco-map-marker "+cls});
   marker.addTo(jordanMap);
   marker.bindTooltip(`<strong>${z.name}</strong><br>Risk Priority ${z.risk}/100`,{direction:"top",offset:[0,-8]});
   marker.on("click",()=>selectJordanZone(z.id));
   jordanMarkers[z.id]=marker;
 });
 selectJordanZone("zarqa");
 setTimeout(()=>jordanMap.invalidateSize(),250);
}
function selectJordanZone(id){
 jordanActive=zoneById(id);const z=jordanActive;
 setText("jordanSelectedName",z.name);setText("jordanSelectedRisk",z.risk);setText("fusionRiskValue",z.risk+"/100");setText("jordanFusionScore",z.risk+"%");
 setText("jordanSelectedReason",z.reason);setText("jordanConfidence",z.id==="zarqa"?"91%":"88%");
 const pill=E.id("jordanRiskPill");if(pill){pill.className="jordan-risk-pill "+riskClass(z.risk);pill.textContent=z.risk>=80?"CRITICAL HOTSPOT":z.risk>=65?"HIGH PRIORITY":z.risk>=50?"MONITOR":"LOW RISK"}
 renderFactors(z); renderPrediction(z); renderDecision(z);
 Object.entries(jordanMarkers).forEach(([k,m])=>m.setRadius(k===id?15:(zoneById(k).risk>=80?12:9)));
 if(jordanMap)jordanMap.flyTo([z.lat,z.lng],8,{duration:.7});
}
function renderFactors(z){
 const labels={air:"Air indicators",traffic:"Traffic pressure",industry:"Industrial activity",green:"Green cover",history:"Historical pattern"};
 const box=E.id("fusionFactors"); if(box)box.innerHTML=Object.entries(z.factors).map(([k,v])=>`<div class="fusion-row"><span>${labels[k]}</span><div><i style="width:${v}%"></i></div><strong>${v}%</strong></div>`).join("");
 const mini=E.id("jordanMiniFactors"); if(mini)mini.innerHTML=`<span><b>Air</b>${z.factors.air}%</span><span><b>Traffic</b>${z.factors.traffic}%</span><span><b>Industry</b>${z.factors.industry}%</span>`;
}
function renderPrediction(z){
 const p6=clamp(Math.round(z.risk+(100-z.risk)*.10)); const p24=clamp(Math.round(z.risk+(100-z.risk)*.25));
 setText("predNow",z.risk);setText("pred6",p6);setText("pred24",p24);
 setText("jordanPredictionText",`النموذج يرى مسارًا تصاعديًا محتملًا من ${z.risk} إلى ${p24} خلال 24 ساعة إذا استمرت العوامل الحالية. هذه محاكاة وليست توقعًا تشغيليًا.`);
}
function renderDecision(z){
 const rec=z.factors.industry>75?"source":z.factors.traffic>72?"traffic":"inspect";
 E.qa(".jordan-decision").forEach(b=>b.classList.toggle("recommended",b.dataset.jordanDecision===rec));
 const msg={source:"يوصي AI بمعالجة المصدر لأن النشاط الصناعي يمثل أعلى مساهم في Risk Fusion لهذه المنطقة.",traffic:"يوصي AI بإدارة الحركة لأن ضغط المرور يمثل مساهمًا رئيسيًا في الخطر الحالي.",inspect:"يوصي AI بزيادة التفتيش أولًا لأن عدم اليقين يحتاج إلى أدلة ميدانية إضافية قبل تدخل أكبر."};
 setText("jordanDecisionExplain",msg[rec]);
}
function scanJordan(){
 if(!jordanMap)return initJordanMap();
 E.toast("AI يمسح الأردن ويقارن طبقات الخطر...","info");
 const all=JORDAN_ZONES.map(z=>z.id);let i=0;
 const next=()=>{if(i>=all.length){setText("jordanHotspotCount",JORDAN_ZONES.filter(z=>z.risk>=70).length);E.toast("اكتمل المسح: تم تحديد أولويات المراقبة","success");E.speak("اكتمل مسح الأردن. تم تحديد المناطق ذات الأولوية للمراقبة");return}const z=zoneById(all[i++]);if(jordanMap)jordanMap.flyTo([z.lat,z.lng],8,{duration:.35});selectJordanZone(z.id);setTimeout(next,430)};next();
}

/* ---------- browser AI vision ---------- */
async function loadVisionModel(){
 const badge=E.id("visionModelBadge"),dot=E.id("visionEngineDot"),txt=E.id("visionEngineText");
 try{if(window.cocoSsd){visionModel=await cocoSsd.load();if(badge)badge.textContent="AI MODEL • COCO-SSD ONLINE";if(dot)dot.className="online";if(txt)txt.textContent="نموذج رؤية يعمل داخل المتصفح";return true}}catch(err){console.warn(err)}
 if(badge)badge.textContent="VISION • FALLBACK MODE";if(txt)txt.textContent="وضع تحليل بصري مساعد";return false;
}
function setupVisionV5(){
 const input=E.id("visionFile"),drop=E.id("visionDropzone"),browse=E.id("visionBrowseBtn"),run=E.id("runVisionBtn"),remove=E.id("removeVisionImage");
 if(!input||!drop||drop.dataset.v5)return;drop.dataset.v5="1";
 const choose=()=>input.click();browse?.addEventListener("click",e=>{e.stopPropagation();choose()});drop.addEventListener("click",e=>{if(e.target.closest("button"))return;choose()});
 input.addEventListener("change",()=>{if(input.files?.[0])setVisionFile(input.files[0])});
 ["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("dragging")}));
 ["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("dragging")}));
 drop.addEventListener("drop",e=>{if(e.dataTransfer.files?.[0])setVisionFile(e.dataTransfer.files[0])});
 remove?.addEventListener("click",clearVision);
 run?.addEventListener("click",runVisionAI);
 E.id("sendVisionToMap")?.addEventListener("click",()=>{const z=E.id("visionJordanZone")?.value||"zarqa";ecoNavigate("jordan");setTimeout(()=>{selectJordanZone(z);if(visionScore){const boost=Math.round(visionScore*.22);setText("jordanFusionScore",clamp(jordanActive.risk+boost)+"%");setText("fusionRiskValue",clamp(jordanActive.risk+boost)+"/100");E.toast("تم دمج الدليل البصري مع Risk Fusion","success")}},120)});
 loadVisionModel();
}
function setVisionFile(file){
 if(!file || !file.type || !file.type.startsWith("image/")){E.toast("اختاري ملف صورة صالحًا","warning");return}
 if(visionObjectUrl)URL.revokeObjectURL(visionObjectUrl);
 visionImageFile=file;visionObjectUrl=URL.createObjectURL(file);
 const img=E.id("visionImage");if(img)img.src=visionObjectUrl;
 E.id("visionDropzone")?.classList.add("hidden");E.id("visionPreview")?.classList.remove("hidden");
 setText("visionStatus","READY");setText("visionEngineText","الصورة جاهزة للتحليل")
}
function clearVision(){
 visionImageFile=null;visionScore=0;if(visionObjectUrl){URL.revokeObjectURL(visionObjectUrl);visionObjectUrl=null}
 const input=E.id("visionFile");if(input)input.value="";
 E.id("visionPreview")?.classList.add("hidden");E.id("visionDropzone")?.classList.remove("hidden");E.id("visionImage")?.removeAttribute("src");
 setText("visionStatus","WAITING");setText("visionRiskScore","--");setText("visionRiskText","أضف صورة لبدء التحليل.");
 ["visionTraffic","visionGreen","visionWaste","visionPollution"].forEach(id=>setText(id,"--"));
 const bar=E.id("visionRiskBar");if(bar)bar.style.width="0%";
 const det=E.id("visionDetections");if(det)det.innerHTML="";const rec=E.id("visionRecommendations");if(rec)rec.innerHTML="";
}
function loadImage(file){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=rej;img.src=URL.createObjectURL(file)})}
function pixelFeatures(img){
 const c=document.createElement("canvas"),ctx=c.getContext("2d",{willReadFrequently:true});c.width=180;c.height=120;ctx.drawImage(img,0,0,c.width,c.height);const d=ctx.getImageData(0,0,c.width,c.height).data;let green=0,dark=0,bright=0,total=d.length/4;
 for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(g>r*1.12&&g>b*1.08&&g>65)green++;if(mx<72)dark++;if(mx>190&&mx-mn<32)bright++}
 return {green:Math.round(green/total*100),dark:Math.round(dark/total*100),bright:Math.round(bright/total*100)};
}
async function runVisionAI(){
 if(!visionImageFile){E.toast("اختاري صورة أولًا","warning");return}
 setText("visionStatus","ANALYZING");setText("visionEngineText","AI يحلل الصورة ويجمع الأدلة...");
 const img=await loadImage(visionImageFile), pix=pixelFeatures(img);let detections=[];
 try{if(visionModel)detections=await visionModel.detect(img)}catch(e){console.warn(e)}
 const traffic=detections.filter(x=>["car","truck","bus","motorcycle","bicycle"].includes(x.class)&&x.score>.42).length;
 const waste=detections.filter(x=>["bottle","cup","backpack","handbag","suitcase","bowl"].includes(x.class)&&x.score>.38).length;
 const trafficScore=clamp(traffic*18+pix.bright*.12);const greenScore=clamp(pix.green*1.15);const wasteScore=clamp(waste*22+pix.dark*.18);const pollutionScore=clamp(pix.dark*.72+(100-pix.green)*.08);
 visionScore=clamp(Math.round(trafficScore*.28+(100-greenScore)*.18+wasteScore*.25+pollutionScore*.29));
 setText("visionTraffic",traffic?traffic+" objects":Math.round(trafficScore)+"% signal");setText("visionGreen",greenScore+"%");setText("visionWaste",wasteScore+"%");setText("visionPollution",pollutionScore+"%");setText("visionRiskScore",visionScore);setText("visionStatus","COMPLETE");
 const bar=E.id("visionRiskBar");if(bar)bar.style.width=visionScore+"%";
 setText("visionRiskText",(visionScore>=70?"مؤشرات مرئية تستحق أولوية الفحص الميداني.":visionScore>=45?"توجد مؤشرات تستحق المراقبة والتحقق.":"المؤشرات المرئية المستخرجة منخفضة نسبيًا.")+" هذا تقدير بصري أولي من الأجسام وخصائص الصورة، وليس قياسًا مباشرًا للتلوث أو حكمًا نهائيًا على سلامة الموقع؛ قارنيه ببيانات المستشعرات ومراجعة بشرية.");
 const det=E.id("visionDetections");if(det)det.innerHTML=`<span>OBJECT DETECTIONS</span><div>${detections.length?detections.slice(0,8).map(x=>`<b>${x.class} ${Math.round(x.score*100)}%</b>`).join(""):"لا توجد أجسام مؤكدة من نموذج COCO-SSD"}</div>`;
 const rec=[];if(trafficScore>55)rec.push("مراجعة حركة المركبات أو توقيت الازدحام");if(wasteScore>45)rec.push("إرسال فريق تفتيش للنفايات/العناصر المتناثرة");if(pollutionScore>55)rec.push("مقارنة الصورة مع محطة جودة الهواء الأقرب");if(greenScore<35)rec.push("تقييم الغطاء النباتي وإمكانية إضافة مساحة خضراء");if(!rec.length)rec.push("لا توجد إشارة بصرية قوية؛ استمر بالمراقبة");const ul=E.id("visionRecommendations");if(ul)ul.innerHTML=rec.map(x=>`<li><i class="fa-solid fa-arrow-left"></i>${x}</li>`).join("");
 E.toast("اكتمل التحليل البصري واحتساب Environmental Risk","success");E.speak(`اكتمل تحليل الصورة. مؤشر الخطر البيئي ${visionScore} من 100`);
}

/* ---------- command center extension ---------- */
function patchCommandCenter(){
 const input=E.id("commandInput"),send=E.id("commandSend");if(!input||input.dataset.v5)return;input.dataset.v5="1";
 const original=window.processCommand;
 const handler=()=>{const raw=input.value.trim();if(!raw)return;const t=raw.toLowerCase();if(t.includes("الأردن")||t.includes("خريطة")||t.includes("jordan")){ecoNavigate("jordan");E.toast("فتحت خريطة الأردن البيئية","success");input.value="";return}if(t.includes("صورة")||t.includes("vision")||t.includes("vision")){ecoNavigate("vision");E.toast("فتحت ECO-VISION AI","success");input.value="";return}if(typeof original==="function")original(raw);input.value=""};input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();handler()}});send?.addEventListener("click",handler)
}

function bootV5(){
 bindNavigation();setupVisionV5();patchCommandCenter();
 const jordan=E.id("page-jordan");if(jordan&&window.L)initJordanMap();
 E.id("investigateJordanBtn")?.addEventListener("click",()=>{if(typeof startInvestigation==="function")startInvestigation();else ecoNavigate("detective");E.toast("تم تحويل المنطقة إلى AI Detective","info")});
 E.id("scanJordanBtn")?.addEventListener("click",scanJordan);
 E.id("openJordanMapBtn")?.addEventListener("click",()=>ecoNavigate("jordan"));
 E.qa(".jordan-decision").forEach(b=>b.addEventListener("click",()=>renderDecision(jordanActive)));
 E.toast("ECOGENESIS 5.0 — Jordan Intelligence Layer Online","success");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(bootV5,1400));else setTimeout(bootV5,1400);
window.ECOGENESIS_JORDAN={zones:JORDAN_ZONES,select:selectJordanZone,navigate:ecoNavigate,scan:scanJordan,analyzeVision:runVisionAI};
})();

/* =========================================================
   ECOGENESIS FUNCTIONALITY PATCH 2026-10-07
   Fixes navigation, AI analysis and report export.
========================================================= */
(function functionalPatch(){
    "use strict";

    const byId = id => document.getElementById(id);
    const all = selector => [...document.querySelectorAll(selector)];

    function notify(message, type="info"){
        try { if (typeof showToast === "function") showToast(message, type); } catch(e) {}
    }

    function go(page){
        const aliases = {"dna":"eco-dna"};
        const target = aliases[page] || page;
        const section = byId("page-" + target);
        if(!section){ notify("الصفحة غير موجودة: " + page, "error"); return; }

        all(".page").forEach(p => p.classList.remove("active"));
        section.classList.add("active");
        all(".nav-item, .nav-btn").forEach(btn => {
            const bp = aliases[btn.dataset.page] || btn.dataset.page;
            btn.classList.toggle("active", bp === target);
        });

        const titles = {
            dashboard:"مركز قيادة المدينة",
            city:"التوأم الرقمي للمدينة",
            detective:"المحقق البيئي",
            future:"محاكي المستقبل",
            decision:"غرفة القرار",
            memory:"ذاكرة المدينة",
            dna:"Eco DNA",
            earth:"القمر الصناعي",
            jordan:"خريطة الأردن البيئية",
            vision:"الرؤية الحاسوبية",
            command:"AI Command Center",
            judge:"وضع التحكيم"
        };
        const label = byId("currentPageLabel") || byId("currentPageName");
        if(label) label.textContent = titles[target] || target;

        try { window.scrollTo({top:0, behavior:"smooth"}); } catch(e) { window.scrollTo(0,0); }
        if(target === "city") setTimeout(() => { try { if(typeof initCity3D === "function") initCity3D(); } catch(e){} }, 100);
        if(target === "earth") setTimeout(() => { try { if(typeof initEarth === "function") initEarth(); } catch(e){} }, 100);
        if(target === "jordan") setTimeout(() => { try { if(typeof initJordanMap === "function") initJordanMap(); } catch(e){} }, 100);
    }

    window.ecoNavigate = go;

    function runRealDemoAnalysis(){
        const metrics = (typeof state !== "undefined" && state.metrics) ? state.metrics : null;
        if(!metrics){ notify("لم يتم تحميل بيانات المدينة بعد", "error"); return; }

        notify("AI يجمع البيانات ويحلل مؤشرات المدينة...", "info");

        const oldText = byId("aiCoreState");
        if(oldText) oldText.textContent = "ANALYZING";

        const actionButtons = [
            byId("startAIAnalysisBtn"),
            byId("runAIBtn"),
            byId("eventActionBtn")
        ].filter(Boolean);
        actionButtons.forEach(b => b.disabled = true);

        const steps = [
            "قراءة شبكة الحساسات",
            "اكتشاف الأنماط غير الطبيعية",
            "حساب مستوى الخطر",
            "توليد التوصية"
        ];
        let step = 0;
        const timer = setInterval(() => {
            notify(steps[step] + "...", "info");
            step++;
            if(step >= steps.length){
                clearInterval(timer);
                finish();
            }
        }, 450);

        function finish(){
            /* Small deterministic improvement for the demo; it is not presented as live data. */
            metrics.air = Math.min(100, Number(metrics.air || 0) + 2);
            metrics.water = Math.min(100, Number(metrics.water || 0) + 3);
            metrics.energy = Math.min(100, Number(metrics.energy || 0) + 2);
            metrics.waste = Math.min(100, Number(metrics.waste || 0) + 2);

            try { if(typeof increaseLearning === "function") increaseLearning(2); } catch(e) {}
            try { if(typeof improveMetrics === "function") improveMetrics(2); } catch(e) {}
            try { if(typeof generateAIEvent === "function") generateAIEvent(); } catch(e) {}
            try { if(typeof updateMetricsUI === "function") updateMetricsUI(); } catch(e) {}
            try { if(typeof saveState === "function") saveState(); } catch(e) {}

            if(oldText) oldText.textContent = "LEARNING";
            actionButtons.forEach(b => b.disabled = false);

            const water = Math.round(metrics.water);
            const energy = Math.round(metrics.energy);
            const air = Math.round(metrics.air);
            const health = typeof calculateHealth === "function" ? calculateHealth() : Math.round((air+water+energy+Math.round(metrics.waste||0))/4);

            showAnalysisResult({air, water, energy, health});
            notify("اكتمل تحليل AI بنجاح", "success");
        }
    }

    function showAnalysisResult(data){
        const html = `
            <div class="analysis-result">
                <div class="detail-grid">
                    <div><span>جودة الهواء</span><strong>${data.air}%</strong></div>
                    <div><span>جودة المياه</span><strong>${data.water}%</strong></div>
                    <div><span>كفاءة الطاقة</span><strong>${data.energy}%</strong></div>
                    <div><span>صحة المدينة</span><strong>${data.health}/100</strong></div>
                </div>
                <div class="brain-explanation">
                    <strong>تفسير AI</strong>
                    <p>تمت مقارنة المؤشرات الحالية بخط الأساس للمحاكاة، ثم تحديد أولويات التدخل. النتائج المعروضة داخل المشروع تجريبية وليست قراءات رسمية مباشرة من شبكة مدينة حقيقية.</p>
                </div>
                <div class="modal-actions">
                    <button class="primary-btn full" id="analysisOpenDetective">
                        <i class="fa-solid fa-user-secret"></i> فتح التحقيق
                    </button>
                    <button class="secondary-btn full" id="analysisExport">
                        <i class="fa-solid fa-file-export"></i> تصدير التقرير
                    </button>
                </div>
            </div>`;

        if(typeof createModal === "function"){
            createModal("نتيجة تحليل AI", html, {icon:"fa-brain", kicker:"AI ANALYSIS COMPLETE"});
            setTimeout(() => {
                byId("analysisOpenDetective")?.addEventListener("click", () => {
                    try { if(typeof closeModal === "function") closeModal(); } catch(e){}
                    go("detective");
                });
                byId("analysisExport")?.addEventListener("click", () => exportProfessionalReport());
            }, 0);
        }
    }

    function buildReportHTML(){
        const s = (typeof state !== "undefined") ? state : {};
        const m = s.metrics || {};
        const round = v => Math.round(Number(v || 0));
        const health = typeof calculateHealth === "function" ? calculateHealth() : round((m.air+m.water+m.energy+m.waste+m.biodiversity)/5);
        const learning = round(s.learning);
        const actions = round(s.aiActions);
        const optimized = round(s.buildingsOptimized);
        const evolution = round(s.cityEvolution);
        const date = new Date().toLocaleString("ar-JO");

        return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ECOGENESIS AI — تقرير ذكاء المدينة</title>
<style>
body{margin:0;background:#061019;color:#eaf8f2;font-family:Arial,"Tahoma",sans-serif;line-height:1.8}
.wrap{max-width:1000px;margin:30px auto;padding:30px}.head{padding:28px;border:1px solid #1d3b3c;border-radius:20px;background:#0b171d}.brand{font-size:30px;font-weight:900;color:#53ffb1}.sub{color:#91aaa4}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:18px}.card{padding:20px;border:1px solid #1d3b3c;border-radius:16px;background:#0b171d}.value{font-size:32px;font-weight:900;color:#53ffb1}.label{color:#91aaa4}.section{margin-top:20px}.section h2{color:#53ffb1}.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #193036}.note{padding:15px;border-radius:12px;background:#102126;color:#b8ccc6}.footer{margin-top:30px;color:#718b85;font-size:13px}@media print{body{background:#fff;color:#111}.head,.card{background:#fff;border-color:#ddd}.brand,.section h2,.value{color:#16865a}}
</style>
</head>
<body>
<div class="wrap">
<div class="head"><div class="brand">ECOGENESIS AI</div><h1>تقرير ذكاء المدينة</h1><div class="sub">Environmental Intelligence Report • ${date}</div></div>
<div class="grid">
<div class="card"><div class="label">صحة المدينة</div><div class="value">${health}/100</div></div>
<div class="card"><div class="label">Eco Score</div><div class="value">${round(s.ecoScore || health)}/100</div></div>
<div class="card"><div class="label">AI Learning</div><div class="value">${learning}%</div></div>
</div>
<div class="section"><h2>المؤشرات البيئية</h2>
<div class="card">
<div class="row"><span>جودة الهواء</span><strong>${round(m.air)}%</strong></div>
<div class="row"><span>جودة المياه</span><strong>${round(m.water)}%</strong></div>
<div class="row"><span>كفاءة الطاقة</span><strong>${round(m.energy)}%</strong></div>
<div class="row"><span>إدارة النفايات</span><strong>${round(m.waste)}%</strong></div>
<div class="row"><span>التنوع الحيوي</span><strong>${round(m.biodiversity)}%</strong></div>
</div></div>
<div class="section"><h2>نشاط الذكاء الاصطناعي</h2><div class="card">
<div class="row"><span>قرارات AI</span><strong>${actions}</strong></div>
<div class="row"><span>المباني المحسنة</span><strong>${optimized}</strong></div>
<div class="row"><span>تطور المدينة</span><strong>${evolution}%</strong></div>
<div class="row"><span>مستوى التعلم</span><strong>${learning}%</strong></div>
</div></div>
<div class="section"><h2>تفسير النظام</h2><div class="note">يقوم ECOGENESIS AI في هذه التجربة التعليمية بجمع مؤشرات بيئية محاكاة، تحليل الأنماط، اكتشاف الحالات غير الطبيعية، اقتراح قرار، ثم تسجيل أثر القرار ضمن دورة التعلم. بعض النتائج تجريبية وليست بيانات رسمية أو قياسات حية لمدينة حقيقية.</div></div>
<div class="footer">Generated by ECOGENESIS AI • City Intelligence Engine</div>
</div></body></html>`;
    }

    function exportProfessionalReport(){
        const html = buildReportHTML();
        const blob = new Blob(["\ufeff", html], {type:"text/html;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ECOGENESIS-AI-City-Report.html";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        notify("تم تصدير التقرير الاحترافي", "success");
    }

    function printProfessionalReport(){
        const win = window.open("", "_blank", "width=1000,height=800");
        if(!win){ notify("المتصفح منع نافذة التقرير؛ اسمحي بالنوافذ المنبثقة.", "warning"); return; }
        win.document.open();
        win.document.write(buildReportHTML());
        win.document.close();
        setTimeout(() => { win.focus(); win.print(); }, 500);
    }

    /* Navigation: the original script listened to .nav-btn while the HTML uses .nav-item. */
    all(".nav-item, .nav-btn").forEach(btn => {
        btn.addEventListener("click", function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            go(this.dataset.page);
        }, true);
    });

    /* AI analysis buttons: support every ID used by the different dashboard versions. */
    ["startAIAnalysisBtn","runAIBtn","eventActionBtn"].forEach(id => {
        const b = byId(id);
        if(!b || b.dataset.functionalPatch) return;
        b.dataset.functionalPatch = "1";
        b.addEventListener("click", function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            runRealDemoAnalysis();
        }, true);
    });

    /* Investigation buttons */
    ["investigateBtn","investigateCityAlert","startInvestigationBtn","investigateJordanBtn"].forEach(id => {
        const b = byId(id);
        if(!b || b.dataset.functionalPatch) return;
        b.dataset.functionalPatch = "1";
        b.addEventListener("click", function(e){
            if(id === "investigateJordanBtn") return;
            e.preventDefault();
            e.stopImmediatePropagation();
            try { if(typeof startInvestigation === "function") startInvestigation(); else go("detective"); }
            catch(err){ go("detective"); }
        }, true);
    });

    /* Project report button + modal save button. */
    ["exportReportBtn","downloadReportBtn"].forEach(id => {
        const b = byId(id);
        if(!b || b.dataset.functionalPatch) return;
        b.dataset.functionalPatch = "1";
        b.addEventListener("click", function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            exportProfessionalReport();
        }, true);
    });

    /* Add a print/PDF option next to the report download button. */
    const download = byId("downloadReportBtn");
    if(download && !byId("printReportBtn")){
        const p = document.createElement("button");
        p.id = "printReportBtn";
        p.className = "secondary-btn";
        p.innerHTML = '<i class="fa-solid fa-print"></i> طباعة / PDF';
        p.addEventListener("click", function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            printProfessionalReport();
        }, true);
        download.parentElement?.insertBefore(p, download.nextSibling);
    }

    /* Make the old exportReport function use the professional exporter when invoked elsewhere. */
    window.exportProfessionalReport = exportProfessionalReport;
    window.runRealDemoAnalysis = runRealDemoAnalysis;
})();


/* =========================================================
   MOBILE NAVIGATION PATCH
   Keeps existing navigation and visual design intact.
========================================================= */
(function () {
  "use strict";
  function setupMobileNavigation() {
    const button = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");
    if (!button || !sidebar || button.dataset.mobileReady === "1") return;
    button.dataset.mobileReady = "1";

    function closeMenu() {
      sidebar.classList.remove("mobile-open");
      document.body.classList.remove("mobile-nav-open");
      button.setAttribute("aria-expanded", "false");
    }
    function openMenu() {
      sidebar.classList.add("mobile-open");
      document.body.classList.add("mobile-nav-open");
      button.setAttribute("aria-expanded", "true");
    }
    button.setAttribute("aria-controls", "mobile-navigation");
    button.setAttribute("aria-expanded", "false");
    if (!sidebar.id) sidebar.id = "mobile-navigation";
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      if (sidebar.classList.contains("mobile-open")) closeMenu();
      else openMenu();
    });
    document.addEventListener("click", function (event) {
      if (!sidebar.classList.contains("mobile-open")) return;
      if (!sidebar.contains(event.target) && !button.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
    sidebar.querySelectorAll(".nav-btn").forEach(function (navButton) {
      navButton.addEventListener("click", closeMenu);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    }, { passive: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupMobileNavigation, { once: true });
  } else {
    setupMobileNavigation();
  }
})();
