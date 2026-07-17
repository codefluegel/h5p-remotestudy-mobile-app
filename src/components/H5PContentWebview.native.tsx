import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { Linking, Platform, StyleProp, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import {
  buildBlobForwardingScript,
  DownloadMessageData,
  H5P_INJECTED_DOWNLOAD_BRIDGE_JS,
  isDownloadLink,
  parseDataUrlAsDownload,
  resolveDownloadFilename,
} from '../utils/h5pWebviewDownload';
import { XAPIStatement } from '../utils/types';

export type H5PContentWebviewForwardRef = { triggerXapiDataFetch: () => void };

const supportsExternalDownloadHandling =
  Platform.OS === 'ios' || Platform.OS === 'macos' || Platform.OS === 'android';

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

    const injectBlobUrlForwarding = (blobUrl: string) => {
      webViewRef.current?.injectJavaScript(buildBlobForwardingScript(blobUrl));
    };

    const handleDownloadMessage = async ({
      payload,
      filename,
      mimeType,
    }: DownloadMessageData) => {
      if (!payload) {
        return;
      }

      const safeFilename = resolveDownloadFilename(filename, mimeType);
      const file = new File(Paths.document, safeFilename);
      file.create({ intermediates: true, overwrite: true });
      file.write(payload, {
        encoding: 'base64',
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: mimeType || 'application/octet-stream',
          dialogTitle: safeFilename,
        });
        return;
      }

      Linking.openURL(file.uri).catch(() => undefined);
    };

    useImperativeHandle(ref, () => ({
      triggerXapiDataFetch() {
        const message = JSON.stringify({
          type: 'customEvent',
          payload: { foo: 'bar', timestamp: Date.now() },
        });

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
        const message = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          data?: unknown;
        };

        if (
          message?.type === 'DOWNLOAD' &&
          (message?.data as DownloadMessageData | undefined)?.payload
        ) {
          await handleDownloadMessage(message.data as DownloadMessageData);
          return;
        }

        if (message?.type !== 'customEventResponse') {
          return;
        }

        const xAPIEventData = (message.data as { xapiData: XAPIStatement })
          .xapiData;
        xapiDataCallback(xAPIEventData);
      } catch {
        onError();
      }
    };

    return (
      <WebView
        ref={webViewRef}
        key={`content-${contentId}`}
        source={{ uri: contentUrl }}
        style={style}
        injectedJavaScript={H5P_INJECTED_DOWNLOAD_BRIDGE_JS}
        onMessage={handleMessage}
        javaScriptEnabled
        onFileDownload={event => {
          if (!supportsExternalDownloadHandling) {
            return;
          }

          const { downloadUrl } = event.nativeEvent;
          if (downloadUrl) {
            Linking.openURL(downloadUrl).catch(() => undefined);
          }
        }}
        onError={() => {
          onError();
        }}
        onShouldStartLoadWithRequest={request => {
          const dataUrlDownload = parseDataUrlAsDownload(request.url);
          if (dataUrlDownload) {
            handleDownloadMessage(dataUrlDownload).catch(() => undefined);
            return false;
          }

          if (request.url === 'about:blank') {
            return false;
          }

          if (request.url.startsWith('blob:')) {
            injectBlobUrlForwarding(request.url);
            return false;
          }

          if (supportsExternalDownloadHandling && isDownloadLink(request.url)) {
            Linking.openURL(request.url).catch(() => undefined);
            return false;
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
        setSupportMultipleWindows={false}
      />
    );
  },
);

export default H5PContentWebview;
