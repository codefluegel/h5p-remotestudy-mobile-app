// tell TS compiler that it's ok to import image and ttf files
declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export = value;
}
declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export = value;
}
declare module '*.ttf';

declare module '*.riv';
