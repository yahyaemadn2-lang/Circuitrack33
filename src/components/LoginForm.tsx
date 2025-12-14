import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  lang: string;
}

const translations = {
  en: {
    title: 'Sign In to CircuitRack',
    subtitle: 'Welcome back! Please enter your details.',
    email: 'Email',
    password: 'Password',
    loginButton: 'Sign In',
    noAccount: "Don't have an account?",
    register: 'Register',
    loggingIn: 'Signing in...',
  },
  ar: {
    title: 'تسجيل الدخول إلى CircuitRack',
    subtitle: 'مرحباً بعودتك! يرجى إدخال بياناتك.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    loginButton: 'تسجيل الدخول',
    noAccount: 'ليس لديك حساب؟',
    register: 'إنشاء حساب',
    loggingIn: 'جاري تسجيل الدخول...',
  },
  zh: {
    title: '登录 CircuitRack',
    subtitle: '欢迎回来！请输入您的详细信息。',
    email: '电子邮件',
    password: '密码',
    loginButton: '登录',
    noAccount: '没有账户？',
    register: '注册',
    loggingIn: '登录中...',
  },
};

export function LoginForm({ lang }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, profile } = useAuth();
  const navigate = useNavigate();

  const t = translations[lang as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      } else if (profile.role === 'vendor') {
        navigate('/dashboard/vendor', { replace: true });
      } else {
        navigate('/dashboard/buyer', { replace: true });
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
          <p className="mt-2 text-sm text-gray-600">{t.subtitle}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? t.loggingIn : t.loginButton}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t.noAccount} </span>
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {t.register}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
