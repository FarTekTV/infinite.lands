# Terres Infinies

Jeu 2D de plateforme et de combat dans un monde infini généré. Tu incarnes un combattant animé façon jeu d'arcade, tu explores à gauche et à droite sans jamais atteindre le bout, tu mines et tu poses des blocs, tu fais monter tes stats, tu acceptes des quêtes et tu affrontes des boss.

Le jeu est en HTML, CSS et JavaScript pur. Aucune dépendance, aucune étape de compilation, aucune image : tout le décor et les personnages sont dessinés par le code.

## Commandes

| Action | Clavier | Tactile |
| --- | --- | --- |
| Se déplacer | Z Q S D ou flèches | boutons ← → |
| Sauter | Z, flèche haut ou Espace | Saut |
| Se garder | S ou flèche bas | Garde |
| Poing | J | Poing |
| Coup de pied | K | Pied |
| Boule de feu (20 énergie) | L | Feu |
| Esquive | Maj | Esq. |
| Parler à un villageois | E | Parler |
| Boutique près d'un villageois | B | Boutique |
| Héros, stats et quêtes | I | |
| Aide | H | |
| Choisir un bloc | 1 à 6 | |
| Fabriquer des planches | C | |
| Miner | clic gauche maintenu | mode Miner |
| Poser un bloc | clic droit | mode Poser |
| Plein écran | F | |
| Pause et sauvegarde | Échap | |

## Fonctionnalités

- Monde infini généré à la volée, avec quatre biomes : plaines, forêt, toundra et désert.
- Cycle jour et nuit, grottes, minerai d'or, arbres, décor propre à chaque biome et météo ambiante.
- Combat : poing, coup de pied, boule de feu, garde, esquive, combos et coups critiques.
- Quatre statistiques à répartir : force, agilité, vitalité et énergie. Chaque niveau donne 3 points.
- Villages avec des villageois : quêtes (éliminer, miner, rejoindre une borne, ramasser de l'or, vaincre un boss), point de retour et boutique.
- Un boss tous les 75 mètres de chaque côté du départ, avec quatre types d'attaques différents et une seconde phase.
- Boutique : potion de soin, téléportation au dernier repos, équipement à cinq niveaux, points de compétence, blocs et vente du sac.
- Minage et construction de blocs.
- Menu de démarrage, trois emplacements de sauvegarde et options (son, volume, tremblements, nombres de dégâts).
- Plein écran avec rendu adapté à la résolution de l'écran, commandes tactiles pour mobile.

## Difficultés

La difficulté se choisit à la création de la partie.

| Difficulté | Ennemis | Or et xp | Mort |
| --- | --- | --- | --- |
| Facile | plus faibles | en bonus | perte de 25 % de l'or |
| Normal | de base | de base | perte de 50 % de l'or |
| Difficile | nombreux et costauds, soins rares | un peu réduits | perte de 75 % de l'or |
| Hardcore | encore plus durs | or réduit, xp en bonus | la sauvegarde est effacée |

## Sauvegardes

Tout est enregistré dans le `localStorage` du navigateur, sous les clés suivantes :

- `terres-infinies-slot-1`, `terres-infinies-slot-2`, `terres-infinies-slot-3` : les trois parties
- `terres-infinies-settings` : les options
- `terres-infinies-last` : le dernier emplacement joué

La partie est sauvegardée automatiquement, à la pause et à la fermeture de la page. Vider les données du site efface les sauvegardes.

## Structure du projet

```
terres-infinies/
├── index.html
├── README.md
├── LICENSE
├── .gitignore
├── .github/
│   └── workflows/
│       └── pages.yml
├── assets/
│   └── favicon.svg
├── css/
│   └── style.css
└── js/
    ├── core.js
    ├── world.js
    ├── tiles.js
    ├── audio.js
    ├── player.js
    ├── fighters.js
    ├── enemies.js
    ├── bosses.js
    ├── npc.js
    ├── projectiles.js
    ├── mining.js
    ├── save.js
    ├── game.js
    ├── render-world.js
    ├── scenery.js
    ├── hud.js
    ├── ui.js
    ├── input.js
    ├── settings.js
    ├── fullscreen.js
    ├── menu.js
    ├── session.js
    ├── shop.js
    └── loop.js
```

Les scripts sont chargés dans cet ordre par `index.html`. Ils partagent la même portée globale, donc l'ordre compte.

| Fichier | Rôle |
| --- | --- |
| `core.js` | Constantes, bruit pseudo-aléatoire, état global, difficultés, particules et messages |
| `world.js` | Génération du terrain par colonnes, biomes, arbres, grottes et collisions |
| `tiles.js` | Textures des blocs dessinées par le code, dureté et butin |
| `audio.js` | Bruitages synthétisés |
| `player.js` | Héros : statistiques, déplacements, attaques, dégâts, mort et réapparition |
| `fighters.js` | Squelette animé et dessin des combattants |
| `enemies.js` | Ennemis, apparition, mort, butin et dégâts infligés |
| `bosses.js` | Boss et leurs attaques |
| `npc.js` | Villageois et quêtes |
| `projectiles.js` | Boules de feu, flèches, ondes de choc, pièces et cœurs |
| `mining.js` | Minage, pose de blocs et fabrication |
| `save.js` | Sauvegarde, chargement et nouvelle partie par emplacement |
| `game.js` | Mise à jour du jeu à chaque image |
| `render-world.js` | Ciel, montagnes, terrain, entités et éclairage |
| `scenery.js` | Arbres lointains, décor du sol, villages et météo ambiante |
| `hud.js` | Interface dessinée sur le jeu |
| `ui.js` | Panneaux Héros, aide et gestion de la pause |
| `input.js` | Clavier, souris et commandes tactiles |
| `settings.js` | Options et migration d'anciennes sauvegardes |
| `fullscreen.js` | Plein écran |
| `menu.js` | Menu de démarrage, emplacements, difficultés et options |
| `session.js` | Lancer, quitter et terminer une partie, fond animé du menu |
| `shop.js` | Boutique |
| `loop.js` | Rendu, boucle principale et démarrage |

## Idées pour la suite

- De nouveaux biomes, ennemis et boss
- Un inventaire plus riche et de la fabrication
- Des capacités spéciales à débloquer
- Un mode coopération local

## Licence

Ce projet est publié sous licence MIT. Voir le fichier `LICENSE`.
