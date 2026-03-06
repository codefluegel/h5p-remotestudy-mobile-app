declare module "rn-bridge" {
  // js, see https://github.com/nodejs-mobile/nodejs-mobile-react-native/blob/4eb92533b8517b5b99224b1d81c9c5ab3e5ef220/install/resources/nodejs-modules/builtin_modules/rn-bridge/index.js

  type MessageHandler = (msg: unknown) => void;

  interface Channel {
    send: (...msg: (string | {})) => void;
    post: (...msg: (string | {})) => void;    
    on: (event: string, handler: MessageHandler) => void;
  }
  export const channel: Channel;
}
