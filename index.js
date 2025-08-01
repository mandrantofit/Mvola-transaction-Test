const express = require('express');
const axios = require('axios');
const qs = require('qs');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');  // Ajout de uuidv4

dotenv.config();
const app = express();
app.use(express.json()); // Important pour parser le JSON du body

let currentAccessToken = null; // Variable globale pour stocker le token

app.get('/token', async (req, res) => {
  try {
    const credentials = `${process.env.MVOLA_CONSUMER_KEY}:${process.env.MVOLA_CONSUMER_SECRET}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    const response = await axios.post(
      process.env.MVOLA_TOKEN_URL || 'https://devapi.mvola.mg/token',
      qs.stringify({
        grant_type: 'client_credentials',
        scope: 'EXT_INT_MVOLA_SCOPE',
      }),
      {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
      }
    );

    currentAccessToken = response.data.access_token;  // Stockage du token ici

    res.json({
      access_token: currentAccessToken,
      expires_in: response.data.expires_in,
    });
  } catch (error) {
    console.error('Erreur génération token:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});


app.post('/payer', async (req, res) => {
  if (!currentAccessToken) return res.status(401).json({ error: 'Token non disponible, appelle /token avant' });

  const {
    amount = '1000',
    description = 'Paiement test sandbox',
  } = req.body;

  const debitMsisdn = '0343500003';   // numéro client sandbox
  const creditMsisdn = '0343500004';  // numéro marchand sandbox

  const correlationId = uuidv4();
  const dateISO = new Date().toISOString();

  try {
    const response = await axios.post(
      'https://devapi.mvola.mg/mvola/mm/transactions/type/merchantpay/1.0.0/',
      {
        amount,
        currency: 'Ar',
        descriptionText: description,
        requestingOrganisationTransactionReference: `ref-${Date.now()}`,
        requestDate: dateISO,
        originalTransactionReference: '',
        debitParty: [
          { key: 'msisdn', value: debitMsisdn }
        ],
        creditParty: [
          { key: 'msisdn', value: creditMsisdn }
        ],
        metadata: [
          { key: 'partnerName', value: 'mandrantofit' },
          { key: 'fc', value: 'USD' },
          { key: 'amountFc', value: '1' }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${currentAccessToken}`,
          Version: '1.0',
          'X-CorrelationID': correlationId,
          UserLanguage: 'FR',
          UserAccountIdentifier: `msisdn;${creditMsisdn}`,
          partnerName: 'mandrantofit',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        }
      }
    );

    res.json({
      message: 'Transaction sandbox initiée',
      data: response.data,
    });

  } catch (error) {
    console.error('Erreur transaction sandbox:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
