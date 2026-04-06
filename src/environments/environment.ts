// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // ============================================================
  // TODO: Replace with your actual API base URL
  // This should point to your cloud backend that receives
  // IoT sensor data and runs ML/DL models
  // ============================================================
  apiBaseUrl: 'http://localhost:3000/api', // <-- REPLACE WITH YOUR API URL

  // ============================================================
  // ML Backend URL (Flask API deployed on Render)
  // For local development, use http://localhost:5000
  // For production, replace with your Render URL e.g.:
  //   https://your-app-name.onrender.com
  // ============================================================
  mlApiBaseUrl: 'http://localhost:5000', // <-- REPLACE WITH YOUR RENDER URL

  // Set to false when your real APIs are ready
  useMock: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
