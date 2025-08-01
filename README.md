# Mvola-transaction-Test

Ce projet est une application Express pour tester l'API MVola en mode sandbox (pré-production).  
Il permet de générer un token OAuth et d'initier une transaction de paiement sandbox.

---

## Prérequis

- Node.js (>= 14)
- Un compte développeur MVola avec Consumer Key et Consumer Secret

---

## Configuration

1. Crée un fichier `.env` à la racine du projet avec les variables suivantes :

```env
MVOLA_CONSUMER_KEY=ta_consumer_key_ici
MVOLA_CONSUMER_SECRET=ton_consumer_secret_ici
MVOLA_TOKEN_URL=https://devapi.mvola.mg/token

---

## Installation des paquets

```bash
npm install


## Requetes à utiliser

```bash
curl http://localhost:3000/token
//{"access_token":".....","expires_in":3600}
curl-X POST http://localhost:3000/payer -H "Content-Type: application/json" -d '{}
//{"message":"Transaction sandbox initiée","data":{"status":"pending","serverCorrelationId":"...","notificationMethod":"polling"}
