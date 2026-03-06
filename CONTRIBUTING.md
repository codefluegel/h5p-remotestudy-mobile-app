# Contributing to H5P Remote Study React Native App

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Getting Started

1. **Fork the repository** and clone it locally.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   - Copy `.env.sample` to `.env` and fill in required values.
   - For the local NodeJS server, copy `nodejs-assets/nodejs-project/.env.sample` to `.env` in that directory.
4. **Start the app**:
   ```bash
   npm start
   ```

## Coding Standards

- Use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code style.
- Write clear, descriptive commit messages.
- Prefer functional components and hooks for React code.
- Avoid unnecessary `console.log` statements in production code.

## Pull Requests

- Create a new branch for each feature or bugfix.
- Ensure your code passes all tests and lints before submitting a PR:
  ```bash
  npm run lint
  npm test
  ```
- Add tests for new features when possible.
- Link related issues in your PR description.

## Reporting Issues

- Use GitHub Issues to report bugs or request features.
- Include steps to reproduce, expected behavior, and screenshots if possible.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
