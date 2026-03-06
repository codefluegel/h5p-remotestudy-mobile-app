
# H5P Remote Study React Native App

A mobile app for interactive H5P educational content, built with React Native and Expo. It bundles a local NodeJS server to serve H5P content directly on the device.

## Features
- File-based routing with Expo Router
- Local NodeJS server for H5P content
- Student and teacher roles
- Course management and statistics
- Offline support
- Modern UI with RNEUI and custom components

## Prerequisites
- Node.js >= 18
- npm >= 9
- Expo CLI (`npm install -g expo-cli`)

## Installation
```bash
npm install
```

## Environment Setup
- Copy `.env.sample` to `.env` and fill in required values
- For the local NodeJS server, copy `nodejs-assets/nodejs-project/.env.sample` to `.env` in that directory

## Running the App
```bash
npm start
```

## Testing & Linting
```bash
npm run lint
npm test
```

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License
MIT License. See [LICENSE](LICENSE).

## Code of Conduct
See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Badges
![MIT License](https://img.shields.io/badge/license-MIT-green)

---

For more details, see the documentation in the repo and the Expo/React Native docs.
