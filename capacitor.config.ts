import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rxmod.allrounder',
  appName: 'RX MOD ALLROUNDER',
  webDir: 'www',
  server: {
    url: 'https://rx-mod-app.vercel.app',
    cleartext: false,
    allowNavigation: ['rx-mod-app.vercel.app', '*.vercel.app', '*.supabase.co', 't.me', '*.youtube.com', 'youtu.be', 'drive.google.com']
  }
};

export default config;
