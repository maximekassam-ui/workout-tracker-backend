# 🏋️ Workout Tracker — Backend

Backend de l'application **Workout Tracker**, une application permettant de créer des programmes d'entraînement, de planifier des séances, d'enregistrer les performances réalisées et de suivre sa progression au fil du temps.

Le backend est développé avec **Strapi** et utilise **PostgreSQL** comme base de données.

---

## 🚀 Objectif du projet

Workout Tracker a pour objectif de permettre à un utilisateur de :

- créer et gérer ses programmes d'entraînement ;
- organiser ses programmes en plusieurs séances ;
- sélectionner des exercices depuis une bibliothèque ;
- définir les objectifs de chaque exercice ;
- enregistrer ses séances réellement effectuées ;
- enregistrer les séries, répétitions et charges réalisées ;
- modifier ponctuellement les objectifs pendant une séance ;
- suivre sa progression ;
- utiliser ses performances pour mettre en place une surcharge progressive.

---

## 🛠️ Technologies utilisées

- **Strapi** — CMS / API backend
- **Node.js** — environnement d'exécution
- **PostgreSQL** — base de données
- **REST API** — communication avec le frontend
- **Vue.js** — frontend prévu pour l'application

---

# 🧱 Architecture des données

Le backend est organisé autour de plusieurs niveaux.

```
User
│
├── Program
│   │
│   └── WorkoutTemplate
│       │
│       └── ProgramExercise
│           │
│           └── Exercise
│
└── Workout
    │
    └── WorkoutExercise
        │
        └── Set

```

---

Une bibliothèque indépendante permet également de gérer les muscles et les catégories des exercices.

```
Exercise
│
├── ExerciseMuscle
│   └── Muscle
│
└── Category
```

---

# 👤 User

Un utilisateur peut posséder plusieurs programmes et plusieurs séances réalisées.

### Relations

```
User
├── has many Programs
└── has many Workouts
```

---

# 📋 Program

Un Program représente le programme d'entraînement d'un utilisateur.

## Informations principales

- nom du programme ;
- description ;
- programme actif ou non ;
- date de début.

### Relations

```
User
   │
   └── has many
          ↓
       Program
          │
          └── has many WorkoutTemplates
```

La date de début permet notamment d'afficher depuis combien de temps l'utilisateur suit son programme actif.

# 🏋️ WorkoutTemplate

Un WorkoutTemplate représente une séance prévue dans un programme.

Exemple :

```
Programme : Upper / Lower

1. Upper A
2. Lower A
3. Upper B
4. Lower B
```

## Informations principales

- nom ;
- description ;
- catégorie ;
- ordre dans le programme.

### Relation

```
Program
   │
   └── has many
          ↓
   WorkoutTemplate
```

# 📝 ProgramExercise

ProgramExercise représente un exercice ajouté à une séance prévue.

Il permet de définir comment l'exercice doit être réalisé dans le programme.

## Informations principales

- ordre de l'exercice ;
- nombre de séries prévu ;
- nombre minimum de répétitions ;
- nombre maximum de répétitions ;
- charge prévue ;
- durée prévue ;
- distance prévue ;
- temps de repos ;
- notes.

### Relations

```
WorkoutTemplate
       │
       └── has many
              ↓
       ProgramExercise
              │
              └── belongs to one
                     ↓
                  Exercise
```

### Exemple

```
Upper A

Développé couché
4 séries
8-10 répétitions
80 kg
120 secondes de repos
```

---

# 💪 Exercise

Exercise représente un exercice de la bibliothèque générale.

Il ne contient pas les performances ou objectifs d'un utilisateur particulier.

La fiche de l'exercice contient notamment ses muscles ciblés et ses catégories.

---

# 🧬 ExerciseMuscle

ExerciseMuscle permet de définir la relation entre un exercice et un muscle.

Il permet également de préciser le rôle du muscle.

### Exemple

```
Développé couché

Pectoraux
→ PRIMARY

Triceps
→ SECONDARY

Deltoïde antérieur
→ SECONDARY
```

Cela permet de représenter plusieurs muscles pour un même exercice.

---

# 🏷️ Category

Les catégories permettent de déterminer dans quels types de séances un exercice peut être utilisé.

### Exemples :

```
UPPER
LOWER
PUSH
PULL
LEGS
FULL_BODY
```

Un exercice peut appartenir à plusieurs catégories.

---

# 🏃 Workout

Un Workout représente une séance réellement effectuée par l'utilisateur.

Il est volontairement différent de WorkoutTemplate.

## WorkoutTemplate

Séance prévue

## Workout

Séance réellement effectuée

## Informations principales

- heure de début ;
- heure de fin ;
- notes.

### Relations

```
User
 │
 └── has many
        ↓
      Workout
        │
        └── belongs to one WorkoutTemplate
```

Le champ completed_at permet de déterminer si la séance est terminée.

```
completed_at = NULL
→ séance en cours

completed_at = date
→ séance terminée
```

---

# 📊 WorkoutExercise

WorkoutExercise représente un exercice réellement effectué pendant une séance.

Il permet de conserver la différence entre :

- ce qui était prévu ;
- ce que l'utilisateur a décidé de faire ;
- ce qui a réellement été réalisé.

### Informations principales

- ordre ;
- état d'exécution ;
- indication d'une modification ;
- valeurs modifiées ;
- notes.

### États possibles

- PENDING
- COMPLETED
- SKIPPED

### Override

Les champs override\_\* permettent de modifier temporairement les objectifs prévus pour une séance.

Par exemple :

```
ProgramExercise

4 × 8-10 @ 80 kg
```

L'utilisateur décide pendant sa séance de faire :

```
4 × 8-10 @ 82.5 kg
```

Le programme reste à :

```
80 kg
```

et le WorkoutExercise contient :

```
was_modified = true
override_load = 82.5
```

Les valeurs override\_\* représentent donc une modification appliquée à cette séance uniquement.

### Champs

- override_sets
- override_reps_min
- override_reps_max
- override_load
- override_duration
- override_distance

---

# 🔢 Set

Set représente une série réellement effectuée.

### Informations principales

- numéro de série ;
- répétitions ;
- charge ;
- durée ;
- distance ;
- série terminée ou non.

### Exemple

```
Développé couché

Set 1 → 80 kg × 10
Set 2 → 82.5 kg × 9
Set 3 → 82.5 kg × 8
Set 4 → 82.5 kg × 8
```

### Relation

```
WorkoutExercise
       │
       └── has many
              ↓
             Set
```

---

# 🔄 Différence entre prévu et réalisé

L'une des particularités importantes du projet est de ne pas modifier directement les objectifs du programme lorsqu'une séance est réalisée.

```
ProgramExercise
↓
Objectif prévu
↓
WorkoutExercise
↓
Modification éventuelle
↓
Set
↓
Performance réelle
```

### Exemple

### Prévu

```
4 × 8-10 @ 80 kg
```

### Modification pendant la séance

```
82.5 kg
```

### Réalisé

```
82.5 × 10
82.5 × 10
82.5 × 9
82.5 × 8
```

Cette séparation permet de conserver un historique fiable des performances.

---

# 📈 Surcharge progressive

Le système prévoit une fonctionnalité de surcharge progressive.

Après une séance, l'application pourra analyser les performances réalisées et proposer une évolution des objectifs.

### Exemple

```
Objectif

4 × 8-10 @ 80 kg

Performance

10
10
10
10
```

L'application pourra proposer :

```
Passer à 82.5 kg pour la prochaine séance ?
```

L'utilisateur garde toujours le contrôle de cette modification.

Si l'utilisateur accepte :

```
ProgramExercise

80 kg
↓
82.5 kg
```

Si l'utilisateur refuse :

```
ProgramExercise

80 kg
```

---

# 🧪 État actuel du projet

Le modèle de données principal a été créé et testé dans Strapi.

## Fonctionnalités déjà modélisées

- Bibliothèque d'exercices ✔
- Gestion des muscles ✔
- Catégorisation des exercices ✔
- Création de programmes ✔
- Création de séances prévues ✔
- Ajout d'exercices aux séances ✔
- Définition des séries / répétitions / charges prévues ✔
- Création de séances réellement effectuées ✔
- Enregistrement des exercices réalisés ✔
- Enregistrement des séries réalisées ✔
- Modification temporaire des objectifs pendant une séance ✔
- Test complet du parcours prévu → réalisé ✔
- Logique métier de démarrage d'une séance
- Logique métier de validation d'une série
- Logique de fin de séance
- Logique de surcharge progressive
- API finale
- Frontend Vue.js

---

# 🗺️ Prochaines étapes

Le développement va maintenant suivre plusieurs grandes étapes.

## 1. Fonctionnement d'une séance

Définir précisément :

- démarrage d'une séance ;
- création du Workout ;
- création des WorkoutExercise ;
- validation des exercices ;
- modification des exercices ;
- validation des séries ;
- fin de séance.

## 2. Surcharge progressive

Définir les règles permettant de proposer une progression à partir des performances réalisées.

## 3. API

Définir les endpoints et les règles d'accès aux données.

## 4. Frontend

Développer l'application Vue.js :

- tableau de bord ;
- programmes ;
- séances ;
- bibliothèque d'exercices ;
- séance en cours ;
- historique ;
- progression.

---

# 🎯 Objectif final

Workout Tracker doit permettre à l'utilisateur de passer simplement de :

```
Créer un programme
↓
Créer ses séances
↓
Choisir ses exercices
↓
Définir ses objectifs
↓
Faire sa séance
↓
Enregistrer ses performances
↓
Analyser sa progression
↓
Adapter son programme
```
