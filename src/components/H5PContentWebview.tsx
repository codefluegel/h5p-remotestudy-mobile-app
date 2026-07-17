import React, {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { XAPIStatement } from '../utils/types';

export type H5PContentWebviewForwardRef = { triggerXapiDataFetch: () => void };

const DOWNLOAD_FILE_EXTENSIONS = [
  '.zip',
  '.rar',
  '.7z',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.csv',
  '.odt',
  '.ods',
  '.odp',
  '.rtf',
  '.txt',
  '.md',
  '.epub',
  '.pdf',
];

const isDownloadLink = (url: string): boolean => {
  const normalizedUrl = url.toLowerCase();

  if (
    normalizedUrl.includes('download=') ||
    normalizedUrl.includes('attachment=') ||
    normalizedUrl.includes('response-content-disposition=')
  ) {
    return true;
  }

  return DOWNLOAD_FILE_EXTENSIONS.some(
    extension =>
      normalizedUrl.includes(`${extension}?`) ||
      normalizedUrl.endsWith(extension) ||
      normalizedUrl.includes(`${extension}#`),
  );
};

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
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // H5P Interactive Book writes chapter navigation state into top.location.hash,
    // which (in a same-origin iframe on web) targets the Expo Router window and
    // pollutes browser history — causing the native back button to disappear.
    // We listen for those hash changes and strip them via replaceState (no new
    // history entry). setTimeout(0) ensures H5P's own hashchange listeners run
    // first so internal nav inside the iframe is unaffected.
    useEffect(() => {
      const handleHashChange = () => {
        if (window.location.hash.includes('h5pbookid=')) {
          setTimeout(() => {
            window.history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search,
            );
          }, 0);
        }
      };
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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

    const handleIframeLoad = useCallback(() => {
      try {
        const iframeDocument = iframeRef.current?.contentWindow?.document;

        if (!iframeDocument) {
          return;
        }

        const handleClick = (event: MouseEvent) => {
          const clickedElement = event.target as HTMLElement | null;
          const anchor = clickedElement?.closest('a');

          if (!anchor) {
            return;
          }

          const { href } = anchor;

          if (!href) {
            return;
          }

          if (anchor.hasAttribute('download') || isDownloadLink(href)) {
            event.preventDefault();
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        };

        iframeDocument.addEventListener('click', handleClick, true);
      } catch {
        // Cross-origin iframe content cannot be inspected; browser defaults apply.
      }
    }, []);

    return (
      <iframe
        ref={iframeRef}
        onLoad={handleIframeLoad}
        onError={() => onError()}
        style={{
          ...StyleSheet.flatten(style),
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          position: 'relative',
          zIndex: 0,
          overflow: 'hidden',
        }}
        title="H5PContent"
        id={`content-${contentId}`}
        src={contentUrl}
      />
    );
  },
);

export default H5PContentWebview;
