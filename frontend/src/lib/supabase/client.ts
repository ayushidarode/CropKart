import { createBrowserClient } from '@supabase/ssr';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes('your-project') &&
      !url.includes('placeholder') &&
      !url.includes('sample-cropkart-supabase') &&
      !key.includes('your-supabase') &&
      !key.includes('dummyanonkey')
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserClient: any = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  browserClient = createBrowserClient(url, key);
  return browserClient;
}

export const supabase = getSupabaseBrowserClient();
