import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushSubscription {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface UserSettings {
  user_id: string;
  notification_enabled: boolean;
  notification_time: string;
  timezone: string | null;
}

// Web Push VAPID signing
async function signJWT(payload: object, privateKeyBase64: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Decode the base64url private key
  const privateKeyRaw = Uint8Array.from(
    atob(privateKeyBase64.replace(/-/g, '+').replace(/_/g, '/')),
    c => c.charCodeAt(0)
  );
  
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyRaw,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  
  const header = { alg: "ES256", typ: "JWT" };
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signatureInput = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    signatureInput
  );
  
  // Convert DER signature to raw r||s format
  const signatureArray = new Uint8Array(signature);
  const signatureB64 = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function sendPushNotification(
  subscription: PushSubscription,
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      aud: audience,
      exp: now + 12 * 60 * 60, // 12 hours
      sub: vapidSubject,
    };
    
    // For web-push, we need the private key in a specific format
    // The VAPID private key from web-push is already in the right base64url format
    const jwt = await signJWT(jwtPayload, vapidPrivateKey);
    
    const vapidHeader = `vapid t=${jwt}, k=${vapidPublicKey}`;
    
    // Encrypt the payload using the subscription keys
    const payloadString = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(payloadString);
    
    // Import subscription keys
    const p256dhBytes = Uint8Array.from(
      atob(subscription.p256dh.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );
    const authBytes = Uint8Array.from(
      atob(subscription.auth.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );
    
    // Generate local key pair
    const localKeyPair = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    );
    
    // Export local public key
    const localPublicKeyRaw = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);
    const localPublicKeyBytes = new Uint8Array(localPublicKeyRaw);
    
    // Import subscriber's public key
    const subscriberPublicKey = await crypto.subtle.importKey(
      "raw",
      p256dhBytes,
      { name: "ECDH", namedCurve: "P-256" },
      false,
      []
    );
    
    // Derive shared secret
    const sharedSecret = await crypto.subtle.deriveBits(
      { name: "ECDH", public: subscriberPublicKey },
      localKeyPair.privateKey,
      256
    );
    
    // HKDF for key derivation
    const sharedSecretKey = await crypto.subtle.importKey(
      "raw",
      sharedSecret,
      "HKDF",
      false,
      ["deriveBits"]
    );
    
    const authKey = await crypto.subtle.importKey(
      "raw",
      authBytes,
      "HKDF",
      false,
      ["deriveBits"]
    );
    
    // Create info strings for HKDF
    const keyInfo = encoder.encode("Content-Encoding: aes128gcm\0");
    const nonceInfo = encoder.encode("Content-Encoding: nonce\0");
    
    // Derive PRK using auth secret
    const prkInfo = new Uint8Array([
      ...encoder.encode("WebPush: info\0"),
      ...p256dhBytes,
      ...localPublicKeyBytes
    ]);
    
    const prk = await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: authBytes, info: prkInfo },
      sharedSecretKey,
      256
    );
    
    const prkKey = await crypto.subtle.importKey(
      "raw",
      prk,
      "HKDF",
      false,
      ["deriveBits"]
    );
    
    // Generate salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derive content encryption key and nonce
    const cekBits = await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: salt, info: keyInfo },
      prkKey,
      128
    );
    const cek = await crypto.subtle.importKey(
      "raw",
      cekBits,
      "AES-GCM",
      false,
      ["encrypt"]
    );
    
    const nonceBits = await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: salt, info: nonceInfo },
      prkKey,
      96
    );
    const nonce = new Uint8Array(nonceBits);
    
    // Pad and encrypt payload
    const paddedPayload = new Uint8Array(payloadBytes.length + 2);
    paddedPayload.set(payloadBytes);
    paddedPayload[payloadBytes.length] = 2; // Delimiter
    paddedPayload[payloadBytes.length + 1] = 0; // Padding
    
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      cek,
      paddedPayload
    );
    
    // Build the encrypted content
    const recordSize = 4096;
    const header = new Uint8Array(86 + 1); // salt + rs + idlen + keyid
    header.set(salt, 0); // 16 bytes salt
    new DataView(header.buffer).setUint32(16, recordSize, false); // 4 bytes record size
    header[20] = 65; // 1 byte keyid length
    header.set(localPublicKeyBytes, 21); // 65 bytes public key
    
    const body = new Uint8Array(header.length + encrypted.byteLength);
    body.set(header);
    body.set(new Uint8Array(encrypted), header.length);
    
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Authorization": vapidHeader,
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400", // 24 hours
      },
      body: body,
    });
    
    if (response.status === 201 || response.status === 200) {
      return { success: true, statusCode: response.status };
    } else {
      const errorText = await response.text();
      return { 
        success: false, 
        statusCode: response.status, 
        error: errorText || response.statusText 
      };
    }
  } catch (error) {
    console.error("Push notification error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

function isWithinNotificationWindow(
  notificationTime: string, 
  currentTime: Date,
  userTimezone: string
): boolean {
  const [hours, minutes] = notificationTime.split(':').map(Number);
  
  // Get current time in user's timezone
  const userLocalTimeStr = currentTime.toLocaleString('en-US', { 
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false 
  });
  
  const [currentHours, currentMinutes] = userLocalTimeStr.split(':').map(Number);
  
  const notificationTotalMinutes = hours * 60 + minutes;
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  
  // Check if within a 2-minute window (to account for cron timing)
  const diff = Math.abs(currentTotalMinutes - notificationTotalMinutes);
  
  console.log(`User timezone: ${userTimezone}, Notification time: ${hours}:${minutes}, Current local time: ${currentHours}:${currentMinutes}, Diff: ${diff} minutes`);
  
  return diff < 2;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error("VAPID keys not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    
    console.log(`[${now.toISOString()}] Starting notification check...`);

    // Get all users with notifications enabled
    const { data: userSettings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id, notification_enabled, notification_time, timezone")
      .eq("notification_enabled", true);

    if (settingsError) {
      throw settingsError;
    }

    if (!userSettings || userSettings.length === 0) {
      console.log("No users with notifications enabled");
      return new Response(
        JSON.stringify({ message: "No users with notifications enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${userSettings.length} users with notifications enabled`);

    // Filter users whose notification time matches the current time (in their timezone)
    const usersToNotify = (userSettings as UserSettings[]).filter((settings) =>
      isWithinNotificationWindow(
        settings.notification_time || "20:00:00", 
        now,
        settings.timezone || "UTC"
      )
    );

    if (usersToNotify.length === 0) {
      console.log("No users to notify at this time");
      return new Response(
        JSON.stringify({ message: "No users to notify at this time" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`${usersToNotify.length} users to notify at this time`);

    const results = {
      sent: 0,
      failed: 0,
      cleaned: 0,
      errors: [] as string[],
    };

    // Get push subscriptions for these users
    const userIds = usersToNotify.map((u) => u.user_id);
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (subsError) {
      throw subsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions found for users to notify");
      return new Response(
        JSON.stringify({ message: "No push subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions.length} push subscriptions`);

    // Get the frontend URL for the notification
    const appUrl = supabaseUrl.replace('.supabase.co', '.lovable.app').replace('https://', 'https://quietlyjournal.');

    // Send notifications
    for (const subscription of subscriptions as PushSubscription[]) {
      const result = await sendPushNotification(
        subscription,
        {
          title: "Time to Journal ✍️",
          body: "Take a moment to reflect on your day",
          url: "/",
        },
        vapidPublicKey,
        vapidPrivateKey,
        "mailto:notifications@quietly.app"
      );

      if (result.success) {
        results.sent++;
        console.log(`Notification sent to ${subscription.endpoint.substring(0, 50)}...`);
      } else {
        results.failed++;
        results.errors.push(`${subscription.endpoint.substring(0, 30)}...: ${result.error}`);
        
        // Clean up expired subscriptions (410 Gone)
        if (result.statusCode === 410 || result.statusCode === 404) {
          console.log(`Cleaning up expired subscription: ${subscription.endpoint.substring(0, 50)}...`);
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);
          results.cleaned++;
        }
      }
    }

    console.log(`Notification run complete: ${results.sent} sent, ${results.failed} failed, ${results.cleaned} cleaned`);

    return new Response(
      JSON.stringify({
        message: "Notification run complete",
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-notifications function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
