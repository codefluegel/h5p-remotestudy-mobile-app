import React, {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { XAPIStatement } from '../utils/types';

export type H5PContentWebviewForwardRef = { triggerXapiDataFetch: () => void };

const injectedJS = `
  // Set up listener for xAPI events
  /*if (window.H5P) {
    window.H5P.externalDispatcher.on('xAPI', function (event) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'xAPI',
          data: event.data.statement,
        }),
      );
    });
  } else {
    document.addEventListener('h5pready', function () {
      if (window.H5P && window.H5P.externalDispatcher) {
        window.H5P.externalDispatcher.on('xAPI', function (event) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'xAPI',
              data: event.data.statement,
            }),
          );
        });
      }
    });
  }*/

  try {
    // Set viewport meta for mobile
    let viewport = document.querySelector('meta[name=viewport]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content =
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

    // Add h5p-mobile class to html and body
    document.documentElement.classList.add('h5p-mobile');
    document.body.classList.add('h5p-mobile');

    // Set body to use full viewport for mobile
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';

    // Fix for Android audio controls not showing
    const style = document.createElement('style');
    style.textContent = \`
      audio {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 54px !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    \`;
    document.head.appendChild(style);

    if (window.H5P && window.H5P.instances && window.H5P.instances.length > 0) {
      const instance = window.H5P.instances[0];
      if (instance && typeof instance.trigger === 'function') {
        instance.trigger('resize');
      }
    }
  } catch (err) {}

  // Listen for messages from React Native
  document.addEventListener('message', function (event) {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'customEvent') {
        // Try to call getXAPIData on the main H5P instance
        let xapiData = null;
        try {
          if (
            window.H5P &&
            window.H5P.instances &&
            window.H5P.instances.length > 0
          ) {
            // Use the first instance by default
            const instance = window.H5P.instances[0];
            if (instance && typeof instance.getXAPIData === 'function') {
              xapiData = instance.getXAPIData();
            }
          }
        } catch (err) {
          xapiData = { error: err.message };
        }
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'customEventResponse',
            data: {
              message: 'Received event in WebView',
              payload: msg.payload,
              xapiData,
            },
          }),
        );
      }
    } catch (e) {}
  });
  true; // Return true to avoid console warnings
`;

const H5PContentWebview = forwardRef(
  (
    {
      contentId,
      contentUrl,
      xapiDataCallback,
      onError,
      style,
    }: {
      contentId: string;
      contentUrl: string;
      style: StyleProp<ViewStyle & CSSProperties> | undefined;
      xapiDataCallback: (data: XAPIStatement) => void;
      onError: () => void;
    },
    ref: ForwardedRef<H5PContentWebviewForwardRef>,
  ) => {
    const webViewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      triggerXapiDataFetch() {
        const message = JSON.stringify({
          type: 'customEvent',
          payload: { foo: 'bar', timestamp: Date.now() },
        });
        // For iOS and Android compatibility
        webViewRef.current?.injectJavaScript(`
          (function() {
            var event = new MessageEvent('message', { data: '${message.replace(/'/g, "\\'")}' });
            document.dispatchEvent(event);
          })();
          true;
        `);
      },
    }));

    const handleMessage = async (event: WebViewMessageEvent) => {
      try {
        const parsed = JSON.parse(event.nativeEvent.data);

        const xAPIEventData = parsed.data.xapiData as XAPIStatement;

        // console.log('Received xAPI Event Data:', JSON.stringify(xAPIEventData));

        xapiDataCallback(xAPIEventData);
      } catch (error) {
        console.warn('Error parsing xAPI event data:', error);
      }
    };
    return (
      <WebView
        ref={webViewRef}
        key={`content-${contentId}`}
        source={{ uri: contentUrl }}
        style={style}
        injectedJavaScript={injectedJS}
        onMessage={handleMessage}
        javaScriptEnabled
        onFileDownload={event => console.log(event)}
        onError={() => {
          onError();
        }}
        onShouldStartLoadWithRequest={request => {
          if (request.url.startsWith('blob:')) {
            console.warn('Blocked blob URL:', request.url);
            return false; // prevent WebView from trying to open it
          }
          return true;
        }}
        mixedContentMode="always"
        allowsFullscreenVideo
        allowFileAccess
        allowsInlineMediaPlayback
        allowsAirPlayForMediaPlayback
        allowsProtectedMedia
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        scalesPageToFit={false}
        cacheEnabled
        androidLayerType="hardware"
      />
    );
  },
);

export default H5PContentWebview;
