import { observable, action, computed } from 'mobx';
import { createContext } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';
import { usePromise } from '../api/usePromise';
import { SyntheticEvent } from 'react';

class ActivityStore {
  @observable activities: IActivity[] = [];
  @observable loadingInitial = false;
  @observable selectedActivity: IActivity | undefined;
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
      activities.forEach((activity: IActivity) => {
        activity.date = activity.date.split('.')[0];
        this.activityRegistry.set(activity.id, activity);
      });
    } else {
      console.log(err);
    }

    this.loadingInitial = false;
  };

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    const [err] = await usePromise(agent.Activities.create(activity));
    if (!err) {
      this.activityRegistry.set(activity.id, activity);
      this.editMode = false;
    } else {
      console.log(err);
    }
    this.submitting = false;
  };

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    const [err] = await usePromise(agent.Activities.update(activity));
    if (!err) {
      this.activityRegistry.set(activity.id, activity);
      this.selectedActivity = activity;
      this.editMode = false;
    } else {
      console.log(err);
    }
    this.submitting = false;
  };

  @action deleteActivity = async (
    evt: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    this.submitting = true;
    this.target = evt.currentTarget.name;
    const [err] = await usePromise(agent.Activities.delete(id));
    if (!err) {
      this.activityRegistry.delete(id);
    } else {
      console.log(err);
    }
    this.submitting = false;
    this.target = '';
  };

  @action openEditForm = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id);
    this.editMode = true;
  };

  @action openCreateForm = () => {
    this.editMode = true;
    this.selectedActivity = undefined;
  };

  @action cancelSelectedActivity = () => {
    this.selectedActivity = undefined;
  };

  @action cancelFormOpen = () => {
    this.editMode = false;
  };

  @action selectActivity = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id);
    this.editMode = false;
  };
}

export default createContext(new ActivityStore());
