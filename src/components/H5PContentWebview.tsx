import React, {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
} from 'react';

import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { XAPIStatement } from '../utils/types';

export type H5PContentWebviewForwardRef = { triggerXapiDataFetch: () => void };

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
    useImperativeHandle(ref, () => ({
      triggerXapiDataFetch() {
        // TODO: this is rather a hack..use better typing with html elements
        const iframeWindow = Object(
          Object(document.getElementById(`content-${contentId}`)).contentWindow,
        );

        if ('H5P' in iframeWindow && 'instances' in Object(iframeWindow.H5P)) {
          const { instances } = Object(iframeWindow.H5P);
          // Use the first instance by default
          const instance = instances;
          if (typeof instance?.[0]?.getXAPIData === 'function') {
            xapiDataCallback(instance[0].getXAPIData());
          }
        }
      },
    }));

    return (
      <iframe
        onError={() => onError()}
        style={{
          ...StyleSheet.flatten(style),
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
        title="H5PContent"
        id={`content-${contentId}`}
        src={contentUrl}
      />
    );
  },
);

export default H5PContentWebview;
