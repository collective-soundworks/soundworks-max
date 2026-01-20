# soundworks | max

Utility to monitor and control soundworks' shared states within [Max](https://cycling74.com/products/max-features).

## No-build version
With Max v9, Cycling added "import" support in Node4Max.  
This means we didn't need anymore to build soundworks-max utility and we can directly run soundworks client in Max.  
What we still need to do in to document well all functionalities and support between Max (& Ableton Live) and Soundworks.   

1. All previous features as to be documented (see below)
2. Create max soundworks clients + max patch on this branch for documented features  
3. List all "bugs" and weird behaviors
4. Create soundworks tutorial with a Max (& Ableton Live) use case  


## Arborescence idéale entre max et soundworks

```
project
  /*.maxpat
  max.js
  /max/*.maxpat (ou)
  /soundworks
    /src
    /config
    /etc.
```

## Problèmes & Possibles solutions

### Bugs du `loadConfig`

1. `const config = `, c'est très sale
2. Mettre le dossier soundworks dans le path
Mais, le `process.cwd()` est au niveau du fichier js dans ce cas
do on peut `process.changeDir` mais le boootstrap lance 2 fois le fichier du coup c'est incohérent
3. Mattre le maxpat à la racine du projet soundworks, et faire un lien symbolique entre le src/client/bla.js et ./bla.js

Et donc les trois sont nulles et ne fonctionnent dans notre arborescence idéale

### Bugs du `bootstrap`

1. Il sert pour le `npm run dev` pour relancer le client automatiquement tout ça, mais dans max il y a une case watch dans le `node.script`
2. Il sert aussi à `EMULATE=10`

Tout ça ne sert à rien dans Max

En plus le bootstrap, pour une raison inexpliqué nous empêche de faire des `addHandler`

Donc: le bootstrap nous fait chier, autant l'enlever

### Module JS
From Max documentation : If you're loading a JavaScript module (.mjs file) you can use top-level await, and loadend will work as expected.  
All examples below will use mjs file format.
(à priori ça marche en .js)

### Solution

Faire un `npx soundworks --create-client` avec un `target=node` && `template=max` + plus on peut générer le patch correspondant.

### deux niveaux d'abstraction
1. Juste un client soundworks qui tourne dans un node.script -> cf. `Problèmes & Possibles solutions`
2. Partager les représentations de données côté Max -> `nodeSanitizeInput`

### Arborescence
On fait vivre les patchs max client soundworks à côté des patchs max, dans le projet du concert.

### Niveau 1
Tutoriel : Setting up Max client environment.
Juste un client soundworks qui tourne dans un node.script  
Envoyer un bang à node, et faire un console.log dans le server.
Récupérer l'info que le client est connecté dans Max.

### Changer l'IP et le port ?

npx soundworks --create-client

target=node
template=max
dirname of the patch
create `${client}.js` with `const config = loadConfig('../../my-app/config/env-default.yaml');` and `${client}.maxpat`


## Documented features (for later)
- Connection status with server (niveau 1)
- Change ip and port (niveau 1)
- Attach and detach to a state, ask for parameter definition (niveau 2)
- Send message in key-value format (niveau 2)
- Send message in dict format (niveau 2)
- Ask for current values (niveau 2)
- Get updates and values as message (niveau 2)
- Get updates and values as dict (niveau 2)
- Get and set "event" type as bang (niveau 2)
- Work with collections (niveau 2)


