import { createContext, useContext } from 'react';
import LocalH5pServer from '.';

const LocalH5pServerContext = createContext(new LocalH5pServer());

export default LocalH5pServerContext;

export const useLocalH5pServer = (): LocalH5pServer =>
  useContext(LocalH5pServerContext);
