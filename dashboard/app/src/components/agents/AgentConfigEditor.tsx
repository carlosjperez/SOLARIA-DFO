/**
 * AgentConfigEditor.tsx
 *
 * Epic 2 Sprint 2.2 - DFO-2006
 * UI component for managing MCP server configurations for agents
 */

import { useState, useEffect } from 'react';
import {
    Server,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    RefreshCw,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentMcpConfig {
    id: number;
    agent_id: number;
    server_name: string;
    server_url: string;
    auth_type: 'bearer' | 'basic' | 'api_key' | 'none';
    auth_credentials?: {
        token?: string;
        username?: string;
        password?: string;
        apiKey?: string;
    };
    enabled: boolean;
    transport_type: 'http' | 'stdio' | 'sse';
    connection_status: 'connected' | 'disconnected' | 'error';
    last_connected_at?: string;
    last_error?: string;
}

interface AgentConfigEditorProps {
    agentId: number;
    agentName: string;
}

export function AgentConfigEditor({ agentId, agentName }: AgentConfigEditorProps) {
    const [configs, setConfigs] = useState<AgentMcpConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state for new config
    const [formData, setFormData] = useState<{
        server_name: string;
        server_url: string;
        auth_type: 'bearer' | 'basic' | 'api_key' | 'none';
        transport_type: 'http' | 'stdio' | 'sse';
        enabled: boolean;
        apiKey: string;
    }>({
        server_name: '',
        server_url: '',
        auth_type: 'none',
        transport_type: 'http',
        enabled: true,
        apiKey: '',
    });

    // Load configs on mount
    useEffect(() => {
        loadConfigs();
    }, [agentId]);

    const loadConfigs = async () => {
        try {
            const response = await fetch(`/api/agents/${agentId}/mcp-configs`);
            if (response.ok) {
                const data = await response.json();
                setConfigs(data);
            }
        } catch (error) {
            console.error('Error loading MCP configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const payload = {
                server_name: formData.server_name,
                server_url: formData.server_url,
                auth_type: formData.auth_type,
                transport_type: formData.transport_type,
                enabled: formData.enabled,
                auth_credentials: formData.auth_type === 'api_key' ? { apiKey: formData.apiKey } : {},
            };

            const response = await fetch(`/api/agents/${agentId}/mcp-configs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setFormData({
                    server_name: '',
                    server_url: '',
                    auth_type: 'none',
                    transport_type: 'http',
                    enabled: true,
                    apiKey: '',
                });
                setShowAddForm(false);
                await loadConfigs();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error creating config:', error);
            alert('Failed to create configuration');
        }
    };

    const handleDelete = async (configId: number) => {
        if (!confirm('¿Eliminar esta configuración MCP?')) return;

        try {
            const response = await fetch(`/api/agents/${agentId}/mcp-configs/${configId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadConfigs();
            }
        } catch (error) {
            console.error('Error deleting config:', error);
        }
    };

    const handleToggleEnabled = async (config: AgentMcpConfig) => {
        try {
            const response = await fetch(`/api/agents/${agentId}/mcp-configs/${config.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !config.enabled }),
            });

            if (response.ok) {
                await loadConfigs();
            }
        } catch (error) {
            console.error('Error updating config:', error);
        }
    };

    const handleTestConnection = async (configId: number) => {
        setTesting(configId);
        try {
            const response = await fetch(`/api/agents/${agentId}/mcp-configs/${configId}/test`, {
                method: 'POST',
            });

            const result = await response.json();

            if (result.success) {
                alert(`✓ Conexión exitosa\n\nTools disponibles: ${result.tools_count}\n\n${result.tools?.map((t: { name: string }) => `• ${t.name}`).join('\n')}`);
            } else {
                alert(`✗ Error de conexión\n\n${result.details}`);
            }

            await loadConfigs();
        } catch (error) {
            console.error('Error testing connection:', error);
            alert('Error al probar la conexión');
        } finally {
            setTesting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Cargando configuraciones...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        <Server className="inline h-5 w-5 mr-2" />
                        Configuraciones MCP
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Conexiones a servidores MCP externos para {agentName}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Configuración
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-4">
                    <h4 className="font-medium text-gray-900">Nueva Configuración MCP</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del Servidor
                            </label>
                            <input
                                type="text"
                                value={formData.server_name}
                                onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
                                placeholder="context7, playwright, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL del Servidor
                            </label>
                            <input
                                type="url"
                                value={formData.server_url}
                                onChange={(e) => setFormData({ ...formData, server_url: e.target.value })}
                                placeholder="https://api.example.com/mcp"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Autenticación
                            </label>
                            <select
                                value={formData.auth_type}
                                onChange={(e) => setFormData({ ...formData, auth_type: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="none">None</option>
                                <option value="api_key">API Key</option>
                                <option value="bearer">Bearer Token</option>
                                <option value="basic">Basic Auth</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Transporte
                            </label>
                            <select
                                value={formData.transport_type}
                                onChange={(e) => setFormData({ ...formData, transport_type: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="http">HTTP</option>
                                <option value="stdio">STDIO</option>
                                <option value="sse">SSE</option>
                            </select>
                        </div>

                        {formData.auth_type === 'api_key' && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    value={formData.apiKey}
                                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                    placeholder="Ingrese API key"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!formData.server_name || !formData.server_url}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Crear Configuración
                        </button>
                    </div>
                </div>
            )}

            {/* Configs List */}
            <div className="space-y-3">
                {configs.length === 0 && !showAddForm && (
                    <div className="text-center py-12 text-gray-500">
                        <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay configuraciones MCP</p>
                        <p className="text-sm mt-1">Crea una para conectar a servidores externos</p>
                    </div>
                )}

                {configs.map((config) => (
                    <div
                        key={config.id}
                        className={cn(
                            'border rounded-lg p-4 transition-colors',
                            config.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-medium text-gray-900">{config.server_name}</h4>
                                    <span className={cn(
                                        'px-2 py-1 text-xs rounded-full font-medium',
                                        config.connection_status === 'connected' && 'bg-green-100 text-green-700',
                                        config.connection_status === 'disconnected' && 'bg-gray-100 text-gray-700',
                                        config.connection_status === 'error' && 'bg-red-100 text-red-700'
                                    )}>
                                        {config.connection_status === 'connected' && <CheckCircle className="inline h-3 w-3 mr-1" />}
                                        {config.connection_status === 'error' && <XCircle className="inline h-3 w-3 mr-1" />}
                                        {config.connection_status}
                                    </span>
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                                        {config.transport_type}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {config.server_url}
                                </div>
                                {config.last_error && (
                                    <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded border border-red-100">
                                        Error: {config.last_error}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleTestConnection(config.id)}
                                    disabled={testing === config.id}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Probar conexión"
                                >
                                    <RefreshCw className={cn('h-4 w-4', testing === config.id && 'animate-spin')} />
                                </button>
                                <button
                                    onClick={() => handleToggleEnabled(config)}
                                    className={cn(
                                        'p-2 rounded-lg transition-colors',
                                        config.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                                    )}
                                    title={config.enabled ? 'Deshabilitar' : 'Habilitar'}
                                >
                                    <Settings className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(config.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
