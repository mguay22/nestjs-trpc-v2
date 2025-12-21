module.exports = {
  '**/*.{ts,tsx}': ['prettier --write', () => 'pnpm lint:fix'],
  '**/*.{js,jsx,json,md,yml,yaml}': ['prettier --write'],
};
