import * as React from "react";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-background p-8 shadow-lg border">
        <div className="text-center">
          <h1 className="text-3xl font-bold">TOKO MASEMPO DALLE</h1>
          <p className="text-muted-foreground mt-2">Masuk ke akun Anda untuk mulai berjualan</p>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                }
              }
            }
          }}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Alamat Email',
                password_label: 'Kata Sandi',
                button_label: 'Masuk',
                loading_button_label: 'Masuk...',
                social_provider_text: 'Masuk dengan {{provider}}',
                link_text: 'Sudah punya akun? Masuk',
              },
              sign_up: {
                email_label: 'Alamat Email',
                password_label: 'Kata Sandi',
                button_label: 'Daftar',
                loading_button_label: 'Mendaftar...',
                link_text: 'Belum punya akun? Daftar',
              },
            }
          }}
        />
      </div>
    </div>
  );
}
