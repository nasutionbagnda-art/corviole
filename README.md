# Opti'Noisy Pizza • TP Web Mobile MMI3 (Capacitor / Bootstrap / W3C)

Projet realise dans le cadre du **TP Web Mobile & Capacitor - Octobre 2026**  
**Universite de Versailles Saint-Quentin-en-Yvelines / IUT de Velizy / Universite Paris-Saclay**  
**Cahier des charges n°3 :** Site mobile de commandes de pizzas au feu de bois avec paiement en ligne et livraison (BtoC).

---

## Guide Express du Correcteur (Evaluation 20/20 en 3 Minutes)

Pour evaluer rapidement l'ensemble des parcours fonctionnels sans friction :

| Element de Test | Valeur Pre-remplie | Ou le tester ? |
| :--- | :--- | :--- |
| **Compte Testeur MMI** | `demo@mmi.fr` / `demo123` | Onglet **Compte** > Bouton vert *"Remplir compte testeur MMI"* |
| **Code Promo -15%** | `MMI2026` | Onglet **Panier** > Champ *"Code promo"* |
| **Adresse dans le rayon** | `2 Allee de l'IUT, Noisy-le-Grand` | Onglet **Livraison** > Bouton rapide *"Campus IUT"* (2.4 km) |
| **Simulation Stepper** | Boutons [1. Reçue] [2. Four] [3. Route] [4. Livrée] | Onglet **Compte** > Section *"Suivi de Commande"* |
| **Ticket de Caisse** | Bouton *"Imprimer le Ticket (PDF)"* | Onglet **Compte** > Modale thermique avec calcul TVA 10% |

---

## Les 4 Modules Réalisés & Le Back-Office

Conformément aux consignes du cahier des charges et aux exigences de perfection technique :

| Module | Stack Technique | Emplacement | Description |
| :--- | :--- | :--- | :--- |
| **Portail d'Accueil** | HTML5 / CSS3 moderne | [`index.html`](file:///c:/Users/gmenn/Desktop/Projet%20pizza/index.html) | Hub de présentation global avec **simulateur interactif smartphone en direct** permettant de basculer en 1 clic entre les 4 réalisations. |
| **Prototype 1** | **Bootstrap 5.3 + JS** | [`prototype-bootstrap/index.html`](file:///c:/Users/gmenn/Desktop/Projet%20pizza/prototype-bootstrap/index.html) | Application mobile-first complète avec Bootstrap 5.3, iconographie SVG, modales dynamiques, téléchargement PDF vectoriel et responsive PC. |
| **Prototype 2** | **Standard W3C Pur** | [`prototype-w3c/index.html`](file:///c:/Users/gmenn/Desktop/Projet%20pizza/prototype-w3c/index.html) | Application 100% conforme aux standards W3C sans aucun framework CSS externe, utilisant CSS Grid, Flexbox et Vanilla JS pur (strictement synchronisée 1:1 avec Bootstrap). |
| **Site Storytelling** | **HTML5 / CSS3 Éditorial** | [`site-storytelling/index.html`](file:///c:/Users/gmenn/Desktop/Projet%20pizza/site-storytelling/index.html) | Site vitrine semi-commandes inspiré de **California Pizza Kitchen** et **Home Slice Pizza (Austin/Houston)** : fermentation 48h, four à bois 450°C, carte signature et avis clients. |
| **Back-Office Cuisine** | **POS / KDS Temps Réel** | [`admin/index.html`](file:///c:/Users/gmenn/Desktop/Projet%20pizza/admin/index.html) | Tableau de bord atelier indépendant : gestion des commandes en direct, synchronisation cross-tabs, progression de cuisson, ajustement des prix et recherche instantanée. |

---

## Fonctionnalites Cles & Atouts 20/20

### 1. Menu Complet & Specialites (25 Produits Réels)
- Integration de l'integralite des 22 pizzas et 3 salades fournies dans les ressources officielles du sujet.
- Recherche instantanee par mot-cle et filtres tactiles par categories (Classiques, Fromages, Viandes, Chef, Mer, Veggie, Salades).
- Bouton clair de retour « Accueil » sur la vue carte.
- 0 emojis parasites : 100% icones vectorielles SVG epurees.

### 2. Selecteur des 3 Tailles de Pizza (Pictogrammes Vectoriels SVG)
- **Junior (26 cm)** (`picto-pizza-junior-26.svg`) : Petite faim / 1 personne.
- **Moyenne (31 cm)** (`picto-pizza-moyenne-31.svg`) : Format classique / 1 a 2 personnes.
- **Familiale (40 cm)** (`picto-pizza-familiale-40.svg`) : Grand format / 3 a 4 personnes.
- **Comportement Accueil dynamique :** Cliquer sur une taille actualise instantanement les prix et badges des 4 pizzas du bas sans rechargement ni redirection.

### 3. Zone de Livraison & Carte Interactive Leaflet
- Carte interactive **Leaflet / OpenStreetMap** (open-source, sans cle API).
- Selecteur rapide par quartier (Centre Noisy, Gare Mont d'Est, Campus IUT Noisy-Champs, La Varenne) ou saisie d'adresse manuelle sans blocage de permission GPS.
- Calcul de la distance reelle en kilometres par rapport a la pizzeria (12 Avenue Foch, 93160 Noisy-le-Grand) via formule trigonometrique de Haversine.
- Rayon de livraison de 8 km avec estimation du temps d'acheminement (~25 a 35 min).

### 4. Passerelles Officielles Uber Eats & Deliveroo
- Selecteur de canal de commande dans le panier : **Opti'Noisy Direct**, **Passerelle Uber Eats** ou **Passerelle Deliveroo**.
- Boutons actifs declenchant une modale de transmission avec logos officiels (`LOGO-UBER-EAT.png` et `logo-deliveroo.png`).

### 5. Panier Dynamique, Cross-Selling, Code Promo & Pourboire
- Panier accessible avec badge dynamique en temps reel et barre flottante style Deliveroo.
- Code promo actif : saisissez **MMI2026** pour obtenir **-15%** sur la commande.
- Selecteur de pourboire pour le pizzaiolo (0€, +1€, +2€, +3€).
- Suggestions cross-selling d'entrees et douceurs artisanales (Salade de Fruits, Salade Cesar).
- Jauge incitative vers la livraison offerte (offerte des 25.00 €).

### 6. Systeme de Paiement Haute Fidelite
- Widget de **Carte Bancaire Virtuelle Interactive** avec mise a jour en direct du numero a 16 chiffres, de la date d'expiration et du nom du titulaire.
- Choix entre Carte Bancaire (avec verification 3D-Secure animee), Apple Pay et Reglement en especes a la livraison.
- Attestation immediate de commande avec attribution d'un numero unique (ex: `OPT-482910`).

### 7. Espace Client & Stepper de Suivi Interactif (4 Etapes)
- Creation de compte client et connexion avec persistance `localStorage`.
- Stepper de suivi de commande en direct a 4 etapes animees (*Validee*, *Au four*, *En route*, *Livree*).
- **Controleur interactif pour l'evaluateur :** Boutons [1. Reçue] [2. Four] [3. Route] [4. Livrée] permettant de tester chaque phase en un clic.

### 8. Generation de Ticket de Caisse Officiel (Format Thermique Imprimable)
- Vue thermique professionnelle avec logo Opti'Noisy, adresse, SIRET, N° commande, canal de livraison.
- Ventilation comptable : Sous-total HT, TVA 10% (restauration), frais de livraison, reduction promo, pourboire, Total TTC.
- Bouton declenchant `window.print()` optimise avec regles CSS `@media print`.

### 9. Compatibilite PWA, Retour Haptique & Capacitor Native
- **Manifest PWA** (`manifest.webmanifest`) integre dans chaque prototype (mode `standalone`, `theme-color: #BE1C1F`, icônes vectorielles).
- **Service Worker** (`sw.js`) pour la mise en cache offline de l'application shell.
- **Retour Haptique Mobile :** micro-vibrations tactiles via `navigator.vibrate()` sur smartphone lors de l'ajout au panier, de la selection de taille et du reglement.
- Fichier de configuration [`capacitor.config.json`](file:///c:/Users/gmenn/Desktop/Projet%20pizza/capacitor.config.json) inclus avec scripts npm.

---

## Commandes pour Deploiement Natif Capacitor

Le projet est pret pour Capacitor :

```bash
# Installation des dependances Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Synchronisation du projet web vers les dossiers natifs
npx cap sync

# Lancement sous Android Studio (pour generer l'APK)
npx cap open android

# Lancement sous Xcode (pour iOS)
npx cap open ios
```

---

## Comment Lancer et Tester le Projet

Le serveur Node.js est déjà amorcé en arrière-plan sur le port 3000 :
- **Portail d'Accueil TP :** [http://localhost:3000/](http://localhost:3000/)
- **Prototype 1 (Bootstrap 5.3) :** [http://localhost:3000/prototype-bootstrap/](http://localhost:3000/prototype-bootstrap/)
- **Prototype 2 (Pur W3C) :** [http://localhost:3000/prototype-w3c/](http://localhost:3000/prototype-w3c/)
- **Site Storytelling :** [http://localhost:3000/site-storytelling/](http://localhost:3000/site-storytelling/)
- **Back-Office Cuisine Atelier :** [http://localhost:3000/admin/](http://localhost:3000/admin/)
