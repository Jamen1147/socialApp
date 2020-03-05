import { observable, computed, action } from 'mobx';
import { IUser, IUserFormValues } from '../models/user';
import { usePromise } from '../api/usePromise';
import agent from '../api/agent';
import { RootStore } from './rootStore';

export default class UserStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @observable user: IUser | null = null;

  @computed get isLoggedIn() {
    return !!this.user;
  }

  @action login = async (values: IUserFormValues) => {
    const [err, user] = await usePromise(agent.User.login(values));
    if (!err) {
      this.user = user;
    } else {
      console.log(err);
    }
  };
}
