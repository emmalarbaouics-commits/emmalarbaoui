# Landing page — Guide financier gratuit

Page d'Emma Larbaoui pour le téléchargement du guide gratuit et la prise de rendez-vous.

## Structure
```
index.html                       # page (landing)
assets/
  Guide-Emma-Larbaoui.pdf        # le guide téléchargeable (modifiable / remplaçable)
  emma-hero.jpg / .webp          # photo section héro
  emma-apropos.jpg / .webp       # photo section à propos
  emma-closing.jpg               # photo section finale (modifiable / remplaçable)
```

## Boutons de téléchargement
Les boutons « Télécharger le guide gratuitement » et « Je veux savoir où mon argent fuit »
pointent vers `assets/Guide-Emma-Larbaoui.pdf`. Pour mettre à jour le guide, il suffit de
remplacer ce fichier PDF dans le dossier `assets/` (même nom).

## Réservation de consultation (Calendly)
Ouvrir `index.html`, repérer en haut du `<script>` la ligne :

    const CALENDLY_URL = "";

Coller votre lien entre les guillemets, par exemple :

    const CALENDLY_URL = "https://calendly.com/emma-larbaoui/consultation";

Les 3 boutons « Réserver ma consultation » ouvriront alors directement votre calendrier.
Tant que la variable est vide, ils affichent une fenêtre d'aide.

## Images
Pour changer une photo, remplacez le fichier correspondant dans `assets/` (gardez le même nom).
