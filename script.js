// Variables globales
let isAnalyzing = false;
let videoStream = null;
let isRealCamera = false;

// Données d'émotions
let emotionData = {
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    neutral: 0,
    fearful: 0
};

// Historique de l'humeur (simulation)
let moodHistory = [
    { day: 'Lun', emotion: 'happy', level: 65 },
    { day: 'Mar', emotion: 'neutral', level: 45 },
    { day: 'Mer', emotion: 'sad', level: 30 },
    { day: 'Jeu', emotion: 'happy', level: 80 },
    { day: 'Ven', emotion: 'surprised', level: 70 },
    { day: 'Sam', emotion: 'happy', level: 85 },
    { day: 'Dim', emotion: 'neutral', level: 50 }
];

// Recommandations par émotion
const emotionRecommendations = {
    happy: [
        "🎉 Excellent ! Profitez de ce moment positif avec PAUSE",
        "📝 Notez ce qui vous rend heureux aujourd'hui",
        "🤝 Partagez votre bonne humeur avec vos collègues",
        "🌟 Votre énergie positive influence votre environnement professionnel"
    ],
    sad: [
        "🌱 La tristesse est temporaire, soyez bienveillant avec vous-même",
        "🎵 Écoutez de la musique qui vous réconforte",
        "🚶‍♀️ Une petite marche peut aider à changer d'état d'esprit",
        "💙 PAUSE vous accompagne dans ces moments difficiles"
    ],
    angry: [
        "🌬️ Respirez profondément 5 fois de suite avec la méthode PAUSE",
        "⏸️ Prenez une pause de 10 minutes",
        "💭 Identifiez la source de votre frustration",
        "🧘‍♂️ Utilisez nos techniques de relaxation express"
    ],
    surprised: [
        "✨ L'inattendu peut être une opportunité",
        "🎯 Restez ouvert aux nouvelles possibilités",
        "🧘‍♀️ Prenez un moment pour assimiler avec PAUSE",
        "🌟 Votre adaptabilité est une force"
    ],
    neutral: [
        "⚡ C'est le moment parfait pour être productif",
        "🎯 Fixez-vous un petit objectif motivant",
        "🌟 Cherchez quelque chose qui vous inspire",
        "📈 PAUSE peut vous aider à stimuler votre énergie"
    ],
    fearful: [
        "🛡️ Vous êtes en sécurité, respirez calmement",
        "💪 Rappelez-vous vos réussites passées",
        "🤝 N'hésitez pas à demander du soutien",
        "🌟 PAUSE vous donne les outils pour surmonter vos peurs"
    ]
};

// Exercices par émotion
const exercises = {
    happy: {
        title: "Méditation de Gratitude PAUSE",
        description: "Prenez 3 minutes pour apprécier ce moment de bonheur et ancrer cette émotion positive"
    },
    sad: {
        title: "Respiration Réconfortante PAUSE", 
        description: "Technique de respiration douce développée par PAUSE pour apaiser la tristesse"
    },
    angry: {
        title: "Relaxation Progressive PAUSE",
        description: "Méthode PAUSE pour relâcher les tensions musculaires étape par étape"
    },
    surprised: {
        title: "Ancrage au Présent PAUSE",
        description: "Exercice 5-4-3-2-1 adapté par PAUSE pour vous recentrer"
    },
    neutral: {
        title: "Activation Énergétique PAUSE",
        description: "Mouvements doux développés par PAUSE pour stimuler votre énergie"
    },
    fearful: {
        title: "Sécurisation Mentale PAUSE",
        description: "Visualisation apaisante PAUSE pour retrouver confiance en vous"
    }
};

// Initialisation de l'application
function initApp() {
    console.log('🎭 Initialisation d\'EmoMirror...');
    updateMoodHistory();
    simulateInitialEmotion();
    
    // Vérification de compatibilité
    checkBrowserCompatibility();
}

// Vérification de la compatibilité du navigateur
function checkBrowserCompatibility() {
    const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
    const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    
    console.log('🔍 Vérifications de compatibilité:');
    console.log('• HTTPS:', isHTTPS ? '✅' : '❌');
    console.log('• MediaDevices API:', hasMediaDevices ? '✅' : '❌');
    
    if (!isHTTPS) {
        console.warn('⚠️ HTTPS requis pour l\'accès caméra');
    }
    
    if (!hasMediaDevices) {
        console.warn('⚠️ API MediaDevices non supportée');
    }
}

// Démarrage de l'analyse émotionnelle
async function startEmotionAnalysis() {
    console.log('📷 Démarrage de l\'analyse émotionnelle...');
    
    // Mettre à jour le statut
    updateStatus('📷 Demande d\'autorisation caméra...', 'status-analyzing');
    
    try {
        // Demander l'accès à la caméra (logique du test qui fonctionne)
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user' 
            } 
        });
        
        console.log('✅ Caméra activée avec succès');
        isRealCamera = true;
        activateRealCamera();
        
    } catch (error) {
        console.error('❌ Erreur d\'accès caméra:', error);
        handleCameraError(error);
    }
}

// Gestion des erreurs de caméra
function handleCameraError(error) {
    let errorMessage = '';
    
    if (error.name === 'NotAllowedError') {
        errorMessage = 'Permission refusée par l\'utilisateur';
    } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra trouvée';
    } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Navigateur non compatible';
    } else if (error.name === 'NotReadableError') {
        errorMessage = 'Caméra déjà utilisée par une autre application';
    } else {
        errorMessage = error.message;
    }
    
    console.log('📱 Affichage de la modal de permission caméra');
    showCameraPermissionModal(errorMessage);
}

// Activation de la vraie caméra
function activateRealCamera() {
    isAnalyzing = true;
    
    // Mise à jour de l'interface
    document.getElementById('startCamera').style.display = 'none';
    document.getElementById('stopCamera').style.display = 'inline-block';
    updateStatus('📹 Caméra activée - Analyse en cours', 'status-analyzing');
    
    // Afficher la vidéo
    const video = document.getElementById('cameraVideo');
    const placeholder = document.getElementById('cameraPlaceholder');
    
    placeholder.style.display = 'none';
    video.style.display = 'block';
    video.srcObject = videoStream;
    
    // Afficher l'overlay d'émotion
    document.getElementById('emotionOverlay').style.display = 'block';
    
    // Créer les points faciaux
    createFacialPoints();
    
    // Démarrer l'analyse simulée
    startEmotionSimulation();
}

// Modal de permission caméra
function showCameraPermissionModal(errorMessage = '') {
    const modal = document.createElement('div');
    modal.className = 'camera-modal';
    modal.id = 'cameraModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>📷 Accès à la Caméra</h2>
            <p>Pour une expérience optimale, EmoMirror souhaite accéder à votre caméra pour analyser vos expressions faciales en temps réel.</p>
            
            ${errorMessage ? `<div style="background: rgba(255, 107, 107, 0.2); border: 1px solid #ff6b6b; border-radius: 10px; padding: 15px; margin: 15px 0;">
                <strong>❌ Erreur:</strong> ${errorMessage}
            </div>` : ''}
            
            <p style="margin-bottom: 30px; opacity: 0.9; font-size: 0.9em;">
                <strong>🔒 Votre vie privée est protégée :</strong><br>
                • Aucune vidéo n'est enregistrée ou stockée<br>
                • L'analyse se fait localement dans votre navigateur<br>
                • Vous pouvez refuser et utiliser le mode simulation
            </p>
            
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-primary" onclick="retryCamera()">
                    📹 Réessayer
                </button>
                <button class="modal-btn modal-btn-secondary" onclick="useSimulationMode()">
                    🎭 Mode Simulation
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Ajouter les fonctions globales pour les boutons
    window.retryCamera = () => {
        document.body.removeChild(modal);
        startEmotionAnalysis();
    };
    
    window.useSimulationMode = () => {
        document.body.removeChild(modal);
        activateSimulationMode();
    };
}

// Mode simulation
function activateSimulationMode() {
    isAnalyzing = true;
    isRealCamera = false;
    
    // Mise à jour de l'interface
    document.getElementById('startCamera').style.display = 'none';
    document.getElementById('stopCamera').style.display = 'inline-block';
    updateStatus('🎭 Mode Simulation - Démonstration', 'status-analyzing');
    
    // Simulation de l'activation de la caméra
    setTimeout(() => {
        document.getElementById('cameraPlaceholder').style.display = 'none';
        document.getElementById('cameraVideo').style.display = 'block';
        document.getElementById('emotionOverlay').style.display = 'block';
        
        // Ajouter un indicateur de simulation
        const video = document.getElementById('cameraVideo');
        video.style.background = 'linear-gradient(45deg, #333, #555)';
        video.style.display = 'flex';
        video.style.alignItems = 'center';
        video.style.justifyContent = 'center';
        video.innerHTML = '<div style="color: #ccc; font-size: 1.2em; text-align: center;">🎭<br>Mode Simulation<br>Démonstration</div>';
        
        // Simulation des points faciaux
        createFacialPoints();
        
        // Démarrer la simulation d'analyse
        startEmotionSimulation();
    }, 1000);
}

// Arrêt de l'analyse
function stopEmotionAnalysis() {
    console.log('⏹️ Arrêt de l\'analyse émotionnelle');
    isAnalyzing = false;
    
    // Arrêter la vraie caméra si elle est active
    if (videoStream && isRealCamera) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        console.log('📹 Flux vidéo arrêté');
    }
    
    // Mise à jour de l'interface
    document.getElementById('startCamera').style.display = 'inline-block';
    document.getElementById('stopCamera').style.display = 'none';
    updateStatus('📱 Caméra Inactive', 'status-inactive');
    
    // Réinitialiser l'affichage
    const video = document.getElementById('cameraVideo');
    const placeholder = document.getElementById('cameraPlaceholder');
    
    placeholder.style.display = 'flex';
    video.style.display = 'none';
    video.innerHTML = '';
    video.style.background = '';
    document.getElementById('emotionOverlay').style.display = 'none';
    
    clearFacialPoints();
    isRealCamera = false;
}

// Mise à jour du statut
function updateStatus(message, className) {
    const statusElement = document.getElementById('statusIndicator');
    statusElement.textContent = message;
    statusElement.className = `status-indicator ${className}`;
}

// Création des points de détection faciale
function createFacialPoints() {
    const container = document.getElementById('facialPoints');
    container.innerHTML = '';
    
    // Simulation de points de détection faciale
    const points = [
        {x: 45, y: 30}, {x: 55, y: 30}, // Yeux
        {x: 50, y: 45}, // Nez
        {x: 42, y: 60}, {x: 50, y: 65}, {x: 58, y: 60}, // Bouche
        {x: 35, y: 25}, {x: 65, y: 25}, // Coins externes yeux
        {x: 50, y: 35}, // Centre front
        {x: 40, y: 50}, {x: 60, y: 50}, // Joues
    ];
    
    points.forEach((point, index) => {
        setTimeout(() => {
            const dot = document.createElement('div');
            dot.className = 'face-point';
            dot.style.left = point.x + '%';
            dot.style.top = point.y + '%';
            container.appendChild(dot);
        }, index * 100);
    });
}

// Effacer les points faciaux
function clearFacialPoints() {
    document.getElementById('facialPoints').innerHTML = '';
}

// Simulation d'analyse émotionnelle
function startEmotionSimulation() {
    if (!isAnalyzing) return;
    
    console.log('🎭 Démarrage de la simulation d\'analyse');
    
    // Simulation d'analyse émotionnelle dynamique
    const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    // Réinitialiser les données
    Object.keys(emotionData).forEach(key => {
        emotionData[key] = Math.random() * 15; // Bruit de fond
    });
    
    // Émotion dominante avec variation naturelle
    emotionData[primaryEmotion] = 65 + Math.random() * 25;
    
    // Ajouter une émotion secondaire
    const secondaryEmotion = emotions.filter(e => e !== primaryEmotion)[Math.floor(Math.random() * 5)];
    emotionData[secondaryEmotion] = 25 + Math.random() * 20;
    
    updateEmotionDisplay();
    updateRecommendations(primaryEmotion);
    updateExercise(primaryEmotion);
    
    // Prochaine analyse dans 3-5 secondes
    setTimeout(startEmotionSimulation, 3000 + Math.random() * 2000);
}

// Mise à jour de l'affichage des émotions
function updateEmotionDisplay() {
    // Trouver l'émotion dominante
    const dominantEmotion = Object.keys(emotionData).reduce((a, b) => 
        emotionData[a] > emotionData[b] ? a : b
    );
    
    const confidence = Math.round(emotionData[dominantEmotion]);
    
    // Mettre à jour l'overlay
    const emotionIcons = {
        happy: '😊', sad: '😢', angry: '😠', 
        surprised: '😲', neutral: '😐', fearful: '😨'
    };
    
    const emotionNames = {
        happy: 'Joie', sad: 'Tristesse', angry: 'Colère',
        surprised: 'Surprise', neutral: 'Neutre', fearful: 'Peur'
    };
    
    document.getElementById('currentEmotion').textContent = 
        `${emotionIcons[dominantEmotion]} ${emotionNames[dominantEmotion]} détectée`;
    document.getElementById('confidenceFill').style.width = confidence + '%';
    document.getElementById('emotionConfidence').textContent = `Confiance: ${confidence}%`;
    
    // Mettre à jour les cartes d'émotions avec animation
    Object.keys(emotionData).forEach(emotion => {
        const percentage = Math.round(emotionData[emotion]);
        const levelElement = document.getElementById(emotion + 'Level');
        const percentageElement = document.getElementById(emotion + 'Percentage');
        
        if (levelElement && percentageElement) {
            setTimeout(() => {
                levelElement.style.width = percentage + '%';
                percentageElement.textContent = percentage + '%';
            }, Math.random() * 500);
        }
    });
}

// Mise à jour des recommandations
function updateRecommendations(emotion) {
    const recommendations = emotionRecommendations[emotion];
    const container = document.getElementById('recommendationsList');
    
    container.innerHTML = '';
    recommendations.forEach((rec, index) => {
        setTimeout(() => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.textContent = rec;
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            container.appendChild(item);
            
            // Animation d'apparition
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 50);
        }, index * 200);
    });
}

// Mise à jour de l'exercice suggéré
function updateExercise(emotion) {
    const exercise = exercises[emotion];
    const exerciseElement = document.getElementById('exerciseText');
    
    if (exerciseElement) {
        // Animation de changement
        exerciseElement.style.opacity = '0.5';
        setTimeout(() => {
            exerciseElement.innerHTML = 
                `<strong>${exercise.title}</strong><br>${exercise.description}`;
            exerciseElement.style.opacity = '1';
        }, 300);
    }
}

// Démarrage d'un exercice
function startExercise() {
    // Animation de feedback
    const button = document.getElementById('exerciseSuggestion');
    if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
    
    alert('🧘‍♀️ Exercice en cours de développement ! Cette fonctionnalité sera bientôt disponible dans votre app PAUSE.');
}

// Simulation d'émotion initiale
function simulateInitialEmotion() {
    // Simulation d'une émotion neutre au démarrage
    emotionData.neutral = 60;
    emotionData.happy = 25;
    updateEmotionDisplay();
    updateRecommendations('neutral');
    updateExercise('neutral');
}

// Mise à jour de l'historique de l'humeur
function updateMoodHistory() {
    const container = document.getElementById('moodHistory');
    if (!container) return;
    
    container.innerHTML = '';
    
    moodHistory.forEach(mood => {
        const bar = document.createElement('div');
        bar.className = 'mood-bar';
        bar.style.height = mood.level * 2 + 'px';
        
        const label = document.createElement('div');
        label.className = 'mood-label';
        label.textContent = mood.day;
        
        bar.appendChild(label);
        container.appendChild(bar);
        
        // Couleur selon l'émotion
        const emotionColors = {
            happy: 'linear-gradient(to top, #f1c40f, #f39c12)',
            sad: 'linear-gradient(to top, #3498db, #2980b9)',
            angry: 'linear-gradient(to top, #e74c3c, #c0392b)',
            surprised: 'linear-gradient(to top, #9b59b6, #8e44ad)',
            neutral: 'linear-gradient(to top, #95a5a6, #7f8c8d)',
            fearful: 'linear-gradient(to top, #e67e22, #d35400)'
        };
        
        bar.style.background = emotionColors[mood.emotion];
    });
}

// Fermer les modals en cliquant à l'extérieur
window.addEventListener('click', function(event) {
    const modal = document.getElementById('cameraModal');
    if (modal && event.target === modal) {
        document.body.removeChild(modal);
    }
});

// Initialisation de l'application au chargement
window.addEventListener('load', function() {
    console.log('🚀 EmoMirror chargé');
    initApp();
});