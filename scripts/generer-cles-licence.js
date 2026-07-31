/**
 * Génère la paire de clés Ed25519 qui signe les jetons de licence.
 *
 *   node scripts/generer-cles-licence.js
 *
 * - La clé PRIVÉE va dans le .env du serveur (LICENCE_CLE_PRIVEE). Elle ne doit
 *   jamais être versionnée ni quitter le serveur.
 * - La clé PUBLIQUE va dans l'app (src/utils/licence.js). Elle peut être publique
 *   sans risque : elle permet de vérifier une signature, pas d'en produire.
 *
 * ⚠ Changer de paire invalide tous les jetons déjà émis : les clients devront
 *   se reconnecter une fois pour en obtenir un nouveau.
 */
const nacl = require('tweetnacl');

const paire = nacl.sign.keyPair();

console.log('\n=== Clé PRIVÉE — .env du serveur, à garder secrète ===\n');
console.log(`LICENCE_CLE_PRIVEE=${Buffer.from(paire.secretKey).toString('base64')}`);
console.log('\n=== Clé PUBLIQUE — à coller dans app/src/utils/licence.js ===\n');
console.log(`${Buffer.from(paire.publicKey).toString('base64')}`);
console.log('');
