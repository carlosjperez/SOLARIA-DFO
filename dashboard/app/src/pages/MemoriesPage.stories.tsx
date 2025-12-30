import type { Meta, StoryObj } from '@storybook/react';
import { MemoriesPage } from './MemoriesPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * MemoriesPage - Sistema de memoria persistente
 *
 * Página refactorizada usando design system components:
 * - PageHeader con view toggle (grid/list)
 * - StatsGrid con 4 métricas dinámicas
 * - SearchAndFilterBar con filtros de tags + importancia
 * - ContentGrid responsive (3 columnas)
 * - MemoryDetailModal integrado
 *
 * ## Visual Regression Testing
 * Validar:
 * - Layout de stats con formatNumber()
 * - Filtros de tags con TAG_COLORS
 * - Filtros de importancia (alta/media/baja)
 * - Grid 3 columnas vs Table list
 * - Empty states (search vs no data)
 * - TAG_COLORS mapping (10 tags predefinidos)
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
  title: 'Pages/MemoriesPage',
  component: MemoriesPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Sistema de memoria persistente con búsqueda semántica, tags y filtros de importancia.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof MemoriesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado por defecto
 * Puede mostrar loading/error si API no responde
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
 * Vista desktop (1280px)
 * Grid muestra 3 columnas completas
 */
export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

/**
 * Vista desktop amplia (1920px)
 * Grid mantiene 3 columnas con más espacio
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
 * Validar colores de tags y badges de importancia
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </div>
    ),
  ],
};
