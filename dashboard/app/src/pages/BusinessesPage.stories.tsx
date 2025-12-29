import type { Meta, StoryObj } from '@storybook/react';
import { BusinessesPage } from './BusinessesPage';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * BusinessesPage - Gestión de negocios
 *
 * Página refactorizada usando design system components:
 * - PageHeader con view toggle
 * - StatsGrid con 4 métricas dinámicas
 * - SearchAndFilterBar con filtros de status y health
 * - ContentGrid responsive (2 columnas)
 *
 * ## Visual Regression Testing
 * Validar:
 * - Layout de stats grid
 * - Filtros de status/health con colores
 * - Grid 2 columnas vs List view
 * - Estados de health indicators (🟢🟡🔴)
 * - Formato de moneda (MXN)
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const meta = {
  title: 'Pages/BusinessesPage',
  component: BusinessesPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Página de gestión de negocios con métricas MRR, clientes, crecimiento y health indicators.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof BusinessesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado por defecto con datos de fallback
 * Muestra 4 negocios ejemplo con diferentes health states
 */
export const Default: Story = {};

/**
 * Vista móvil (320px)
 * Grid se adapta a 1 columna
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Vista tablet (768px)
 * Grid muestra 2 columnas
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Vista desktop amplia (1920px)
 * Grid mantiene 2 columnas con más espacio
 */
export const WideDesktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

/**
 * Tema oscuro
 * Validar colores de health indicators y stats
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      </div>
    ),
  ],
};
