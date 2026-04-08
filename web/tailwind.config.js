export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ui-depth': '0 4px 24px -6px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'ui-depth-lg': '0 12px 40px -12px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glow-subtle': '0 0 0 1px rgba(255, 255, 255, 0.06), 0 0 40px -12px rgba(255, 255, 255, 0.08)',
      },
      colors: {
        'ranked-bg': '#09090b',
        'ranked-sidebar': '#0c0c0e',
        'ranked-card': '#12121a',
        'ranked-border': '#27272a',
        'ranked-accent': '#fafafa',
        'ranked-accent2': '#e4e4e7',
        'ranked-green': '#d4d4d8',
        'ranked-red': '#a1a1aa',
        'ranked-muted': '#a1a1aa',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
