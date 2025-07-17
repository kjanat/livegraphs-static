import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

// Chart color palette
export const CHART_COLORS = {
  primary: ['#3B82F6', '#60A5FA', '#93BBFC', '#C3DDFD'],
  secondary: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  tertiary: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
  danger: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  pink: ['#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8']
};

// Default chart options
export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 12
        },
        padding: 15
      }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: 13
      },
      bodyFont: {
        size: 12
      },
      padding: 10,
      cornerRadius: 4
    }
  }
};