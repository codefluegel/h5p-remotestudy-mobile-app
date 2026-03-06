// this copies a file EXTRA_CA_CERT to the local nodejs backend assets
const { copyFileSync } = require('node:fs');
const { join } = require('node:path');
const { EXTRA_CA_CERT } = process.env;

if (EXTRA_CA_CERT) {
  copyFileSync(EXTRA_CA_CERT, join(__dirname, 'assets', 'extra-ca.crt'));
}
