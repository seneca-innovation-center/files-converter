import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: ['**/*.{ts,tsx}'],
  ignore: [
    // shadcn/ui generated components - exports are intentional
    'components/ui/**',
    // Auth client re-exports used dynamically across components
    'lib/auth/client.ts',
  ],
  ignoreDependencies: [
    // ESLint plugins loaded via flat config
    'eslint-config-next',
    'eslint-config-prettier',
    'eslint-plugin-prettier',
    'eslint-plugin-react-hooks',
    // Husky runs via .husky/ git hooks
    'husky',
    // Tailwind is used via @tailwindcss/postcss plugin
    'tailwindcss',
  ],
  next: {
    entry: ['next.config.ts', 'app/**/{page,layout,loading,error}.tsx'],
  },
  ignoreExportsUsedInFile: true,
};

export default config;
