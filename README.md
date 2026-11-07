# TradingView Replay – jour aléatoire à 9h25

Userscript Tampermonkey pour TradingView : un clic sur le bouton **🎲 9h25** (en bas à droite du graphique), ou **Alt+R**, lance le Bar Replay sur un jour de semaine tiré au hasard, calé sur la bougie de 9h25. La prochaine bougie que tu joues est l'open de 9h30.

## Installation (sur n'importe quel appareil)

1. Installe l'extension [Tampermonkey](https://www.tampermonkey.net/).
2. Chrome récent : `chrome://extensions` → Tampermonkey → **Détails** → active **Autoriser les scripts utilisateur**, mets **Accès au site** sur **Sur tous les sites**, puis redémarre Chrome.
3. Ouvre ce lien et clique sur **Installer** :
   **https://raw.githubusercontent.com/Evaan-cpui/tradingview-replay-0925/main/tradingview-replay-0925.user.js**
4. Recharge TradingView.

Tampermonkey récupère tout seul les nouvelles versions publiées ici.

## Réglages (en haut du script)

| Réglage | Par défaut | Rôle |
|---|---|---|
| `HEURE` | `'09:25'` | Heure saisie dans « Select date », dans le fuseau **de ton graphique** (New York = `09:25`, Paris = `15:25`). |
| `JOURS_HISTORIQUE` | `850` | Nombre de jours en arrière dans lesquels le jour est tiré. Au-delà de ton historique Replay (~2,5 ans en 5 min), TradingView ignore la date. |
| `RACCOURCI` | Alt+R | Raccourci clavier. |

## Comment ça marche

Le script active le Replay si besoin, ouvre « Select starting point → Date… », remplit une date aléatoire et l'heure, puis valide. S'il bloque à une étape (par exemple après une mise à jour de l'interface TradingView), un message bleu indique laquelle.
