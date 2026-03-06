import { createContext, useContext } from 'react';
import RootStore from '.';

const StoreContext = createContext(new RootStore({}));

export default StoreContext;

export const useStore = (): RootStore => {
  return useContext(StoreContext);
};
