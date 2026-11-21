# Swagger Autofill

Extension Chrome légère (Manifest V3) qui remplit les champs visibles de Swagger UI.

## Installation dans Chrome

1. Ouvrir `chrome://extensions`.
2. Activer **Mode développeur**.
3. Choisir **Charger l'extension non empaquetée**.
4. Sélectionner le dossier `swagger-autofill`.
5. Dans Swagger UI, ouvrir **Try it out**, puis cliquer sur l'extension et **Remplir les champs**.

Les champs HTML `number`, `date`, `email`, `url` et `password` reçoivent une valeur adaptée. Pour les paramètres Swagger, le script lit aussi les informations de type rendues près du champ. Les textarea de corps JSON sont parsés puis remplis en conservant les types déjà présents dans l'exemple (nombres, booléens, tableaux et objets).

## Limite actuelle

Si Swagger UI ne fournit aucun exemple JSON dans la textarea, l'extension utilise `{}`. Swagger UI n'expose pas toujours le schéma complet du corps dans le DOM; dans ce cas, aucun champ ne peut être inventé de manière fiable à partir de la seule textarea. Les valeurs sont des exemples génériques à vérifier avant l'envoi de la requête.
