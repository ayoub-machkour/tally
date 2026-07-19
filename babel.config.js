const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: { '@': './src' },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.native.js'],
      },
    ],
    // Reanimated must be last; skip in test env — pure domain tests don't need it
    ...(!isTest ? ['react-native-reanimated/plugin'] : []),
  ],
};
