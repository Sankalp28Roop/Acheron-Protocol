'use client';

import { useEffect, useRef } from 'react';

interface MessageDetailViewerProps {
  html: string;
}

export function MessageDetailViewer({ html }: MessageDetailViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        // Base styling for the iframe content to match our theme and prevent unstyled FOUC
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Manrope', sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
                  font-size: 14px;
                  color: #c2c6d1;
                  line-height: 1.6;
                  word-break: break-word;
                }
                a { color: #2ddbde; text-decoration: none; }
                a:hover { text-decoration: underline; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              ${html}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [html]);

  return (
    <div className="w-full h-full min-h-[200px] border-t border-outline-variant/10 pt-3 mt-3">
      <iframe
        ref={iframeRef}
        title="Message Body"
        sandbox="allow-same-origin"
        className="w-full h-[300px] bg-transparent"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  );
}
