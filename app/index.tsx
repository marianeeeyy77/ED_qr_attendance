import { Redirect } from 'expo-router';

/**
 * App entry point. CampusQR Attend *is* the app now — the legacy home/tabs
 * have been removed, so the root route simply forwards into the CampusQR
 * portal (app/campus), which then routes by auth/role.
 */
export default function Index() {
  return <Redirect href="/campus" />;
}
