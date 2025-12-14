import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, AlertCircle, ShoppingCart, Store } from 'lucide-react';

interface RegisterFormProps {
  lang: string;
}

const translations = {
  en: {
    title: 'Create Your Account',
    subtitle: 'Join CircuitRack today and start shopping.',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    selectRole: 'I want to',
    buyer: 'Buy Products',
    vendor: 'Sell Products',
    registerButton: 'Create Account',
    haveAccount: 'Already have an account?',
    login: 'Sign In',
    registering: 'Creating account...',
    passwordMismatch: 'Passwords do not match',
  },
  ar: {
    title: 'إنشاء حساب جديد',
    subtitle: 'انضم إلى CircuitRack اليوم وابدأ التسوق.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    selectRole: 'أريد أن',
    buyer: 'أشتري منتجات',
    vendor: 'أبيع منتجات',
    registerButton: 'إنشاء حساب',
    haveAccount: 'هل لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    registering: 'جاري إنشاء الحساب...',
    passwordMismatch: 'كلمات المرور غير متطابقة',
  },
  zh: {
    title: '创建您的账户',
    subtitle: '立即加入 CircuitRack 并开始购物。',
    email: '电子邮件',
    password: '密码',
    confirmPassword: '确认密码',
    selectRole: '我想',
    buyer: '购买产品',
    vendor: '销售产品',
    registerButton: '创建账户',
    haveAccount: '已有账户？',
    login: '登录',
    registering: '创建账户中...',
    passwordMismatch: '密码不匹配',
  },
};

export function RegisterForm({ lang }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'vendor'>('buyer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, user, profile, login } = useAuth();
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

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, password, role);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        const loginResult = await login(email, password);
        if (loginResult.error) {
          setError(loginResult.error);
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.selectRole}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    role === 'buyer'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <ShoppingCart className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">{t.buyer}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    role === 'vendor'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Store className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">{t.vendor}</span>
                </button>
              </div>
            </div>

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
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? t.registering : t.registerButton}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t.haveAccount} </span>
            <Link
              to="/login"
              className="font-medium text-green-600 hover:text-green-500 transition-colors"
            >
              {t.login}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
