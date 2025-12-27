import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/useAuthStore';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading } = useAuthStore();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Get the page they were trying to access
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Por favor ingresa usuario y contrasena');
            return;
        }

        const success = await login(username, password);

        if (success) {
            navigate(from, { replace: true });
        } else {
            setError('Credenciales invalidas. Intenta de nuevo.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-solaria-orange rounded-xl shadow-lg mb-4">
                        <span className="text-white text-2xl font-bold">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">SOLARIA Office</h1>
                    <p className="text-gray-600 mt-1">Ingresa tus credenciales para continuar</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Usuario
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solaria-orange focus:border-solaria-orange transition-colors"
                                placeholder="tu.usuario"
                                autoComplete="username"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Contrasena
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solaria-orange focus:border-solaria-orange transition-colors pr-12"
                                    placeholder="********"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-solaria-orange text-white py-3 px-4 rounded-lg font-medium hover:bg-solaria-orange/90 focus:ring-2 focus:ring-solaria-orange focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Iniciar Sesion
                                </>
                            )}
                        </button>
                    </form>

                    {/* Development note */}
                    {import.meta.env.DEV && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                            <p className="font-medium mb-2">Modo desarrollo:</p>
                            <p>Usuario: <code className="bg-gray-100 px-1 rounded">carlosjperez</code></p>
                            <p>Contrasena: <code className="bg-gray-100 px-1 rounded">bypass</code></p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    SOLARIA Digital Field Operations
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
