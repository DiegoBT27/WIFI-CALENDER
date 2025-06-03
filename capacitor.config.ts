import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wifi.calender',
  appName: 'WIFI-CALENDER',
  webDir: 'out', // <-- CAMBIADO de 'public' a 'out'
  bundledWebRuntime: false,
};

export default config;
