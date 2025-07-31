/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // PMPlatto Blue Theme (差別化)
        primary: '#1E40AF',      // Deep Blue
        secondary: '#EEF2FF',    // Light Blue Gray
        accent: '#3B82F6',       // Bright Blue
        text: {
          primary: '#1E293B',    // Slate Gray
          secondary: '#64748B'   // Lighter Slate
        },
        // PMPlatto Episode Status Colors (Blue系統)
        episodeStatus: {
          '台本作成中': '#94A3B8',    // Slate 400
          '素材準備': '#7C3AED',      // Violet 600  
          '素材確定': '#4F46E5',      // Indigo 600
          '編集中': '#2563EB',        // Blue 600
          '試写1': '#0891B2',         // Cyan 600
          '修正1': '#059669',         // Emerald 600
          'MA中': '#65A30D',          // Lime 600
          '初稿完成': '#CA8A04',      // Yellow 600
          '修正中': '#DC2626',        // Red 600
          '完パケ納品': '#16A34A'     // Green 600
        },
        // Original Program Status Colors (維持)
        status: {
          'キャスティング中': '#DBEAFE',  // Blue 100
          '日程調整中': '#BFDBFE',      // Blue 200
          'ロケハン前': '#93C5FD',       // Blue 300
          '収録準備中': '#60A5FA',      // Blue 400
          '編集中': '#3B82F6',          // Blue 500
          '試写中': '#2563EB',          // Blue 600
          'MA中': '#1D4ED8',            // Blue 700
          '完パケ納品': '#1E40AF',      // Blue 800
          '放送済み': '#1E3A8A'         // Blue 900
        }
      }
    }
  },
  plugins: []
};