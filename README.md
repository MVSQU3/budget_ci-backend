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

⚠️ `synchronize: true` (TypeORM) est pratique en dev mais à remplacer par des migrations en production. Change aussi `JWT_SECRET`.

## Côté mobile

Dans `budget-app/src/utils/api.js`, remplace `localhost` par l'IP locale de ton PC (ex. `http://192.168.1.10:3000`) pour tester depuis un téléphone physique sur le même Wi-Fi.
