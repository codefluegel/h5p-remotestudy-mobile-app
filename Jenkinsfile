library('cf-jenkins-library-rn')

expo.runPipeline([
    bundlePath: 'h5p-remote-study',
    // dev deps not wanted in bundled apk/ipa
    preProjectGenerationCommand: '''
        npm --prefix nodejs-assets/nodejs-project run copy-additional-ca-file || echo "crt file not copied"
        npm --prefix nodejs-assets/nodejs-project run install-without-dev-deps''',
    bundleStepSecretEnv: [
        file(credentialsId: 'cf-local-ca-certificate', variable: 'EXTRA_CA_CERT'),
    ],
    bundleStepEnv: [
        'EXPO_PUBLIC_API_BASE_URL=https://europe-west1-h5p-remote-study-dev.cloudfunctions.net/api',
    ],
    android : [
        keystoreAlias: 'h5p',
        keystorePasswordId: 'android-keystore-password',
        keystoreKeyId: 'android-h5p-key-password',
    ],
    ios: [:],
    checkWebBuild: true,
])
