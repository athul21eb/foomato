import React from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth-context';
import { useToast } from '../../../context/use-toast';
import { useTheme } from '../../../context/theme-context';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const GoogleLoginBtn: React.FC = () => {
  const { loginWithGoogle, isLoading } = useAuth();
  const { success, error } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      error('No credential received from Google');
      return;
    }

    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      success(`Welcome back, ${user.name}!`);

      if (!user.role) {
        navigate('/select-role');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Google authentication failed';
      error(message);
    }
  };

  const handleGoogleError = () => {
    error('Google sign-in was interrupted or failed');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full flex justify-center py-2">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleGoogleError}
          theme={theme === 'dark' ? 'filled_black' : 'outline'}
          size="large"
          shape="pill"
          text="continue_with"
          width="320"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-500 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Verified Google token exchange</span>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-orange-400 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Authenticating with Foomato backend...</span>
        </div>
      )}
    </div>
  );
};
