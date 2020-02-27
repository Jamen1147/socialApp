import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';
import { usePromise } from '../api/usePromise';
import { SyntheticEvent } from 'react';

configure({ enforceActions: 'always' });

class ActivityStore {
  @observable activities: IActivity[] = [];
  @observable loadingInitial = false;
  @observable activity: IActivity | undefined;
  @observable editMode = false;
  @observable submitting = false;
  @observable activityRegistry = new Map();
  @observable target = '';

  @computed get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );
  }

  @action loadActivities = async () => {
    this.loadingInitial = true;
    const [err, activities] = await usePromise(agent.Activities.list());
    if (!err) {
      runInAction('loadActivities success', () => {
        activities.forEach((activity: IActivity) => {
          activity.date = activity.date.split('.')[0];
          this.activityRegistry.set(activity.id, activity);
        });
      });
    } else {
      console.log(err);
    }
    runInAction('loadActivities after', () => {
      this.loadingInitial = false;
    });
  };

  @action loadActivity = async (id: string) => {
    const localActivity = this.activityRegistry.get(id);
    if (localActivity) {
      this.activity = localActivity;
    } else {
      this.loadingInitial = true;
      const [err, activity] = await usePromise(agent.Activities.details(id));
      if (!err) {
        runInAction('loadActivity OK', () => {
          this.activity = activity;
        });
      } else {
        console.log(err);
      }
      runInAction('loadActivity After', () => {
        this.loadingInitial = false;
      });
    }
  };

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    const [err] = await usePromise(agent.Activities.create(activity));
    if (!err) {
      runInAction('createActivity success', () => {
        this.activityRegistry.set(activity.id, activity);
        this.editMode = false;
      });
    } else {
      console.log(err);
    }
    runInAction('createActivity after', () => {
      this.submitting = false;
    });
  };

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    const [err] = await usePromise(agent.Activities.update(activity));
    if (!err) {
      runInAction('editActivity success', () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.editMode = false;
      });
    } else {
      console.log(err);
    }
    runInAction('editActivity after', () => {
      this.submitting = false;
    });
  };

  @action deleteActivity = async (
    evt: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    this.submitting = true;
    this.target = evt.currentTarget.name;
    const [err] = await usePromise(agent.Activities.delete(id));
    if (!err) {
      runInAction('deleteActivity success', () => {
        this.activityRegistry.delete(id);
      });
    } else {
      console.log(err);
    }
    runInAction('deleteActivity after', () => {
      this.submitting = false;
      this.target = '';
    });
  };

  @action openEditForm = (id: string) => {
    this.activity = this.activityRegistry.get(id);
    this.editMode = true;
  };

  @action openCreateForm = () => {
    this.editMode = true;
    this.activity = undefined;
  };

  @action cancelSelectedActivity = () => {
    this.activity = undefined;
  };

  @action cancelFormOpen = () => {
    this.editMode = false;
  };

  @action selectActivity = (id: string) => {
    this.activity = this.activityRegistry.get(id);
    this.editMode = false;
  };
}

export default createContext(new ActivityStore());
