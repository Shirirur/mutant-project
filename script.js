/* 
    SCRIPT GLOBAL - PROJET MUTANT WATCH
    ====================================
    Ce fichier centralise TOUTE la logique du site.
    Il est chargé par chaque page HTML (<script src="script.js">).
    
    Principe d'interopérabilité :
    - HTML = structure uniquement
    - CSS  = présentation uniquement  
    - JS   = comportement et logique
    
    Les fonctions vérifient l'existence des éléments avant d'agir,
    ce qui évite les erreurs quand le script est chargé sur une page
    qui n'a pas tous les conteneurs (ex: index.html n'a pas #mutant-list).
*/

// =====================================================
// 1. ACCÈS SÉCURISÉ (utilisé par index.html)
// =====================================================
/* =====================================================
   VÉRIFICATION DE LA CLÉ D'ACCÈS (index.html)
   
   Quand la clé est correcte, on déclenche une séquence
   d'animation avant de rediriger :
   1. Message "ACCÈS AUTORISÉ" avec animation de typing
   2. Flash vert sur tout l'écran
   3. Fondu au noir
   4. Redirection vers home.html
===================================================== */
function checkAccess() {
    const input = document.getElementById('access-key').value.trim().toUpperCase();
    const error = document.getElementById('error-msg');

    if (input === 'TRASK') {
        /* On stocke le flag d'accès dans sessionStorage */
        sessionStorage.setItem('accessGranted', 'true');

        /* ---- ÉTAPE 1 : Créer l'overlay de transition ----
           On crée dynamiquement une <div> qui va recouvrir
           tout l'écran pour jouer les animations dessus.
           document.createElement() crée un nouvel élément HTML
           sans l'ajouter au DOM tant qu'on n'appelle pas appendChild(). */
        const overlay = document.createElement('div');
        overlay.className = 'transition-overlay';

        /* ---- ÉTAPE 2 : Contenu de l'overlay ----
           innerHTML permet d'insérer du HTML à l'intérieur
           de l'élément créé. On y met le message d'accès
           et une barre de progression animée. */
        overlay.innerHTML = `
            <div class="transition-content">
                <div class="transition-icon">✅</div>
                <h2 class="transition-title">ACCÈS AUTORISÉ</h2>
                <p class="transition-subtitle">Bienvenue dans le Recensement</p>
                <div class="transition-bar-container">
                    <div class="transition-bar"></div>
                </div>
                <p class="transition-status">Chargement des données classifiées...</p>
            </div>
        `;

        /* ---- ÉTAPE 3 : Ajouter l'overlay au body ----
           appendChild() insère l'élément comme dernier
           enfant du <body>. L'overlay apparaît à l'écran. */
        document.body.appendChild(overlay);

        /* ---- ÉTAPE 4 : Déclencher l'animation ----
           requestAnimationFrame() attend la prochaine image
           d'affichage du navigateur avant d'exécuter le code.
           C'est nécessaire pour que le navigateur ait le temps
           de "peindre" l'overlay AVANT d'ajouter la classe
           qui déclenche l'animation CSS (transition). */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                /* La classe 'active' déclenche les transitions
                   CSS (opacité, transformation, etc.) */
                overlay.classList.add('active');
            });
        });

        /* ---- ÉTAPE 5 : Redirection après l'animation ----
           setTimeout() attend un délai (en millisecondes)
           avant d'exécuter le code. 3000ms = 3 secondes,
           ce qui laisse le temps à l'animation de se jouer. */
        setTimeout(() => {
            /* On ajoute une classe pour le fondu au noir final */
            overlay.classList.add('fade-out');

            /* Après le fondu (800ms), on redirige */
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 800);
        }, 3000);

    } else {
        /* ---- CLÉ INCORRECTE ----
           On affiche le message d'erreur et on le secoue. */
        error.style.display = 'block';

        /* Pour relancer l'animation shake même si elle
           a déjà été jouée, on la retire puis on la remet.
           Le setTimeout de 10ms laisse au navigateur le temps
           de détecter le changement (sinon il l'ignore). */
        error.style.animation = 'none';
        setTimeout(() => {
            error.style.animation = 'shake 0.4s ease-in-out';
        }, 10);

        /* On ajoute aussi un flash rouge sur le champ de saisie
           pour renforcer visuellement l'erreur */
        const inputField = document.getElementById('access-key');
        inputField.classList.add('input-error-flash');
        setTimeout(() => {
            inputField.classList.remove('input-error-flash');
        }, 600);
    }
}


// =====================================================
// 2. BASE DE DONNÉES (tableau d'objets JavaScript)
// =====================================================
/* Chaque objet représente un personnage avec ses propriétés.
   Le champ "type" permet de séparer Mutants et Homo Superior.
   Ce tableau est la source unique de vérité pour tout le site. */

const mutantDB = [
     {
        id: "M-001", nom: "LOGAN", alias: "Wolverine", image: "assets/img/wolverine.jpeg",
        classe: "Beta", pouvoirs: ["Régénération", "Squelette Adamantium", "Griffes"], type: "mutant"
    },
    {
        id: "M-007", nom: "ORORO MUNROE", alias: "Storm", image: "assets/img/storm.jpeg",
        classe: "Omega", pouvoirs: ["Manipulation Météo", "Vol", "Électrokinésie"], type: "mutant"
    },
    {
        id: "M-010", nom: "BOBBY DRAKE", alias: "Iceman", image: "assets/img/iceman.jpeg",
        classe: "Omega", pouvoirs: ["Cryokinésie", "Thermodynamique", "Forme de glace"], type: "mutant"
    },
    {
        id: "M-011", nom: "JEAN GREY", alias: "Phoenix", image: "assets/img/phoenix.jpeg",
        classe: "Omega", pouvoirs: ["Télépathie", "Télékinésie", "Force Phénix"], type: "mutant"
    },
    {
        id: "M-012", nom: "PIETRO MAXIMOFF", alias: "Quicksilver", image: "assets/img/quicksilver.jpeg",
        classe: "Alpha", pouvoirs: ["Super-Vitesse", "Métabolisme accéléré"], type: "mutant"
    },
    {
        id: "M-013", nom: "SCOTT SUMMERS", alias: "Cyclope", image: "assets/img/cyclope.jpeg",
        classe: "Alpha", pouvoirs: ["Rafales Optiques", "Géométrie Spatiale"], type: "mutant"
    },
    {
        id: "M-014", nom: "ANNA MARIE", alias: "Malicia", image: "assets/img/unknow.jpeg",
        classe: "Beta", pouvoirs: ["Absorption vitale", "Copie de pouvoirs"], type: "mutant"
    },
    {
        id: "M-015", nom: "REMY LEBEAU", alias: "Gambit", image: "assets/img/unknow.jpeg",
        classe: "Beta", pouvoirs: ["Charge Cinétique", "Charme hypnotique"], type: "mutant"
    },
    {
        id: "M-024", nom: "KURT WAGNER", alias: "Nightcrawler", image: "assets/img/nightcrawler.jpeg",
        classe: "Gamma", pouvoirs: ["Téléportation", "Agilité", "Adhérence"], type: "mutant"
    },
    {
        id: "M-026", nom: "RAVEN DARKHÖLME", alias: "Mystique", image: "assets/img/raven.jpeg",
        classe: "Beta", pouvoirs: ["Métamorphose", "Espionnage", "Anti-vieillissement"], type: "mutant"
    },
    {
        id: "M-016", nom: "WARREN WORTHINGTON III", alias: "Angel", image: "assets/img/angel.jpeg",
        classe: "Gamma", pouvoirs: ["Vol", "Ailes organiques", "Sang guérisseur"], type: "mutant"
    },
    {
        id: "M-017", nom: "LUCAS BISHOP", alias: "Bishop", image: "assets/img/bishop.jpeg",
        classe: "Alpha", pouvoirs: ["Absorption d'énergie", "Redistribution cinétique"], type: "mutant"
    },
    {
        id: "M-018", nom: "JUBILATION LEE", alias: "Jubilee", image: "assets/img/jubilee.jpeg",
        classe: "Delta", pouvoirs: ["Plasmoïdes explosifs", "Immunité télépathique"], type: "mutant"
    },
    {
        id: "M-019", nom: "ALEX SUMMERS", alias: "Havok", image: "assets/img/havock.jpeg",
        classe: "Alpha", pouvoirs: ["Rafales de Plasma", "Absorption cosmique"], type: "mutant"
    },
    {
        id: "M-020", nom: "ELIZABETH BRADDOCK", alias: "Psylocke", image: "assets/img/psylocke.jpeg",
        classe: "Alpha", pouvoirs: ["Télépathie", "Dague psychique", "Arts martiaux"], type: "mutant"
    },
    {
        id: "M-021", nom: "UNKNOWN", alias: "Forge", image: "assets/img/unknow.jpeg",
        classe: "Alpha", pouvoirs: ["Invention intuitive", "Génie technologique"], type: "mutant"
    },
    {
        id: "M-022", nom: "SEAN CASSIDY", alias: "Banshee", image: "assets/img/banshee.jpeg",
        classe: "Beta", pouvoirs: ["Cri sonique", "Vol", "Sonar"], type: "mutant"
    },
    {
        id: "M-027", nom: "ILLYANA RASPUTINA", alias: "Magik", image: "assets/img/magik.jpeg",
        classe: "Alpha", pouvoirs: ["Sorcellerie des Limbes", "Disques de téléportation", "Épée de l'âme"], type: "mutant"
    },
    {
        id: "M-023", nom: "ARMANDO MUÑOZ", alias: "Darwin", image: "assets/img/unknow.jpeg",
        classe: "Alpha", pouvoirs: ["Adaptation réactive instantanée"], type: "mutant"
    },
    {
        id: "M-025", nom: "CLARICE FERGUSON", alias: "Blink", image: "assets/img/blink.jpeg",
        classe: "Beta", pouvoirs: ["Portails de téléportation", "Disruption spatiale"], type: "mutant"
    },

    // ==========================================
    // CATEOGORIE : AUTRES SURHUMAINS (Aliens, Magie, Mutés)
    // ==========================================
    {
        id: "HS-010", nom: "THOR ODINSON", alias: "Thor", image: "assets/img/unknow.jpeg",
        classe: "Omega", pouvoirs: ["Physiologie Asgardienne", "Contrôle Foudre", "Mjolnir"], type: "superior"
    },
    {
        id: "HS-011", nom: "BRUCE BANNER", alias: "Hulk", image: "assets/img/unknow.jpeg",
        classe: "Omega", pouvoirs: ["Force illimitée", "Invulnérabilité", "Régénération Gamma"], type: "superior"
    },
    {
        id: "HS-012", nom: "PETER PARKER", alias: "Spider-Man", image: "assets/img/unknow.jpeg",
        classe: "Beta", pouvoirs: ["Sens d'araignée", "Adhérence", "Force proportionnelle"], type: "superior"
    },
    {
        id: "HS-013", nom: "T'CHALLA", alias: "Black Panther", image: "assets/img/panther.jpeg",
        classe: "Beta", pouvoirs: ["Amélioration par l'Herbe Cœur", "Armure Vibranium", "Génie tactique"], type: "superior"
    },
    {
        id: "HS-014", nom: "MATT MURDOCK", alias: "Daredevil", image: "assets/img/unknow.jpeg",
        classe: "Gamma", pouvoirs: ["Sens hyper-développés", "Sens Radar", "Expertise martiale"], type: "superior"
    },
    {
        id: "HS-015", nom: "LUKE CAGE", alias: "Power Man", image: "assets/img/cage.jpeg",
        classe: "Beta", pouvoirs: ["Peau impénétrable", "Super-force"], type: "superior"
    },
    {
        id: "HS-016", nom: "DANNY RAND", alias: "Iron Fist", image: "assets/img/unknow.jpeg",
        classe: "Beta", pouvoirs: ["Manipulation du Chi", "Poing d'acier", "Arts martiaux"], type: "superior"
    },
    {
        id: "HS-017", nom: "WANDA MAXIMOFF", alias: "Scarlet Witch", image: "assets/img/wanda.jpeg",
        classe: "Omega", pouvoirs: ["Magie du Chaos", "Altération de la réalité", "Télékinésie"], type: "superior"
    },
    {
        id: "HS-018", nom: "SCOTT LANG", alias: "Ant-Man", image: "assets/img/unknow.jpeg",
        classe: "Gamma", pouvoirs: ["Changement de taille", "Contrôle des fourmis", "Technologie Pym"], type: "superior"
    },
    {
        id: "HS-019", nom: "MARC SPECTOR", alias: "Moon Knight", image: "assets/img/unknow.jpeg",
        classe: "Beta", pouvoirs: ["Avatar de Khonshu", "Résistance accrue", "Armes lunaires"], type: "superior"
    },
    {
        id: "HS-020", nom: "AGATHA HARKNESS", alias: "Agatha", image: "assets/img/agatha.jpeg",
        classe: "Alpha", pouvoirs: ["Sorcellerie", "Absorption de magie", "Longévité"], type: "superior"
    },
    {
        id: "HS-021", nom: "BILLY KAPLAN", alias: "Wiccan", image: "assets/img/wiccan.jpeg",
        classe: "Alpha", pouvoirs: ["Magie Kaplan", "Électrokinésie", "Vol"], type: "superior"
    },
    {
        id: "HS-022", nom: "MONICA RAMBEAU", alias: "Photon", image: "assets/img/photon.jpeg",
        classe: "Alpha", pouvoirs: ["Transformation en énergie", "Vol", "Intangibilité"], type: "superior"
    },
    {
        id: "HS-023", nom: "MAX DILLON", alias: "Electro", image: "assets/img/electro.jpeg",
        classe: "Beta", pouvoirs: ["Génération électrique", "Vol électrique"], type: "superior"
    },
    {
        id: "HS-024", nom: "FLINT MARKO", alias: "Sandman", image: "assets/img/unknow.jpeg",
        classe: "Beta", pouvoirs: ["Corps de sable", "Changement de forme", "Force brute"], type: "superior"
    },
    {
        id: "HS-025", nom: "EDDIE BROCK", alias: "Venom", image: "assets/img/unknow.jpeg",
        classe: "Alpha", pouvoirs: ["Symbiote Alien", "Force", "Toiles organiques", "Crocs"], type: "superior"
    },
    {
        id: "HS-026", nom: "PARKER ROBBINS", alias: "The Hood", image: "assets/img/hood.jpeg",
        classe: "Beta", pouvoirs: ["Magie noire", "Invisibilité", "Lévitation (via Cape)"], type: "superior"
    }
];

// --- Valeurs par défaut ---
const DOSSIER_DEFAULTS = {
    bio: "Aucune biographie confirmée.",
    lastSeen: "Localisation inconnue",
    statut: "Non vérifié",
    danger: "À évaluer",
    notes: "Dossier incomplet. Surveillance recommandée.",
    tags: [],
    media: []
};

/* forEach parcourt chaque élément du tableau.
   Object.assign fusionne les propriétés par défaut PUIS les propriétés existantes.
   L'ordre est important : defaults d'abord, puis p, pour que les données
   personnalisées écrasent les valeurs par défaut. */
mutantDB.forEach(p => {
    Object.assign(p, DOSSIER_DEFAULTS, p);
    p.nom = (p.nom ?? "").trim();
    p.alias = (p.alias ?? "").trim();
    p.classe = (p.classe ?? "Beta").trim();
    if (!Array.isArray(p.pouvoirs)) p.pouvoirs = [];
});

// --- Patches ciblés (données spécifiques par personnage) ---
const DOSSIER_PATCHES = {
     "M-001": {
    lastSeen: "Westchester",
    statut: "Actif",
    danger: "Élevé",
    notes: "Déplacements erratiques. Réagit violemment aux provocations.",
    tags: ["X-MEN", "combat"]
  },
  "M-007": {
    lastSeen: "New York (Harlem)",
    statut: "Actif",
    danger: "Extrême",
    notes: "Capacité météo à large échelle. Risque collatéral majeur.",
    tags: ["climat"]
  },
  "M-010": {
    lastSeen: "New York (périphérie)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Cryokinésie: neutralisation rapide de périmètre (routes, ponts, accès). Danger accru en environnement urbain.",
    tags: ["X-MEN", "glace", "contrôle-de-zone", "surveillance-Trask"]
  },
  "M-011": {
    lastSeen: "Localisation inconnue",
    statut: "Non vérifié",
    danger: "Extrême",
    notes: "Télépathie/télékinésie (et manifestations 'Phénix' selon rumeurs). Dossier volontairement fragmenté. Fuite d’infos suspectée.",
    tags: ["X-MEN", "psy", "niveau-oméga", "données-incomplètes"]
  },
  "M-012": {
    lastSeen: "New York (axes rapides)",
    statut: "Actif",
    danger: "Modéré",
    notes: "Super-vitesse. Difficile à pister (fenêtre d’intervention très courte). Préférer pièges/passifs plutôt que poursuite.",
    tags: ["vitesse", "interception", "surveillance-Trask"]
  },
  "M-013": {
    lastSeen: "Localisation inconnue",
    statut: "Actif",
    danger: "Élevé",
    notes: "Rafales optiques concussives. Profil commandement/tactique. À traiter comme coordinateur de cellule.",
    tags: ["X-MEN", "leader", "attaque-distance", "surveillance-Trask"]
  },
  "M-014": {
    lastSeen: "Sud des États-Unis (signalements dispersés)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Absorption vitale + copie de pouvoirs par contact. Interdiction de contact direct. Confinement et distance recommandés.",
    tags: ["X-MEN", "absorption", "contact-dangereux", "surveillance-Trask"]
  },
  "M-015": {
    lastSeen: "La Nouvelle-Orléans",
    statut: "Actif",
    danger: "Modéré",
    notes: "Charge cinétique d’objets. Profil 'charmeur' et opportuniste. Risque accru si accès à explosifs/objets métalliques.",
    tags: ["X-MEN", "explosif", "infiltration", "surveillance-Trask"]
  },
  "M-024": {
    lastSeen: "Localisation inconnue (témoignages nocturnes)",
    statut: "Actif",
    danger: "Modéré",
    notes: "Téléportation. Extraction/sabotage possibles sans déclenchement d’alarme. Sécuriser les zones par sas + capteurs redondants.",
    tags: ["X-MEN", "téléportation", "infiltration", "surveillance-Trask"]
  },
  "M-026": {
    lastSeen: "Europe (capitale non confirmée)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Métamorphose: risque d’usurpation d’identité (agents, civils, accès). Tout accès sensible doit exiger double validation.",
    tags: ["métamorphe", "espionnage", "usurpation", "surveillance-Trask"]
  },
   "M-016": {
    lastSeen: "Los Angeles",
    statut: "Actif",
    danger: "Faible",
    notes: "Mobilité aérienne. Menace directe limitée, mais utile en reconnaissance/sauvetage. Sous-estimé car non agressif.",
    tags: ["X-MEN", "aérien", "reconnaissance"]
  },
  "M-017": {
    lastSeen: "New York",
    statut: "Actif",
    danger: "Élevé",
    notes: "Absorbe/redirige l’énergie. Profil paramilitaire. Attention: les tirs énergétiques peuvent renforcer la cible.",
    tags: ["X-MEN", "énergie", "tactique", "surveillance-Trask"]
  },
   "M-018": {
    lastSeen: "Los Angeles",
    statut: "Actif",
    danger: "Modéré",
    notes: "Plasmoïdes (charges lumineuses). Généralement non létal, mais capable d’aveuglement/rupture de ligne de défense.",
    tags: ["X-MEN", "diversion", "contrôle-foule"]
  },
  "M-019": {
    lastSeen: "Localisation inconnue",
    statut: "Actif",
    danger: "Élevé",
    notes: "Rafales de plasma. Puissance instable selon stress. Zone d’exclusion recommandée si engagement.",
    tags: ["X-MEN", "plasma", "attaque-distance", "surveillance-Trask"]
  },
  "M-020": {
    lastSeen: "Royaume-Uni (signalements)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Télépathie + compétences martiales. Neutralisations propres et rapides. Risque de compromission d’équipe via intrusion mentale.",
    tags: ["X-MEN", "psy", "assaut-précis", "surveillance-Trask"]
  },
  "M-021": {
    lastSeen: "Sud-Ouest US (atelier mobile)",
    statut: "Actif",
    danger: "Modéré",
    notes: "Invention intuitive: la menace vient de l’équipement (drones, brouillage, armes). Risque élevé si accès à ressources industrielles.",
    tags: ["technologie", "ingénierie", "contre-mesures", "surveillance-Trask"]
  },
   "M-022": {
    lastSeen: "Irlande (Dublin, non confirmé)",
    statut: "Non vérifié",
    danger: "Modéré",
    notes: "Cri sonique. Peut désorienter et fissurer structures légères. Profil historique variable (retours/absences).",
    tags: ["sonique", "mobilité", "données-incomplètes"]
  },
  "M-027": {
    lastSeen: "Localisation inconnue (anomalies de portails)",
    statut: "Actif",
    danger: "Extrême",
    notes: "Sorcellerie + portails. Risque d’incident dimensionnel. Toute intervention doit inclure protocole anti-artefact.",
    tags: ["magie", "portails", "extradimensionnel", "surveillance-Trask"]
  },
  "M-023": {
    lastSeen: "Côte Ouest (témoignages)",
    statut: "Non vérifié",
    danger: "Modéré",
    notes: "Adaptation réactive: impossible de prévoir le 'build' final. Risque augmente avec la menace rencontrée.",
    tags: ["adaptation", "imprévisible", "données-incomplètes"]
  },
  "M-025": {
    lastSeen: "Asie (zone portuaire, non confirmé)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Portails: repositionnement d’unités, extraction instantanée. Menace tactique majeure pour périmètres sécurisés.",
    tags: ["téléportation", "mobilité", "rupture-périmètre", "surveillance-Trask"]
  },
    // =========================
  // HOMO SUPERIOR / AUTRES
  // =========================
  "HS-010": {
    lastSeen: "New York (événement public)",
    statut: "Actif",
    danger: "Extrême",
    notes: "Profil 'cosmique'. Engagement déconseillé. Documenter, se replier, transmettre les données au réseau.",
    tags: ["asgardien", "cosmique", "foudre", "niveau-oméga"]
  },
  "HS-011": {
    lastSeen: "Sud-Ouest US (zone rurale)",
    statut: "Actif",
    danger: "Extrême",
    notes: "Escalade de force incontrôlable. Ne pas provoquer. Priorité absolue: évacuation civile + containment indirect.",
    tags: ["gamma", "force", "catastrophe", "protocole-évacuation"]
  },
  "HS-012": {
    lastSeen: "Queens, New York",
    statut: "Actif",
    danger: "Modéré",
    notes: "Vigilantisme. Évite généralement la létalité. Très difficile à immobiliser (mobilité + sens préventif).",
    tags: ["vigilante", "agilité", "toiles", "NYC"]
  },
  "HS-013": {
    lastSeen: "Wakanda (non accessible)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Technologie avancée + discipline tactique. Menace élevée si intrusion/espionnage détectés.",
    tags: ["wakanda", "technologie", "stratégie", "contre-espionnage"]
  },
  "HS-014": {
    lastSeen: "Hell's Kitchen, New York",
    statut: "Actif",
    danger: "Modéré",
    notes: "Combat rapproché élite. Détecte anomalies sonores/respiration. À éviter en filature directe.",
    tags: ["vigilante", "corps-à-corps", "NYC"]
  },
  "HS-015": {
    lastSeen: "Harlem, New York",
    statut: "Actif",
    danger: "Élevé",
    notes: "Peau impénétrable. Neutralisation difficile sans moyens spécialisés. Généralement protecteur des civils.",
    tags: ["durabilité", "force", "NYC"]
  },
  "HS-016": {
    lastSeen: "New York",
    statut: "Actif",
    danger: "Élevé",
    notes: "Chi offensif. Peut perforer/rompre des matériaux. Risque important en duel rapproché.",
    tags: ["arts-martiaux", "chi", "corps-à-corps"]
  },
  "HS-017": {
    lastSeen: "Europe (signalements contradictoires)",
    statut: "Non vérifié",
    danger: "Extrême",
    notes: "Altération de la réalité (niveau critique). Dossier sensible: désinformation probable. Éviter toute opération agressive.",
    tags: ["magie", "réalité", "niveau-oméga", "données-incomplètes"]
  },
  "HS-018": {
    lastSeen: "San Francisco",
    statut: "Actif",
    danger: "Modéré",
    notes: "Changement de taille: infiltration d’infrastructures (labos, serveurs). Sécuriser avec contrôles physiques redondants.",
    tags: ["infiltration", "pym", "sabotage"]
  },
  "HS-019": {
    lastSeen: "New York (nuit, zones criminelles)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Profil imprévisible, violence potentiellement disproportionnée. Risque accru si affaire 'mystique' impliquée.",
    tags: ["vigilante", "instabilité", "mystique"]
  },
  "HS-020": {
    lastSeen: "Nouvelle-Angleterre (rumeurs)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Sorcellerie expérimentée. Préférer observation à distance + collecte d’artefacts/signes précurseurs.",
    tags: ["magie", "rituels", "surveillance"]
  },
  "HS-021": {
    lastSeen: "New York (réseau jeune)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Magie à fort potentiel. Effets parfois peu prédictibles. Risque d’escalade si stress/menace perçue.",
    tags: ["magie", "potentiel", "jeunes-héros"]
  },
  "HS-022": {
    lastSeen: "New York (ciel urbain)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Forme d’énergie + intangibilité. Très difficile à contenir. Perturbations possibles sur capteurs/communications.",
    tags: ["énergie", "intangibilité", "mobilité"]
  },
  "HS-023": {
    lastSeen: "New York (réseau électrique)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Menace directe pour infrastructures (pannes, arcs). Priorité: isoler le secteur, protéger hôpitaux/transport.",
    tags: ["électricité", "infrastructure", "criminel"]
  },
  "HS-024": {
    lastSeen: "New Jersey (zones industrielles)",
    statut: "Actif",
    danger: "Élevé",
    notes: "Corps de sable: résistance + pénétration. Confinement complexe; éviter espaces ouverts et ventilation non filtrée.",
    tags: ["métamorphe", "durabilité", "criminel"]
  },
"HS-025": {
  lastSeen: "San Francisco (mission de terrain non datée)",
  statut: "Actif",
  danger: "Élevé",
  notes: "Symbiote extraterrestre lié à l’hôte. Force, régénération, camouflage organique. Comportement instable selon l’hôte; éviter la provocation, privilégier confinement et séparation hôte/symbiote.",
  tags: ["symbiote", "anti-héros", "NY/SF", "biologique", "surveillance-Trask"]
},
"HS-026": {
  lastSeen: "New York (Lower Manhattan, rumeurs récurrentes)",
  statut: "Actif",
  danger: "Élevé",
  notes: "Chef criminel équipé d’artefacts (cape/bottes) associés à phénomènes mystiques: invisibilité, lévitation et mobilité furtive. Menace hybride: crime organisé + occultisme. Priorité: remonter la chaîne de financement et saisir les artefacts.",
  tags: ["crime-organisé", "magie-noire", "infiltration", "artefact", "surveillance-Trask"]
}
    // ... (GARDE TOUS TES PATCHES EXISTANTS)
};

/* Application des patches : si un personnage a un patch,
   on fusionne ses données spécifiques par-dessus les defaults. */
mutantDB.forEach(p => {
    if (DOSSIER_PATCHES[p.id]) {
        Object.assign(p, DOSSIER_PATCHES[p.id]);
    }
});

// =====================================================
// 3. FONCTIONS DE RENDU (AFFICHAGE DYNAMIQUE)
// =====================================================

/* --- 3a. Fonction générique pour créer le HTML d'une fiche ---
   Prend un objet personnage et retourne une chaîne HTML.
   Les template literals (backticks `) permettent d'insérer
   des variables avec ${...} directement dans le HTML. */
function createCardHTML(p) {
    return `
        <div class="file-card" onclick="openDossier('${p.id}')">
            <div class="file-header">
                <span class="code">${p.id} // ${p.classe}</span>
                <span class="code">${p.statut ?? ''}</span>
            </div>
            <div class="file-body">
                <img class="mugshot" src="${p.image}" alt="Photo de ${p.alias}">
                <ul class="stats">
                    <li><strong>${p.alias}</strong></li>
                    <li>${p.nom}</li>
                    <li>Capacités : ${p.pouvoirs.join(', ')}</li>
                </ul>
            </div>
            <button class="access-btn">OUVRIR LE DOSSIER</button>
        </div>
    `;
}

/* --- 3b. Rendu pour la page HOME (les deux catégories côte à côte) ---
   Cette fonction n'est plus utilisée sur home.html dans la nouvelle version,
   mais on la garde si besoin pour une vue "tout en un". */
function renderMutants(list) {
    const mutantContainer = document.getElementById('mutant-list');
    const superiorContainer = document.getElementById('superior-list');

    /* Vérification : si les conteneurs n'existent pas sur la page courante,
       on sort de la fonction pour éviter une erreur JavaScript. */
    if (!mutantContainer && !superiorContainer) return;

    if (mutantContainer) mutantContainer.innerHTML = '';
    if (superiorContainer) superiorContainer.innerHTML = '';

    list.forEach(p => {
        const html = createCardHTML(p);
        if (p.type === "mutant" && mutantContainer) {
            mutantContainer.innerHTML += html;
        } else if (p.type === "superior" && superiorContainer) {
            superiorContainer.innerHTML += html;
        }
    });
}

/* --- 3c. NOUVELLE FONCTION : Rendu par type (pour les pages dédiées) ---
   Affiche uniquement les personnages d'un type donné dans le bon conteneur.
   
   Paramètre "type" : 'mutant' ou 'superior'
   
   .filter() crée un nouveau tableau contenant uniquement les éléments
   pour lesquels la condition retourne true. */
function renderByType(type) {
    /* On détermine quel conteneur HTML cibler selon le type.
       L'opérateur ternaire (condition ? siVrai : siFaux) simplifie le if/else. */
    const containerId = (type === 'mutant') ? 'mutant-list' : 'superior-list';
    const container = document.getElementById(containerId);

    // Sécurité : si le conteneur n'existe pas sur cette page, on arrête
    if (!container) return;

    /* .filter() parcourt mutantDB et ne garde que les personnages
       dont le champ "type" correspond à celui demandé. */
    const filtered = mutantDB.filter(p => p.type === type);

    /* .map() transforme chaque objet personnage en HTML (string),
       puis .join('') concatène tous les morceaux en une seule chaîne.
       C'est plus performant que += dans une boucle (un seul accès au DOM). */
    container.innerHTML = filtered.map(p => createCardHTML(p)).join('');
}

// =====================================================
// 4. MOTEUR DE RECHERCHE
// =====================================================

/* --- 4a. Recherche globale (ancienne version, pour compatibilité) --- */
function filterMutants() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();

    /* .filter() + .includes() : on cherche le texte saisi dans le nom,
       l'alias ou les pouvoirs. .some() retourne true dès qu'au moins
       un pouvoir contient le texte recherché. */
    const filteredList = mutantDB.filter(p => {
        return p.nom.toLowerCase().includes(searchInput) ||
               p.alias.toLowerCase().includes(searchInput) ||
               p.pouvoirs.some(pouvoir => pouvoir.toLowerCase().includes(searchInput));
    });

    renderMutants(filteredList);
}

/* --- 4b. NOUVELLE FONCTION : Recherche filtrée par type ---
   Utilisée sur mutants.html et superiors.html.
   Combine le filtre par type ET la recherche textuelle.
   
   Paramètre "type" : 'mutant' ou 'superior' */
function filterByType(type) {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    const containerId = (type === 'mutant') ? 'mutant-list' : 'superior-list';
    const container = document.getElementById(containerId);

    if (!container) return;

    /* Double filtre enchaîné :
       1) On ne garde que le bon type
       2) Parmi ceux-là, on filtre par le texte saisi */
    const filtered = mutantDB.filter(p => {
        // Premier filtre : le type doit correspondre
        if (p.type !== type) return false;

        // Si la barre de recherche est vide, on affiche tout
        if (searchInput === '') return true;

        // Second filtre : recherche textuelle dans nom, alias ou pouvoirs
        return p.nom.toLowerCase().includes(searchInput) ||
               p.alias.toLowerCase().includes(searchInput) ||
               p.pouvoirs.some(pouvoir => pouvoir.toLowerCase().includes(searchInput));
    });

    container.innerHTML = filtered.map(p => createCardHTML(p)).join('');
}

// =====================================================
// 5. NAVIGATION VERS UN DOSSIER INDIVIDUEL
// =====================================================

/* openDossier() — Redirige vers la fiche d'un personnage.
   
   window.location.pathname retourne le chemin de la page actuelle,
   par exemple "/mutants.html" ou "/pages/superiors.html".
   
   .split('/').pop() extrait le dernier segment : "mutants.html"
   .replace('.html', '') enlève l'extension : "mutants"
   
   On passe cette valeur dans le paramètre &from= de l'URL
   pour que la page dossier.html sache où renvoyer l'utilisateur
   quand il clique sur "RETOUR". */
function openDossier(id) {
    // Détecte le nom de la page actuelle (ex: "mutants", "superiors", "hotspot")
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Redirige vers le dossier en ajoutant l'id ET la page d'origine
    window.location.href = `dossier.html?id=${id}&from=${currentPage}`;
}


// =====================================================
// 6. PAGE DOSSIER (dossier.html)
// =====================================================

/* Cherche un personnage par son ID dans la base de données.
   .find() retourne le premier élément qui correspond, ou undefined. */
function getPersonnageById(id) {
    return mutantDB.find(p => p.id === id);
}

/* Fonction d'initialisation de la page dossier.
   Lit l'URL, récupère le personnage, et injecte ses données dans le HTML. */
function initDossierPage() {
    if (sessionStorage.getItem('accessGranted') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // ═══════════════════════════════════════════════════════
    // BOUTON RETOUR DYNAMIQUE
    // Le paramètre "from" dans l'URL indique la page d'origine.
    // Exemple : dossier.html?id=M-001&from=mutants
    //   → params.get('from') retourne "mutants"
    //   → le bouton retour pointera vers "mutants.html"
    //
    // La table "pages" sert de liste blanche (whitelist) :
    // seules les pages connues sont acceptées, ce qui empêche
    // un utilisateur malveillant d'injecter une URL externe.
    // ═══════════════════════════════════════════════════════
    const from = params.get('from');
    const backLink = document.getElementById('back-link');

    if (backLink && from) {
        const pages = {
            'mutants':   'mutants.html',
            'superiors': 'superiors.html',
            'hotspot':   'hotspot.html',
            'home':      'home.html'
        };

        // Si "from" correspond à une page connue, on met à jour le lien
        // Sinon le href reste sur "home.html" (valeur par défaut du HTML)
        if (pages[from]) {
            backLink.href = pages[from];
        }
    }

    if (!id) {
        window.location.href = 'home.html';
        return;
    }

    const personnage = getPersonnageById(id);

    if (!personnage) {
        alert("Dossier introuvable. Retour à la base de données.");
        window.location.href = 'home.html';
        return;
    }

    // --- Injection des données dans les éléments HTML ---
    const img = document.getElementById('profile-img');
    const profileId = document.getElementById('profile-id');
    const profileClasse = document.getElementById('profile-classe');
    const profileAlias = document.getElementById('profile-alias');
    const profileName = document.getElementById('profile-name');
    const profilePowers = document.getElementById('profile-powers');
    const profileType = document.getElementById('profile-type');

    /* document.title modifie le texte affiché dans l'onglet du navigateur.
       Petit détail qui donne un aspect professionnel au site. */
    document.title = `Dossier #${personnage.id} — ${personnage.alias}`;

    img.src = personnage.image;
    img.alt = `Photo du sujet : ${personnage.alias}`;
    profileId.textContent = `#${personnage.id}`;
    profileClasse.textContent = personnage.classe;

    /* classList permet d'ajouter/retirer des classes CSS dynamiquement.
       Ici on retire toutes les classes de niveau pour en ajouter la bonne,
       ce qui change la couleur du badge selon le niveau de menace. */
    profileClasse.classList.remove('omega', 'alpha', 'beta', 'gamma', 'delta');
    profileClasse.classList.add(personnage.classe.toLowerCase());

    profileAlias.textContent = personnage.alias;
    profileName.textContent = personnage.nom;

    profileType.textContent = (personnage.type === "mutant") 
        ? "Mutant (Gène X)" 
        : "Homo Superior";

    /* On génère la liste des pouvoirs dynamiquement.
       .map() transforme chaque pouvoir en balise <li>,
       puis .join('') fusionne le tout en une seule chaîne HTML. */
    profilePowers.innerHTML = personnage.pouvoirs
        .map(p => `<li>${p}</li>`)
        .join('');

    // --- Injection des données de surveillance (patches) ---
    const notesEl = document.querySelector('.notes');
    if (notesEl && personnage.notes) {
        /* On reconstruit le contenu de la note avec les données du patch.
           innerHTML permet d'insérer du HTML (balises <span>, <br>, etc.). */
        notesEl.innerHTML = `
            Le sujet a été repéré par nos algorithmes. 
            Son appartenance à la catégorie <span id="profile-type">
            ${(personnage.type === "mutant") ? "Mutant (Gène X)" : "Homo Superior"}
            </span> nécessite une surveillance accrue.
            <br><br>
            <strong>📍 Dernière localisation :</strong> ${personnage.lastSeen}<br>
            <strong>📊 Statut :</strong> ${personnage.statut}<br>
            <strong>⚠️ Niveau de danger :</strong> ${personnage.danger}<br><br>
            <strong>📝 Notes opérationnelles :</strong><br>
            ${personnage.notes}
        `;
    }
}

/* Initialisation automatique de la page dossier.
   On vérifie qu'on est bien sur dossier.html en cherchant un élément
   qui n'existe que sur cette page (#profile-img). */
if (document.getElementById('profile-img')) {
    initDossierPage();
}
// =========================================================
// FONCTION D'ENVOI DU TÉMOIGNAGE (PAGE TRANSMISSION)
// Construit un lien mailto: proprement encodé en UTF-8
// pour éviter les problèmes d'accents et caractères spéciaux.
// =========================================================

function sendTestimony() {

    // --- 1. RÉCUPÉRATION DES VALEURS ---
    // .value récupère le texte saisi par l'utilisateur dans chaque champ.
    // .trim() supprime les espaces en début/fin de chaîne.
    const codename   = document.getElementById('codename').value.trim();
    const location   = document.getElementById('location').value.trim();
    const datetime   = document.getElementById('datetime').value;
    const phenomenon = document.getElementById('phenomenon').value;
    const report     = document.getElementById('report').value.trim();

    // --- 2. RÉCUPÉRATION DU BOUTON RADIO SÉLECTIONNÉ ---
    // document.querySelector cherche le premier élément qui correspond au sélecteur CSS.
    // input[name="Urgence"]:checked cible le bouton radio coché du groupe "Urgence".
    const urgencyRadio = document.querySelector('input[name="Urgence"]:checked');

    // L'opérateur ternaire (condition ? valeurSiVrai : valeurSiFaux)
    // évite une erreur si aucun bouton n'est coché.
    const urgency = urgencyRadio ? urgencyRadio.value : 'Non spécifié';

    // --- 3. FORMATAGE DE LA DATE ---
    // On transforme la date brute (2025-01-15T14:30) en format lisible.
    let dateFormatted = 'Non précisée';
    if (datetime) {
        // new Date() crée un objet Date JavaScript à partir de la chaîne.
        // toLocaleString('fr-FR') formate la date selon les conventions françaises.
        dateFormatted = new Date(datetime).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // --- 4. CONSTRUCTION DU SUJET DU MAIL ---
    // Le sujet résume le rapport pour un tri rapide dans la boîte de réception.
    const subject = `[TRASK] Signalement ${urgency} — ${phenomenon} — ${codename}`;

    // --- 5. CONSTRUCTION DU CORPS DU MAIL ---
    // Les template literals (`) permettent d'écrire du texte sur plusieurs lignes
    // et d'insérer des variables avec ${}.
    // \n crée un retour à la ligne dans le texte brut du mail.
    const body = `
========================================
  RAPPORT DE SURVEILLANCE — TRASK INDUSTRIES
========================================

NOM DE CODE : ${codename}
LIEU : ${location}
DATE / HEURE : ${dateFormatted}
TYPE DE PHÉNOMÈNE : ${phenomenon}
NIVEAU D'URGENCE : ${urgency}

----------------------------------------
RAPPORT DÉTAILLÉ :
----------------------------------------

${report}

========================================
Transmission via Protocole Sentinelle.
========================================
    `.trim();
    // .trim() supprime les lignes vides au début et à la fin.

    // --- 6. ENCODAGE ET OUVERTURE DU CLIENT MAIL ---
    // encodeURIComponent() convertit les caractères spéciaux (accents, espaces,
    // retours à la ligne, émojis...) en codes compatibles avec une URL.
    // Exemple : "é" devient "%C3%A9", un espace devient "%20".
    // C'est LA solution au problème d'accents dans mailto.
    const mailtoLink = 
        'mailto:alt.cq-4p92pch@yopmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body='    + encodeURIComponent(body);

    // window.location.href redirige le navigateur vers le lien mailto:
    // ce qui ouvre le client mail par défaut (Outlook, Thunderbird, Mail, Gmail...)
    // avec tous les champs pré-remplis et correctement encodés.
    window.location.href = mailtoLink;
}
/* ============================================
   HOTSPOT — SYSTÈME DE FILTRAGE DES SIGNALEMENTS
   =============================================
   Cette fonction initialise les boutons filtres
   de la page hotspot.html.
   
   Principe : chaque bouton porte un attribut data-filter
   ("all", "mutant", "superior", "inconnu").
   Chaque carte porte un attribut data-category.
   Au clic sur un bouton, on compare les deux valeurs
   pour afficher ou masquer chaque carte.
============================================ */
function initHotspotFilters() {

    // querySelectorAll retourne une NodeList (liste) de tous
    // les éléments correspondant au sélecteur CSS donné.
    const filterBtns = document.querySelectorAll('.filter-btn');
    const hotspotCards = document.querySelectorAll('.hotspot-card');

    // Si aucun bouton filtre n'existe sur la page, on arrête.
    // Cela évite des erreurs quand script.js est chargé
    // sur d'autres pages (home.html, mutants.html, etc.)
    if (filterBtns.length === 0) return;

    // forEach() parcourt chaque bouton filtre un par un
    filterBtns.forEach(function(btn) {

        // addEventListener('click', ...) attache un écouteur d'événement.
        // À chaque clic sur ce bouton, la fonction anonyme s'exécute.
        btn.addEventListener('click', function() {

            // --- 1. Mise à jour visuelle des boutons ---
            // On retire la classe "active" de TOUS les boutons
            filterBtns.forEach(function(b) {
                b.classList.remove('active');
            });
            // On ajoute "active" uniquement au bouton cliqué
            // "this" fait référence à l'élément qui a déclenché l'événement
            this.classList.add('active');

            // --- 2. Lecture du filtre sélectionné ---
            // dataset.filter lit l'attribut HTML data-filter="..."
            // Ex : data-filter="mutant" → this.dataset.filter === "mutant"
            const filter = this.dataset.filter;

            // --- 3. Boucle sur toutes les cartes pour les afficher/cacher ---
            hotspotCards.forEach(function(card) {
                // dataset.category lit l'attribut data-category de chaque carte
                if (filter === 'all') {
                    // Filtre "TOUS" : on affiche toutes les cartes
                    card.style.display = 'flex';
                } else if (card.dataset.category === filter) {
                    // La catégorie de la carte correspond au filtre → on affiche
                    card.style.display = 'flex';
                } else {
                    // La catégorie ne correspond pas → on masque
                    // display:none retire complètement la carte du flux visuel
                    card.style.display = 'none';
                }
            });
        });
    });
}


/* ============================================
   HOTSPOT DETAIL — BASE DE DONNÉES DES SIGNALEMENTS
   ==================================================
   Objet contenant toutes les informations détaillées
   de chaque signalement. La clé (ex: "HS-001") correspond
   au paramètre ?id= passé dans l'URL.

   Dans un vrai projet professionnel, ces données
   viendraient d'un serveur via une API (fetch/AJAX).
   Ici on utilise un objet JS statique car le site
   est entièrement côté client (front-end seulement).
============================================ */
const hotspotsData = {
    'HS-001': {
        title: 'Décharge électrique non naturelle',
        location: "Hell's Kitchen, New York",
        date: '12/01/2025 — 23h47',
        badge: 'URGENT',
        badgeClass: 'urgent',
        category: 'MUTANT PRÉSUMÉ',
        tagClass: 'tag-mutant',
        image: 'assets/img/hotspot/elec.png',
        imageAlt: 'Photo floue — décharge électrique dans une ruelle',
        summary: "Un individu a été aperçu générant des arcs électriques depuis ses mains dans une ruelle de Hell's Kitchen. Les lampadaires ont grillé dans un rayon de 50 mètres.",
        details: `
            <h4>RAPPORT COMPLET</h4>
            <p>Vers 23h47, trois témoins indépendants ont signalé une lumière intense et intermittente émanant d'une ruelle entre la 49e et la 50e rue. À leur approche, ils ont observé un individu de sexe masculin, environ 1m80, capuche relevée, générant des arcs électriques visibles depuis ses deux mains.</p>
            <p>L'individu semblait en détresse — les décharges paraissaient involontaires. Tous les lampadaires dans un rayon de 50 mètres ont grillé simultanément. Les compteurs électriques de 3 immeubles adjacents ont disjoncté.</p>
            <p>Le sujet a fui vers le nord en courant. Des marques de brûlure ont été relevées sur les murs de brique à l'endroit exact où il se trouvait.</p>
            
            <h4>PREUVES RECUEILLIES</h4>
            <ul>
                <li>Photos des marques de brûlure (voir ci-dessous)</li>
                <li>Témoignages enregistrés (3 sources indépendantes)</li>
                <li>Relevé des coupures de courant — Con Edison confirme une anomalie</li>
            </ul>

            <h4>ÉVALUATION</h4>
            <p>Probabilité de capacité mutante : <strong>87%</strong><br>
            Type estimé : Électrokinésie<br>
            Niveau de menace : <strong>ÉLEVÉ</strong> — Potentiel de dégâts matériels important.</p>
        `,
        relatedImages: [
            { src: 'assets/img/hotspot/elecwall.png', alt: 'Marques de brûlure sur le mur' },
            { src: 'assets/img/hotspot/elecstreet.png', alt: 'Lampadaire grillé' }
        ]
    },
    'HS-002': {
        title: 'Vol stationnaire au-dessus du Bronx',
        location: 'South Bronx, New York',
        date: '08/01/2025 — 04h12',
        badge: 'CONFIRMÉ',
        badgeClass: 'confirmed',
        category: 'HOMO SUPERIOR',
        tagClass: 'tag-superior',
        image: 'assets/img/hotspot/fly.png',
        imageAlt: "Silhouette volante au-dessus d'un immeuble",
        summary: 'Silhouette humaine en lévitation observée par 3 témoins indépendants pendant environ 6 minutes.',
        details: `
            <h4>RAPPORT COMPLET</h4>
            <p>À 04h12 du matin, une silhouette humaine a été observée en vol stationnaire à environ 40 mètres au-dessus d'un immeuble résidentiel du South Bronx. Le sujet ne portait aucun équipement de vol visible.</p>
            <p>Trois témoins situés à des positions différentes ont confirmé l'observation de manière indépendante. Le sujet est resté immobile pendant environ 6 minutes avant de s'élever rapidement et de disparaître en direction du nord-est.</p>
            <p>Aucun drone ou aéronef n'a été détecté par les radars locaux pendant cette période.</p>
            
            <h4>ÉVALUATION</h4>
            <p>Probabilité Homo Superior : <strong>92%</strong><br>
            Type estimé : Lévitation / Vol autonome<br>
            Niveau de menace : <strong>MODÉRÉ</strong> — Aucun comportement agressif observé.</p>
        `,
        relatedImages: []
    },
    'HS-003': {
        title: 'Griffures profondes sur structure en béton',
        location: 'Toronto, Canada',
        date: '15/01/2025 — 19h30',
        badge: 'RÉCENT',
        badgeClass: 'recent',
        category: 'MUTANT PRÉSUMÉ',
        tagClass: 'tag-mutant',
        image: 'assets/img/hotspot/feng.png',
        imageAlt: 'Marques de griffes profondes sur un mur en béton',
        summary: 'Des marques de griffes de 8cm de profondeur retrouvées sur un mur de béton armé. Aucun outil connu ne peut produire ce type de dégât.',
        details: `
            <h4>RAPPORT COMPLET</h4>
            <p>Découvertes le 15 janvier à 19h30 par un gardien d'immeuble, quatre griffures parallèles de 8 cm de profondeur et 1,20 m de longueur ont été trouvées sur un mur porteur en béton armé.</p>
            <p>L'analyse préliminaire montre que les entailles sont nettes, sans éclats — incompatible avec un outil mécanique. L'armature en acier à l'intérieur du béton a été tranchée net.</p>
            <p>Des caméras de surveillance du bâtiment voisin montrent une silhouette rapide passant devant le mur à 03h17 la nuit précédente. L'image est trop floue pour une identification.</p>
            
            <h4>ÉVALUATION</h4>
            <p>Probabilité de capacité mutante : <strong>94%</strong><br>
            Type estimé : Griffes rétractables / Force surhumaine<br>
            Niveau de menace : <strong>ÉLEVÉ</strong></p>
        `,
        relatedImages: [
            { src: 'assets/img/hotspot/fengshot.jpeg', alt: 'Gros plan sur les griffures' }
        ]
    },
    'HS-004': {
        title: 'Homme escaladant un mur avec des toiles',
        location: 'Central Park, New York',
        date: '18/01/2025 — 23h05',
        badge: 'CONFIRMÉ',
        badgeClass: 'confirmed',
        category: 'HOMO SUPERIOR',
        tagClass: 'tag-superior',
        image: 'assets/img/hotspot/spider.jpeg',
        imageAlt: 'Escalade du bâtiment avec des toiles',
        summary: 'Un homme a été aperçu entrain de grimper au dessus du bâtiment de science avec ses toiles.',
        details: `
            <h4>RAPPORT COMPLET</h4>
            <p>Le 18 janvier à 23h05, une jeune femme a aperçu un homme entrain de grimper au dessus du bâtiment de science de Central Park. Il semblait utiliser des toiles proches de celles des araignées pour coller au mur.</p>
            <p>La jeune femme a pris une photo de la scène avec son téléphone mais n'a pas réussi à avoir un résultat. L'individu semblait être inquiet d'avoir été pris en photo mais n'a pas cherché à suivre la femme.</p>
            <p>La femme s'est enfuit juste après la prise de la photo. Elle déclare avoir vu cet individu faire un saut gigantesque pour atteindre le toit du batiment.</p>
            
            <h4>ÉVALUATION</h4>
            <p>Origine : <strong>INCONNUE</strong><br>
            Type estimé : Pouvoir d'homme araignée<br>
            Niveau de menace : <strong>ÉLEVÉ</strong> — Puissance considérable, sujet non identifié.</p>
        `,
        relatedImages: []
    },
    'HS-005': {
        title: 'Télékinésie — Véhicule projeté à 15 mètres',
        location: 'Camden, Londres',
        date: '20/01/2025 — 21h33',
        badge: 'CONFIRMÉ',
        badgeClass: 'confirmed',
        category: 'HOMO SUPERIOR',
        tagClass: 'tag-superior',
        image: 'assets/img/hotspot/carfly.png',
        imageAlt: 'Voiture retournée par une force invisible',
        summary: 'Un SUV de 2 tonnes a été soulevé et projeté sans contact physique.',
        details: `
            <h4>RAPPORT COMPLET</h4>
            <p>À 21h33, un SUV Ford Explorer garé sur Jamaica Avenue a été soulevé à environ 3 mètres du sol et projeté à 15 mètres. Plusieurs témoins ont observé un individu levant la main en direction du véhicule juste avant l'événement.</p>
            <p>Le sujet — sexe féminin, environ 1m70, cheveux courts — a ensuite fui à pied dans une ruelle. Les témoins décrivent une expression de colère sur son visage.</p>
            <p>Le véhicule projeté a percuté un mur de brique, causant des dégâts structurels importants. Aucun blessé.</p>
            
            <h4>ÉVALUATION</h4>
            <p>Probabilité Homo Superior : <strong>96%</strong><br>
            Type estimé : Télékinésie de haute puissance<br>
            Niveau de menace : <strong>CRITIQUE</strong></p>
        `,
        relatedImages: [
            { src: 'assets/img/hotspot/crash.png', alt: 'Dégâts sur le mur percuté' }
        ]
    },
    'HS-006': {
        title: 'Emanation lumineuse violette — Origine inconnue',
        location: 'Westview, New Jersey',
        date: '22/01/2025 — 02h15',
        badge: 'RÉCENT',
        badgeClass: 'recent',
        category: 'NON IDENTIFIÉ',
        tagClass: 'tag-inconnu',
        image: 'assets/img/hotspot/agathouse.png',
        imageAlt: "Lumière violette émanant d'un sous-sol",
        summary: 'Une lumière violette intense émise depuis un sous-sol abandonné pendant environ 45 secondes.',
        details: `
            <h4>RAPPORT COMPLET</h4>
            <p>À 02h15, des résidents de Westview ont été réveillés par une lumière violette intense provenant du sous-sol d'une maison voisine.</p>
            <p>Le phénomène a duré environ 45 secondes. Un bourdonnement grave a été entendu pendant toute la durée. À l'arrivée des premiers curieux (environ 4 minutes plus tard), la porte de la maison était ouverte mais le le sous-sol était complètement vide.</p>
            <p>Certains précisent avoir vu des personnes vêtues de longues capes noir au moment de l’incident. A l’intérieur, les murs du sous-sol présentaient des traces de chaleur résiduelle.</p>
            
            <h4>ÉVALUATION</h4>
            <p>Origine : <strong>TOTALEMENT INCONNUE</strong><br>
            Type estimé : Portail énergétique ? Manifestation psychique ?<br>
            Niveau de menace : <strong>INDÉTERMINÉ</strong></p>
        `,
        relatedImages: []
    }
};


/* ============================================
   HOTSPOT DETAIL — RENDU DE LA PAGE DE DÉTAIL
   =============================================
   Cette fonction lit l'ID du signalement depuis l'URL,
   cherche les données correspondantes dans hotspotsData,
   puis génère et injecte tout le HTML dans la page.

   URLSearchParams : API native du navigateur qui parse
   les paramètres d'URL (tout ce qui suit le "?" dans l'URL).
   Ex : hotspot-detail.html?id=HS-001
   → params.get('id') retourne "HS-001"
============================================ */
function initHotspotDetail() {

    // On récupère le conteneur cible dans le HTML
    const detailContainer = document.getElementById('hotspot-detail');

    // Si le conteneur n'existe pas, on est sur une autre page → on arrête
    if (!detailContainer) return;

    // window.location.search retourne "?id=HS-001"
    // URLSearchParams le transforme en objet exploitable
    const params = new URLSearchParams(window.location.search);
    const hotspotId = params.get('id');

    // On cherche les données dans notre objet-base de données
    const data = hotspotsData[hotspotId];

    if (data) {
        // --- Construction du HTML des images complémentaires ---
        let relatedImagesHTML = '';

        if (data.relatedImages.length > 0) {
           // Ce conteneur permet au JavaScript de la lightbox de détecter
// les images cliquables et d'afficher le badge "Agrandir" au survol
const imagesHTML = data.relatedImages.map(function(img) {
    return '<div class="evidence-photo">' +
               '<img src="' + img.src + '" alt="' + img.alt + '">' +
           '</div>';
}).join('');

            relatedImagesHTML = `
                <div class="detail-related-images">
                    <h4>PREUVES PHOTOGRAPHIQUES</h4>
                    <div class="related-images-grid">
                        ${imagesHTML}
                    </div>
                </div>
            `;
        }

        // --- Injection du HTML complet dans le conteneur ---
        // Les template literals (backticks `) permettent d'écrire
        // du HTML sur plusieurs lignes et d'insérer des variables
        // avec la syntaxe ${variable}
        detailContainer.innerHTML = `
            <div class="detail-header">
                <a href="hotspot.html" class="back-link">&larr; RETOUR AUX SIGNALEMENTS</a>
                <span class="hotspot-id">${hotspotId}</span>
                <span class="hotspot-badge ${data.badgeClass}">${data.badge}</span>
            </div>

            <div class="detail-hero">
                <img src="${data.image}" alt="${data.imageAlt}">
            </div>

            <div class="detail-content">
                <h1>${data.title}</h1>
                <div class="detail-meta">
                    <span>📍 ${data.location}</span>
                    <span>🕐 ${data.date}</span>
                    <span class="hotspot-tag ${data.tagClass}">${data.category}</span>
                </div>
                <p class="detail-summary">${data.summary}</p>
                <div class="detail-full">${data.details}</div>
                ${relatedImagesHTML}
                <div class="detail-cta">
                    <a href="transmission.html" class="btn-transmit">📡 TRANSMETTRE UN COMPLÉMENT</a>
                </div>
            </div>
        `;
    } else {
        // Signalement non trouvé : on affiche un message d'erreur
        detailContainer.innerHTML = `
            <div class="detail-error">
                <h2>⚠️ SIGNALEMENT NON TROUVÉ</h2>
                <p>L'identifiant "${hotspotId || 'aucun'}" ne correspond à aucun signalement enregistré.</p>
                <a href="hotspot.html" class="back-link">&larr; RETOUR AUX SIGNALEMENTS</a>
            </div>
        `;
    }
}

initLightbox();
/* ============================================
   AUTO-INITIALISATION
   ==================================================
   Ces appels détectent automatiquement sur quelle page
   on se trouve et lancent la bonne fonction.
   
   Chaque fonction vérifie en interne si les éléments
   HTML nécessaires existent avant d'agir, donc aucun
   risque d'erreur si on est sur une autre page.
============================================ */
initHotspotFilters();
initHotspotDetail();
/* =====================================================
   DATE DE DERNIÈRE SYNCHRONISATION
   
   Affiche automatiquement la date et l'heure actuelles
   dans le footer, simulant une "dernière synchro"
   avec le serveur fictif.
   
   toLocaleString('fr-FR') formate la date en français :
   "25/06/2025 à 14:32:08"
===================================================== */
const syncElement = document.getElementById('last-sync');
if (syncElement) {
    syncElement.textContent = new Date().toLocaleString('fr-FR');
}
/* =====================================================
   GÉNÉRATEUR D'ACTIVITÉ RÉCENTE (RNG)
   
   Ce système pioche aléatoirement des messages dans
   une base prédéfinie et les affiche dans le ticker
   de la page d'accueil. À chaque rechargement de page,
   les messages changent, donnant l'illusion d'un site
   "vivant" avec une activité en temps réel.
   
   Concepts utilisés :
   - Tableau d'objets : stocke les données structurées
   - Math.random()    : génère un nombre aléatoire
   - DOM manipulation : injecte du HTML dynamiquement
   - .sort()          : trie les messages par heure
===================================================== */

/* -----------------------------------------------------
   BASE DE DONNÉES DES MESSAGES
   
   Chaque objet contient :
   - type     : catégorie du message (incident, repérage, 
                 mise à jour, alerte) → utilisé pour le style
   - text     : le contenu du message affiché
   - location : lieu fictif (optionnel, ajoute du réalisme)
   
   On peut ajouter autant de messages qu'on veut.
   Plus la base est grande, plus le contenu sera varié.
----------------------------------------------------- */
const activityDatabase = [
    // --- REPÉRAGES DE SUJETS ---
    { 
        type: "repérage", 
        text: "Sujet M-001 repéré à Westchester. Niveau de menace : <strong>Élevé</strong>." 
    },
    { 
        type: "repérage", 
        text: "Sujet M-003 aperçu dans le secteur de Salem Center. Furtif." 
    },
    { 
        type: "repérage", 
        text: "Sujet HS-012 identifié à Hell's Kitchen. Comportement erratique." 
    },
    { 
        type: "repérage", 
        text: "Contact visuel avec M-007 à proximité de l'Académie Xavier." 
    },
    { 
        type: "repérage", 
        text: "Individu non-identifié détecté à Madripoor. Gène X confirmé." 
    },
    { 
        type: "repérage", 
        text: "Sujet HS-019 localisé à Genosha. Surveillance renforcée." 
    },

    // --- INCIDENTS ---
    { 
        type: "incident", 
        text: "Incident électrique à Manhattan. Suspect : <strong>HS-023</strong>." 
    },
    { 
        type: "incident", 
        text: "Explosion d'origine inconnue dans un entrepôt à Brooklyn. Radiations gamma détectées." 
    },
    { 
        type: "incident", 
        text: "Perturbation magnétique massive au-dessus de Washington D.C." 
    },
    { 
        type: "incident", 
        text: "Séisme localisé à San Francisco. Épicentre : profondeur 0m. Non-naturel." 
    },
    { 
        type: "incident", 
        text: "Coupure de courant inexpliquée sur tout le comté de Westchester." 
    },
    { 
        type: "incident", 
        text: "Téléportation détectée par les capteurs du secteur 7-G." 
    },
    { 
        type: "incident", 
        text: "Onde psychique captée par le réseau Cerebro. Intensité : critique." 
    },

    // --- MISES À JOUR BASE DE DONNÉES ---
    { 
        type: "mise à jour", 
        text: "Nouvelle entrée HS-025 ajoutée à la base. <strong>Symbiote confirmé</strong>." 
    },
    { 
        type: "mise à jour", 
        text: "Dossier M-013 mis à jour. Niveau de menace reclassifié : Omega." 
    },
    { 
        type: "mise à jour", 
        text: "Photo de surveillance ajoutée au dossier HS-004." 
    },
    { 
        type: "mise à jour", 
        text: "Nouvelle capacité répertoriée pour le sujet M-009 : cryokinésie." 
    },
    { 
        type: "mise à jour", 
        text: "Dossier M-002 : statut changé de « disparu » à « actif »." 
    },
    { 
        type: "mise à jour", 
        text: "Archive audio déclassifiée ajoutée au dossier HS-017." 
    },

    // --- ALERTES ---
    { 
        type: "alerte", 
        text: "⚠ ALERTE : Sentinelle Mk-IV désactivée dans le secteur Nord. Cause inconnue." 
    },
    { 
        type: "alerte", 
        text: "⚠ Intrusion détectée dans le réseau interne. Firewall renforcé." 
    },
    { 
        type: "alerte", 
        text: "⚠ Sujet M-001 a franchi le périmètre de sécurité Alpha." 
    },
    { 
        type: "alerte", 
        text: "⚠ Signal de détresse capté sur fréquence X. Origine : Île de Muir." 
    },
    { 
        type: "alerte", 
        text: "⚠ Protocole Zéro Tolérance activé dans le secteur Est." 
    },
    { 
        type: "alerte", 
        text: "⚠ Anomalie temporelle brève détectée. Durée : 0.3 secondes." 
    },

    // --- OBSERVATIONS ---
    { 
        type: "observation", 
        text: "Activité inhabituelle au Hellfire Club. Agents en surveillance." 
    },
    { 
        type: "observation", 
        text: "Rassemblement de mutants détecté sous le pont de Brooklyn. Pacifique." 
    },
    { 
        type: "observation", 
        text: "Le sujet HS-008 a été vu en compagnie d'un individu non-répertorié." 
    },
    { 
        type: "observation", 
        text: "Fluctuations énergétiques anormales relevées à Stark Tower." 
    }
];

/* -----------------------------------------------------
   FONCTION : getRandomEntries(array, count)
   
   Pioche 'count' éléments aléatoires dans un tableau
   SANS DOUBLON. Utilise l'algorithme de Fisher-Yates
   (mélange aléatoire) puis prend les premiers éléments.
   
   Paramètres :
   - array : le tableau source (activityDatabase)
   - count : nombre d'éléments à piocher
   
   Retourne : un nouveau tableau avec 'count' éléments
----------------------------------------------------- */
function getRandomEntries(array, count) {
    /* [...array] crée une COPIE du tableau original.
       Le spread operator (...) décompose chaque élément
       dans un nouveau tableau. Ainsi on ne modifie pas
       la base de données originale en la mélangeant. */
    const shuffled = [...array];
    
    /* Algorithme de Fisher-Yates :
       Parcourt le tableau de la fin vers le début.
       À chaque étape, échange l'élément courant avec
       un élément choisi au hasard parmi ceux restants.
       C'est le moyen le plus fiable de mélanger un tableau. */
    for (let i = shuffled.length - 1; i > 0; i--) {
        /* Math.random() renvoie un nombre entre 0 et 1.
           Multiplié par (i + 1) et arrondi avec Math.floor(),
           on obtient un index aléatoire entre 0 et i. */
        const j = Math.floor(Math.random() * (i + 1));
        
        /* Échange (swap) des éléments aux positions i et j.
           La syntaxe [a, b] = [b, a] est une déstructuration
           qui permet d'échanger sans variable temporaire. */
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    /* .slice(0, count) extrait les 'count' premiers éléments
       du tableau mélangé. C'est notre sélection aléatoire. */
    return shuffled.slice(0, count);
}

/* -----------------------------------------------------
   FONCTION : generateRandomTime()
   
   Génère une heure aléatoire au format HH:MM.
   Utilisée pour donner un horodatage réaliste à
   chaque message du ticker.
   
   Retourne : une chaîne comme "14:32" ou "08:07"
----------------------------------------------------- */
function generateRandomTime() {
    /* Génère une heure entre 0 et 23 */
    const hours = Math.floor(Math.random() * 24);
    /* Génère des minutes entre 0 et 59 */
    const minutes = Math.floor(Math.random() * 60);
    
    /* .toString().padStart(2, '0') convertit le nombre
       en chaîne et ajoute un zéro devant si nécessaire.
       Exemple : 8 → "08", 14 → "14"
       padStart(2, '0') = "remplis le début jusqu'à 2 caractères avec des 0" */
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/* -----------------------------------------------------
   FONCTION : getTypeIcon(type)
   
   Associe un emoji/icône à chaque type de message.
   Rend le ticker plus lisible d'un coup d'œil.
   
   Paramètre : type (string) — catégorie du message
   Retourne : un emoji correspondant
----------------------------------------------------- */
function getTypeIcon(type) {
    /* L'objet 'icons' fonctionne comme un dictionnaire :
       on cherche la valeur associée à la clé 'type'.
       || "📡" est la valeur par défaut si le type
       n'existe pas dans le dictionnaire. */
    const icons = {
        "repérage":    "🔍",
        "incident":    "💥",
        "mise à jour": "📝",
        "alerte":      "🚨",
        "observation": "👁️"
    };
    return icons[type] || "📡";
}

/* -----------------------------------------------------
   FONCTION PRINCIPALE : generateActivityFeed()
   
   Orchestre la génération du ticker :
   1. Récupère le conteneur HTML
   2. Pioche des messages aléatoires
   3. Leur attribue une heure aléatoire
   4. Les trie par heure décroissante
   5. Génère le HTML et l'injecte dans la page
----------------------------------------------------- */
function generateActivityFeed() {
    /* document.getElementById() récupère l'élément HTML
       qui a l'attribut id="activity-feed".
       C'est le conteneur vide qu'on va remplir. */
    const feedContainer = document.getElementById('activity-feed');
    
    /* Si l'élément n'existe pas (on n'est pas sur home.html),
       on arrête la fonction pour éviter une erreur. */
    if (!feedContainer) return;
    
    /* Nombre de messages à afficher dans le ticker.
       On peut changer ce nombre facilement. */
    const numberOfEntries = 6;
    
    /* Étape 1 : Piocher des messages aléatoires */
    const selectedEntries = getRandomEntries(activityDatabase, numberOfEntries);
    
    /* Étape 2 : Ajouter une heure aléatoire à chaque message.
       .map() crée un NOUVEAU tableau en transformant chaque élément.
       Le spread operator ...entry copie toutes les propriétés existantes,
       puis on ajoute la propriété 'time'. */
    const entriesWithTime = selectedEntries.map(entry => ({
        ...entry,
        time: generateRandomTime()
    }));
    
    /* Étape 3 : Trier par heure décroissante (plus récent en haut).
       .sort() compare deux éléments à la fois (a et b).
       localeCompare() compare les chaînes alphabétiquement.
       En inversant (b comparé à a), on obtient l'ordre décroissant.
       "14:32" > "08:07" donc "14:32" sera en premier. */
    entriesWithTime.sort((a, b) => b.time.localeCompare(a.time));
    
    /* Étape 4 : Générer le HTML pour chaque message.
       .map() transforme chaque objet en une chaîne HTML.
       Les backticks (``) permettent d'insérer des variables
       avec ${...} (template literals). */
    const htmlContent = entriesWithTime.map(entry => `
        <p class="ticker-line">
            <span class="ticker-time">${entry.time}</span>
            <span class="ticker-icon">${getTypeIcon(entry.type)}</span>
            — ${entry.text}
        </p>
    `).join('');
    /* .join('') fusionne toutes les chaînes HTML en une seule.
       Sans .join(), on aurait des virgules entre chaque élément. */
    
    /* Étape 5 : Injecter le HTML dans le conteneur.
       innerHTML remplace TOUT le contenu existant du div
       par notre HTML généré. */
    feedContainer.innerHTML = htmlContent;
}

/* -----------------------------------------------------
   LANCEMENT AU CHARGEMENT DE LA PAGE
   
   On appelle la fonction quand le DOM est prêt.
   Ainsi le ticker est généré automatiquement à
   chaque visite ou rechargement de la page.
----------------------------------------------------- */
generateActivityFeed();
/* ============================================
   LIGHTBOX — VISIONNEUSE D'IMAGE PLEIN ÉCRAN
   
   Fonctionnement :
   1. On sélectionne toutes les images dans .evidence-photo
   2. Au clic, on récupère le src et le alt de l'image
   3. On injecte ces valeurs dans la lightbox
   4. On ajoute la classe .active pour l'afficher
   5. Clic sur le fond ou la croix = fermeture
============================================ */

function initLightbox() {
    
    // Récupère les éléments de la lightbox dans le DOM
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    // Si la lightbox n'existe pas sur cette page, on arrête
    if (!lightbox) return;

    // Sélectionne TOUTES les images contenues dans un .evidence-photo
    // querySelectorAll retourne une NodeList qu'on parcourt avec forEach
    const evidencePhotos = document.querySelectorAll('.evidence-photo img');

    evidencePhotos.forEach(function(img) {
        
        // Pour chaque image, on écoute l'événement "click"
        img.addEventListener('click', function(e) {
            
            // e.stopPropagation() empêche le clic de "remonter"
            // vers le conteneur .lightbox (qui fermerait aussitôt)
            e.stopPropagation();

            // On copie la source de l'image cliquée dans la lightbox
            lightboxImg.src = this.src;

            // On utilise l'attribut alt comme légende
            // Si pas de alt, on affiche un texte par défaut
            lightboxCaption.textContent = this.alt || 'Preuve photographique';

            // On ajoute la classe .active → CSS passe de display:none à display:flex
            lightbox.classList.add('active');

            // On empêche le scroll du body quand la lightbox est ouverte
            // overflow:hidden désactive la molette sur la page derrière
            document.body.style.overflow = 'hidden';
        });
    });

    /* ---- FERMETURE DE LA LIGHTBOX ---- */

    // Fonction réutilisable pour fermer la lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');    // Cache la lightbox
        document.body.style.overflow = '';      // Réactive le scroll
        lightboxImg.src = '';                   // Vide l'image pour libérer la mémoire
    }

    // Clic sur le bouton ✕ → fermer
    lightboxClose.addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
    });

    // Clic sur le fond sombre (en dehors de l'image) → fermer
    lightbox.addEventListener('click', function(e) {
        // On vérifie que le clic n'est PAS sur l'image elle-même
        if (e.target !== lightboxImg) {
            closeLightbox();
        }
    });

    // Touche Échap (Escape) du clavier → fermer
    // L'événement "keydown" est écouté sur tout le document
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// ============================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// 
// DOMContentLoaded se déclenche quand le HTML
// est entièrement lu (sans attendre les images).
// On y appelle initLightbox() pour activer la
// visionneuse sur la page courante.
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initLightbox();
});
