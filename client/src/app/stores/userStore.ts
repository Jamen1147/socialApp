import { observable, computed, action, runInAction } from 'mobx';
import { IUser, IUserFormValues } from '../models/user';
import { usePromise } from '../api/usePromise';
import agent from '../api/agent';
import { RootStore } from './rootStore';
import { history } from '../..';

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
      runInAction('login successful', () => {
        this.user = user;
      });
      this.rootStore.commonStore.setToken(user.token);
      this.rootStore.modalStore.closeModal();
      history.push('/activities');
    } else {
      throw err;
    }
  };

  @action register = async (values: IUserFormValues) => {
    const [err, user] = await usePromise(agent.User.register(values));
    if (!err) {
      this.rootStore.commonStore.setToken(user.token);
      this.rootStore.modalStore.closeModal();
      history.push('/activities');
    } else {
      throw err;
    }
  };

  @action getUser = async () => {
    const [err, user] = await usePromise(agent.User.current());
    if (!err) {
      runInAction('get current user ok', () => {
        this.user = user;
      });
    } else {
      console.log(err);
    }
  };

  @action logout = () => {
    this.rootStore.commonStore.setToken(null);
    this.user = null;
    history.push('/');
  };
}
