# Budget FCFA — Backend (NestJS)

API d'authentification par téléphone avec code SMS (OTP), JWT, PostgreSQL + TypeORM.

## Endpoints

| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/register` | Inscription `{ nomUtilisateur, telephone, motDePasse }` → envoie un OTP |
| POST | `/auth/otp/verify` | Vérifie le code `{ telephone, code }` → retourne le JWT |
| POST | `/auth/otp/resend` | Renvoie un code `{ telephone }` |
| POST | `/auth/login` | Connexion `{ telephone, motDePasse }` → JWT (ou OTP si numéro non vérifié) |
| GET | `/auth/me` | Profil (header `Authorization: Bearer <token>`) |
| POST | `/sync` | Synchronisation `{ transactions, budgets }` → état fusionné (JWT requis) |

Téléphone au format international : `+2250701020304`.

## Synchronisation

Offline-first : le client garde ses données en local et pousse ses modifications quand le réseau est disponible. Fusion « dernière modification gagne » via le champ `majLe` (timestamp). Les suppressions sont des tombstones (`supprime: true`) pour se propager entre appareils. La réponse de `/sync` contient l'état complet de l'utilisateur, que le client adopte.

## Démarrer

1. PostgreSQL doit tourner en local, avec une base `budget_fcfa` :
   ```sql
   CREATE DATABASE budget_fcfa;
   ```
2. Configuration :
   ```
   copy .env.example .env
   ```
   puis adapte les identifiants Postgres dans `.env`.
3. Lancement :
   ```
   npm install
   npm run start:dev
   ```

## SMS en développement

`SMS_PROVIDER=console` : le code OTP s'affiche dans les logs du serveur, ex. :

```
[SMS -> +2250701020304] Budget FCFA : votre code de vérification est 4821...
```

Pour la production, ajoute un cas `orange` ou `termii` dans `src/sms/sms.service.ts`.

## Sécurité incluse

Mots de passe et codes OTP hachés (bcrypt), OTP valable 5 minutes avec 5 tentatives max, validation des entrées (class-validator), JWT expirant après 7 jours.

⚠️ Avant la production : change `JWT_SECRET`, génère une vraie paire de clés de licence
(`node scripts/generer-cles-licence.js`) et configure un vrai fournisseur SMS.

## Migrations de base de données

`synchronize` est désactivé. Le schéma ne change que par migration relue et versionnée —
sans quoi une simple modification d'entité peut se traduire par un `DROP COLUMN` suivi
d'un `ADD COLUMN`, et les données de la colonne disparaissent.

Les migrations sont appliquées **automatiquement au démarrage** (`migrationsRun: true`) :
déployer le code suffit à mettre le schéma à niveau.

Après avoir modifié une entité :

```bash
npm run migration:generate -- src/migrations/NomExplicite
```

**Relis toujours le SQL généré** avant de le committer : TypeORM traduit un renommage de
colonne par une suppression suivie d'une création. Si c'est le cas, remplace-le à la main
par un `ALTER TABLE … RENAME COLUMN …`.

Puis déclare la migration dans le tableau `migrations` de `src/app.module.ts`. Elles y sont
listées explicitement, et non par glob : après compilation, un glob sur `dist` ne trouve
rien et l'application démarrerait en croyant le schéma à jour.

Autres commandes :

```bash
npm run migration:show      # état des migrations
npm run migration:run       # appliquer manuellement
npm run migration:revert    # annuler la dernière
```

### Base existante

Une base déjà créée par l'ancien `synchronize` doit être marquée comme à jour, sinon la
migration initiale tenterait de recréer des tables existantes :

```sql
CREATE TABLE IF NOT EXISTS "migrations" (
  "id" SERIAL PRIMARY KEY, "timestamp" bigint NOT NULL, "name" varchar NOT NULL);
INSERT INTO migrations("timestamp","name")
VALUES (1785841870130,'SchemaInitial1785841870130');
```

## Côté mobile

Dans `budget-app/src/utils/api.js`, remplace `localhost` par l'IP locale de ton PC (ex. `http://192.168.1.10:3000`) pour tester depuis un téléphone physique sur le même Wi-Fi.
