'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export function RouteProgress() {
  return (
    <ProgressBar
      height="4px"
      color="#bf9b30"
      options={{ showSpinner: false, speed: 300, minimum: 0.2 }}
      shallowRouting
      style={`
        #nprogress .bar {
          box-shadow: 0 0 12px rgba(191, 155, 48, 0.6), 0 0 4px rgba(191,155,48,0.4);
        }
      `}
    />
  );
}
