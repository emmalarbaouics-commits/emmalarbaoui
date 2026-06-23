# Landing page — Diagnostic financier

Page d'Emma Larbaoui : simulateur de patrimoine interactif et prise de rendez-vous.

## Structure
```
index.html                  # la page
assets/
  emma-hero.jpg / .webp      # photo section héro
  emma-apropos.jpg / .webp   # photo section à propos
  emma-closing.jpg           # photo section finale (modifiable / remplaçable)
```
Pour changer une photo : remplacez le fichier dans `assets/` (même nom).

## Configuration rapide (voir le guide détaillé "Guide-Brevo-pas-a-pas")
En haut du `<script>` de `index.html` :

    const CALENDLY_URL     = "";   // votre lien Calendly
    const BREVO_FORM_ACTION = "";  // URL d'action du formulaire Brevo (https://sibforms.com/serve/...)

## Capture e-mail (Brevo) — l'essentiel
- Le visiteur ne saisit QUE son e-mail. Les chiffres de sa simulation sont attachés
  automatiquement et envoyés à Brevo (le visiteur ne voit jamais le formulaire Brevo).
- Côté Brevo : créez une liste, un attribut **texte** `SIMULATION`, un formulaire
  **double opt-in** (= e-mail de confirmation au visiteur), puis collez son URL d'action ci-dessus.
- Pour recevoir chaque lead à `contact@emmalarbaoui.ca` : automatisation Brevo
  « Un contact soumet un formulaire » → action « Notifier par e-mail », corps avec
  `{{params.contact.EMAIL}}` et `{{params.contact.SIMULATION}}`.
- Délivrabilité (inbox, pas spam) : authentifiez le domaine `emmalarbaoui.ca` dans Brevo
  (DKIM + DMARC) et envoyez depuis `@emmalarbaoui.ca`.

Tant que `BREVO_FORM_ACTION` est vide, le bouton « Envoyer » indique que la capture
n'est pas encore configurée (aucun faux message de succès).
