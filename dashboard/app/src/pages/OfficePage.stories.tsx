import type { Meta, StoryObj } from '@storybook/react';
import { OfficePage } from './OfficePage';
import { MemoryRouter } from 'react-router-dom';

/**
 * OfficePage - Página plantilla de referencia
 *
 * Muestra todos los elementos estándar del design system:
 * - PageHeader
 * - StatsGrid
 * - SearchAndFilterBar
 * - ContentGrid
 * - ContentGroup
 *
 * ## Visual Regression Testing
 * Esta página se usa para validar:
 * - Layout responsive en diferentes viewports
 * - Consistencia de spacing y colores
 * - Comportamiento de componentes en grid/list view
 * - Estados de filtros activos
 */
const meta = {
  title: 'Pages/OfficePage',
  component: OfficePage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Página plantilla que demuestra el uso correcto de todos los componentes del design system.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof OfficePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado por defecto con datos en vista grid
 */
export const Default: Story = {};

/**
 * Vista móvil (320px)
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
 */
export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

/**
 * Vista con tema oscuro
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </div>
    ),
  ],
};
