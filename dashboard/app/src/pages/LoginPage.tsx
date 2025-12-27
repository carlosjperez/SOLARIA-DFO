import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

export function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await authApi.login(username, password);
            if (data.token && data.user) {
                login(data.user, data.token);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Error de autenticación');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20">
            <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-xl">
                {/* Logo */}
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full solaria-gradient">
                        <Sun className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold">SOLARIA DFO</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Digital Field Operations
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium mb-2"
                        >
                            Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Ingresa tu usuario"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-2"
                        >
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Ingresa tu contraseña"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg solaria-gradient py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Ingresando...
                            </span>
                        ) : (
                            'Ingresar'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    © 2024-2025 SOLARIA AGENCY
                </p>
            </div>
        </div>
    );
}
