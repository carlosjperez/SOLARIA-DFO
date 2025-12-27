import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatNumber, formatPercentage, truncate, getInitials, getStatusColor, getPriorityColor, } from './utils';
describe('cn (classnames)', () => {
    it('merges class names correctly', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });
    it('handles conditional classes', () => {
        expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });
    it('merges tailwind classes correctly', () => {
        expect(cn('p-4', 'p-2')).toBe('p-2');
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });
});
describe('formatDate', () => {
    it('formats date correctly', () => {
        const date = new Date('2024-03-15');
        const result = formatDate(date);
        expect(result).toContain('15');
        expect(result).toContain('2024');
    });
    it('handles string dates', () => {
        const result = formatDate('2024-06-20');
        expect(result).toContain('20');
        expect(result).toContain('2024');
    });
});
describe('formatNumber', () => {
    it('formats numbers with locale separators', () => {
        expect(formatNumber(1000)).toBe('1,000');
        expect(formatNumber(1000000)).toBe('1,000,000');
    });
    it('handles zero', () => {
        expect(formatNumber(0)).toBe('0');
    });
});
describe('formatPercentage', () => {
    it('formats percentage without decimals by default', () => {
        expect(formatPercentage(75)).toBe('75%');
    });
    it('formats percentage with decimals', () => {
        expect(formatPercentage(75.5, 1)).toBe('75.5%');
        expect(formatPercentage(33.333, 2)).toBe('33.33%');
    });
});
describe('truncate', () => {
    it('truncates long strings', () => {
        expect(truncate('Hello World', 5)).toBe('Hello...');
    });
    it('does not truncate short strings', () => {
        expect(truncate('Hello', 10)).toBe('Hello');
    });
    it('handles exact length', () => {
        expect(truncate('Hello', 5)).toBe('Hello');
    });
});
describe('getInitials', () => {
    it('gets initials from name', () => {
        expect(getInitials('John Doe')).toBe('JD');
    });
    it('handles single name', () => {
        expect(getInitials('John')).toBe('J');
    });
    it('limits to 2 characters', () => {
        expect(getInitials('John Middle Doe')).toBe('JM');
    });
});
describe('getStatusColor', () => {
    it('returns correct colors for known statuses', () => {
        expect(getStatusColor('active')).toBe('bg-green-500');
        expect(getStatusColor('in_progress')).toBe('bg-blue-500');
        expect(getStatusColor('pending')).toBe('bg-yellow-500');
        expect(getStatusColor('blocked')).toBe('bg-red-500');
    });
    it('returns default for unknown status', () => {
        expect(getStatusColor('unknown')).toBe('bg-gray-500');
    });
});
describe('getPriorityColor', () => {
    it('returns correct colors for priorities', () => {
        expect(getPriorityColor('critical')).toContain('text-red-500');
        expect(getPriorityColor('high')).toContain('text-orange-500');
        expect(getPriorityColor('medium')).toContain('text-yellow-500');
        expect(getPriorityColor('low')).toContain('text-green-500');
    });
    it('returns default for unknown priority', () => {
        expect(getPriorityColor('unknown')).toContain('text-gray-500');
    });
});
//# sourceMappingURL=utils.test.js.map