import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, Eye, EyeOff, Check, MapPin, Loader2, Shield, User, Mail, Lock, Phone } from 'lucide-react';

// Mock Supabase client for demo
const mockSupabase = {
  auth: {
    signUp: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { data: { user: { id: '123', email: data.email } }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table: string) => ({
    insert: async (data: any) => ({ error: null })
  })
};

interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  location?: string;
}

interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

const evaluatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const messages = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  return { 
    score: Math.min(score, 5), 
    message: messages[Math.min(score, 4)], 
    color: colors[Math.min(score, 4)] 
  };
};

const useForm = (initialData: RegisterData) => {
  const [data, setData] = useState<RegisterData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const requiredFields = ['name', 'email', 'username', 'password'];
    const filled = requiredFields.filter(field => data[field as keyof RegisterData]?.trim()).length;
    setProgress((filled / requiredFields.length) * 100);
  }, [data]);

  const updateField = useCallback((field: keyof RegisterData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [errors]);

  const validate = useCallback((): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!data.name.trim() || data.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }
    
    if (!data.username.trim() || data.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!data.password.trim() || data.password.trim().length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      const strength = evaluatePasswordStrength(data.password.trim());
      if (strength.score < 3) {
        newErrors.password = `Password is ${strength.message.toLowerCase()}. Add uppercase, numbers, and symbols.`;
      }
    }

    if (data.phone && data.phone.trim() && !/^[\d\s\+\-\(\)]+$/.test(data.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    return newErrors;
  }, [data]);

  return { data, updateField, errors, setErrors, progress, validate, touched, setTouched };
};

const useGeolocation = () => {
  const [consent, setConsent] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsFetching(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            { headers: { 'User-Agent': 'RegistrationApp/1.0' } }
          );
          
          if (!response.ok) throw new Error('Failed to fetch location');
          
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
          const state = data.address?.state || '';
          const country = data.address?.country || '';
          const formattedLocation = [city, state, country].filter(Boolean).join(', ');
          
          setLocation(formattedLocation);
          setIsFetching(false);
        } catch (err) {
          setError('Could not retrieve location. Please enter manually.');
          setIsFetching(false);
        }
      },
      (error) => {
        let message = 'Failed to get location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enter manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location unavailable. Please enter manually.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        setError(message);
        setIsFetching(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  const handleConsentChange = useCallback((checked: boolean) => {
    setConsent(checked);
    if (checked) {
      fetchLocation();
    } else {
      setLocation('');
      setError(null);
    }
  }, [fetchLocation]);

  return { consent, setConsent: handleConsentChange, isFetching, error, location };
};

function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  icon: Icon,
  isPasswordField = false,
  showPassword,
  onTogglePassword,
  strength,
  required = false
}: any) {
  const showError = touched && error;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-1 text-sm font-medium text-white">
        {label} {required && <span className="text-red-300">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          type={isPasswordField && !showPassword ? 'password' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full bg-white/10 border rounded-lg py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
            Icon ? 'pl-10' : ''
          } ${isPasswordField ? 'pr-10' : ''} ${
            showError 
              ? 'border-red-400 focus:ring-red-400' 
              : 'border-white/20 focus:ring-blue-400 focus:border-blue-400'
          }`}
          placeholder={placeholder}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
          required={required}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      {isPasswordField && strength && value && (
        <div className="space-y-1">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${strength.color}`} 
              style={{ width: `${(strength.score / 5) * 100}%` }} 
            />
          </div>
          <p className="text-xs text-white/70">{strength.message}</p>
        </div>
      )}
      
      {showError && (
        <div className="flex items-start gap-1.5 text-red-300 text-xs" role="alert">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function ConfirmationScreen({ email, onGoToLogin }: { email: string; onGoToLogin: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
        <p className="text-white/80 mb-2">
          We've sent a verification link to:
        </p>
        <p className="text-white font-semibold mb-6 break-all">{email}</p>
        <p className="text-white/70 text-sm mb-8">
          Click the link in the email to verify your account and complete registration.
        </p>
        <button
          onClick={onGoToLogin}
          className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const { data, updateField, errors, setErrors, progress, validate, touched, setTouched } = useForm({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    location: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ 
    score: 0, 
    message: '', 
    color: '' 
  });

  const { consent, setConsent, isFetching, error: locationError, location } = useGeolocation();

  useEffect(() => {
    if (data.password) {
      setPasswordStrength(evaluatePasswordStrength(data.password));
    }
  }, [data.password]);

  useEffect(() => {
    if (location) {
      updateField('location', location);
    }
  }, [location, updateField]);

  const handleBlur = (field: keyof RegisterData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      name: true,
      email: true,
      username: true,
      password: true,
      phone: true,
      location: true
    });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await mockSupabase.auth.signUp({
        email: data.email.trim(),
        password: data.password.trim(),
        options: {
          data: {
            name: data.name.trim(),
            username: data.username.trim(),
            phone: data.phone?.trim() || null,
            location: consent && data.location?.trim() ? data.location.trim() : null,
          }
        }
      });

      if (error) {
        setErrors({ general: error.message || 'Registration failed. Please try again.' });
        return;
      }

      setShowConfirmation(true);
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return <ConfirmationScreen email={data.email} onGoToLogin={() => console.log('Navigate to login')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h2>
        <p className="text-white/70 text-center mb-6 text-sm">Join us today and get started</p>
        
        <div className="mb-6">
          <div className="relative w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500 ease-out rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <p className="text-white/60 text-xs text-center mt-2">
            {Math.round(progress)}% complete
          </p>
        </div>
        
        <div className="space-y-4" onSubmit={handleSubmit}>
          <FormField
            label="Full Name"
            id="name"
            value={data.name}
            onChange={(value: string) => updateField('name', value)}
            onBlur={() => handleBlur('name')}
            placeholder="John Doe"
            error={errors.name}
            touched={touched.name}
            icon={User}
            required
          />

          <FormField
            label="Username"
            id="username"
            value={data.username}
            onChange={(value: string) => updateField('username', value)}
            onBlur={() => handleBlur('username')}
            placeholder="johndoe"
            error={errors.username}
            touched={touched.username}
            icon={User}
            required
          />

          <FormField
            label="Email"
            id="email"
            type="email"
            value={data.email}
            onChange={(value: string) => updateField('email', value)}
            onBlur={() => handleBlur('email')}
            placeholder="your@email.com"
            error={errors.email}
            touched={touched.email}
            icon={Mail}
            required
          />

          <FormField
            label="Password"
            id="password"
            value={data.password}
            onChange={(value: string) => updateField('password', value)}
            onBlur={() => handleBlur('password')}
            placeholder="••••••••"
            error={errors.password}
            touched={touched.password}
            icon={Lock}
            isPasswordField
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(prev => !prev)}
            strength={passwordStrength}
            required
          />

          <FormField
            label="Phone"
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(value: string) => updateField('phone', value)}
            onBlur={() => handleBlur('phone')}
            placeholder="+1 (555) 123-4567"
            error={errors.phone}
            touched={touched.phone}
            icon={Phone}
          />

          <div className="space-y-2">
            <FormField
              label="Location"
              id="location"
              value={data.location || ''}
              onChange={(value: string) => updateField('location', value)}
              onBlur={() => handleBlur('location')}
              placeholder="City, State, Country"
              error={errors.location || locationError}
              touched={touched.location}
              icon={MapPin}
            />
            
            <div className="flex items-start gap-2 pl-1">
              <input
                id="location-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-400 border-white/30 rounded cursor-pointer"
              />
              <label 
                htmlFor="location-consent" 
                className="text-xs text-white/70 cursor-pointer select-none leading-relaxed"
              >
                Auto-detect my location for convenience. View our{' '}
                <span className="text-blue-300 hover:text-blue-200 underline cursor-pointer">
                  Privacy Policy
                </span>
              </label>
            </div>
            
            {isFetching && (
              <div className="flex items-center gap-2 text-blue-300 text-xs pl-1">
                <Loader2 size={14} className="animate-spin" />
                <span>Detecting location...</span>
              </div>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-500/20 border border-red-400/50 text-white px-4 py-3 rounded-lg text-sm flex items-start gap-2" role="alert">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || progress < 100}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <Shield size={20} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Already have an account?{' '}
            <span className="text-blue-300 hover:text-blue-200 font-medium underline cursor-pointer">
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}