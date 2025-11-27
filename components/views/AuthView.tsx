
import React, { useState } from 'react';
import { GlassCard, GlassInput, GlassButton } from '../GlassComponents';
import { User } from '../../types';
import { Gamepad2, Mail, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot_password' | 'reset_success' | 'verify_email';

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCodeFromUid = (uid: string) => {
    return uid.substring(0, 6).toUpperCase();
  };

  const handleForgotPassword = async () => {
    setError('');
    const cleanEmail = formData.email.trim();
    
    if (!cleanEmail) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        setError('Please enter a valid email address.');
        return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setAuthMode('reset_success');
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError('Failed to send reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    // Basic Validation
    const cleanEmail = formData.email.trim();
    if (!cleanEmail || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        setError('Please enter a valid email address.');
        return;
    }
    
    if (authMode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!formData.username) {
        setError('Username is required.');
        return;
      }
    }

    setLoading(true);

    try {
      if (authMode === 'signin') {
        // Firebase Login
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, formData.password);
        const firebaseUser = userCredential.user;

        // CHECK EMAIL VERIFICATION
        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          setAuthMode('verify_email');
          setLoading(false);
          return;
        }
        
        // Construct User object
        const user: User = {
            id: firebaseUser.uid,
            uniqueCode: generateCodeFromUid(firebaseUser.uid),
            username: firebaseUser.displayName || cleanEmail.split('@')[0],
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200/200`,
            bio: 'Ready to play.',
            rank: 'Iron',
            level: 1,
            yearsExperience: 0,
            games: [],
            gallery: [],
            friends: [],
            incomingRequests: [],
            outgoingRequests: []
        };
        onLogin(user);

      } else if (authMode === 'signup') {
        // Firebase Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, formData.password);
        const firebaseUser = userCredential.user;

        // Update Profile
        await updateProfile(firebaseUser, {
            displayName: formData.username,
            photoURL: `https://picsum.photos/seed/${firebaseUser.uid}/200/200`
        });

        // SEND EMAIL VERIFICATION
        await sendEmailVerification(firebaseUser);
        
        // Force logout so they can't access app until verified
        await signOut(auth);
        
        setAuthMode('verify_email');
      }
    } catch (err: any) {
        console.error("Auth Error:", err);
        if (err.code === 'auth/invalid-email') {
            setError('Invalid email address format.');
        } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError('Password or Email Incorrect');
        } else if (err.code === 'auth/email-already-in-use') {
            setError('Email is already in use.');
        } else if (err.code === 'auth/weak-password') {
            setError('Password should be at least 6 characters.');
        } else {
            setError('Authentication failed. Please try again.');
        }
    } finally {
        setLoading(false);
    }
  };

  const renderContent = () => {
    switch (authMode) {
      case 'verify_email':
        return (
          <div className="text-center">
            <div className="bg-blue-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Mail size={40} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Verify Your Email</h2>
            <p className="text-gray-300 mb-2">
              We have sent you a verification email to:
            </p>
            <p className="text-blue-400 font-bold mb-6 font-mono text-lg">{formData.email}</p>
            <p className="text-gray-400 text-sm mb-8">
              Please verify your email address and then log in to continue.
            </p>
            <GlassButton 
              className="w-full" 
              onClick={() => {
                setAuthMode('signin');
                setError('');
              }}
            >
              Back to Sign In
            </GlassButton>
          </div>
        );

      case 'reset_success':
        return (
          <div className="text-center">
            <div className="bg-green-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Reset Link Sent</h2>
            <p className="text-gray-300 mb-6">
              We sent you a password change link to:
            </p>
            <p className="text-blue-400 font-bold mb-8 font-mono">{formData.email}</p>
            <GlassButton 
              className="w-full" 
              onClick={() => {
                setAuthMode('signin');
                setError('');
              }}
            >
              Sign In
            </GlassButton>
          </div>
        );

      case 'forgot_password':
        return (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-400" />
              </button>
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
            </div>
            
            <p className="text-gray-400 text-sm mb-6">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            <div className="space-y-4">
              <GlassInput 
                type="email" 
                placeholder="Email Address" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              
              <GlassButton className="w-full mt-2" onClick={handleForgotPassword} disabled={loading}>
                {loading ? 'Sending...' : 'Get Reset Link'}
              </GlassButton>
            </div>
          </div>
        );

      case 'signup':
      case 'signin':
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>

            <div className="space-y-4">
              {authMode === 'signup' && (
                <GlassInput 
                  placeholder="Username" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              )}
              <GlassInput 
                type="email" 
                placeholder="Email Address" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <GlassInput 
                type="password" 
                placeholder="Password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              {authMode === 'signup' && (
                <GlassInput 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              )}
              
              {authMode === 'signin' && (
                <div className="text-right">
                  <button 
                    onClick={() => {
                      setAuthMode('forgot_password');
                      setError('');
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <GlassButton className="w-full mt-4" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : (authMode === 'signin' ? 'Enter World' : 'Join Server')}
              </GlassButton>
            </div>

            <div className="mt-6 text-center">
              <button 
                onClick={() => { 
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); 
                  setError(''); 
                }}
                className="text-sm text-blue-300 hover:text-blue-200 underline decoration-blue-500/30"
              >
                {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-8 text-center animate-pulse">
        <Gamepad2 size={64} className="text-blue-400 mx-auto mb-4" />
        <h1 className="text-4xl font-gamer font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          GAMERS MATCH
        </h1>
        <p className="text-white/60">Connect. Contract. Conquer.</p>
      </div>

      <GlassCard className="w-full max-w-md p-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {renderContent()}
      </GlassCard>
    </div>
  );
};
