import { RootStore } from './rootStore';
import { observable, action, reaction } from 'mobx';

export default class CommonStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    reaction(
      () => this.token,
      token => {
        if (token) {
          localStorage.setItem('jwt', token);
        } else {
          localStorage.removeItem('jwt');
        }
      }
    );
  }

  @observable token: string | null = localStorage.getItem('jwt');
  @observable appLoaded = false;

  @action setToken = (token: string | null) => {
    this.token = token;
  };

  @action setAppLoaded = () => {
    this.appLoaded = true;
  };
}
