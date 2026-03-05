// Centralized status colors — mirrors CSS variables in styles/variables.css
// Used by chart.js components that can't read CSS custom properties directly.

export const STATUS_COLORS = {
  Passed:  '#4CAF50',
  Failed:  '#F44336',
  Blocked: '#FF9800',
  Retest:  '#00897B',
  Untested:'#9E9E9E',
};

export const STATUS_ORDER = ['Passed', 'Failed', 'Blocked', 'Retest', 'Untested'];

export function getStatusChartData(stats) {
  return {
    labels: STATUS_ORDER,
    datasets: [{
      data: STATUS_ORDER.map((s) => stats[s] || 0),
      backgroundColor: STATUS_ORDER.map((s) => STATUS_COLORS[s]),
      borderWidth: 0,
    }],
  };
}