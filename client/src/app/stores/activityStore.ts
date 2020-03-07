import { observable, action, computed, runInAction } from 'mobx';
import { IActivity } from '../models/activity';
import agent from '../api/agent';
import { usePromise } from '../api/usePromise';
import { SyntheticEvent } from 'react';
import { history } from '../..';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';
import { setActivityProps, createAttendee } from '../common/util/util';

export default class ActivityStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @observable loadingInitial = false;
  @observable activity: IActivity | null = null;
  @observable submitting = false;
  @observable activityRegistry = new Map();
  @observable target = '';
  @observable loading = false;

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    );
  }

  groupActivitiesByDate(activities: IActivity[]) {
    const sorted = activities.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    return Object.entries(
      sorted.reduce((activities, activity) => {
        const date = activity.date.toISOString().split('T')[0];
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: IActivity[] })
    );
  }

  @action loadActivities = async () => {
    this.loadingInitial = true;
    const [err, activities] = await usePromise(agent.Activities.list());
    if (!err) {
      runInAction('loadActivities success', () => {
        activities.forEach((activity: IActivity) => {
          setActivityProps(activity, this.rootStore.userStore.user!);
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
      return localActivity;
    } else {
      this.loadingInitial = true;
      const [err, activity] = await usePromise(agent.Activities.details(id));
      if (!err) {
        console.log('in action', activity);
        runInAction('loadActivity OK', () => {
          setActivityProps(activity, this.rootStore.userStore.user!);
          this.activity = activity;
          this.activityRegistry.set(activity.id, activity);
          this.loadingInitial = false;
        });
        return activity;
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
      const attendee = createAttendee(this.rootStore.userStore.user!);
      attendee.isHost = true;
      let attendees = [];
      attendees.push(attendee);
      activity.attendees = attendees;
      activity.isHost = true;
      runInAction('createActivity success', () => {
        this.activityRegistry.set(activity.id, activity);
      });
      history.push(`/activities/${activity.id}`);
    } else {
      toast.error('Problem submitting data');
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
      });
      history.push(`/activities/${activity.id}`);
    } else {
      toast.error('Problem submitting data');
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

  @action clearActivity = () => {
    this.activity = null;
  };

  @action attendActivity = async () => {
    this.loading = true;
    const [err] = await usePromise(agent.Activities.attend(this.activity!.id));
    if (!err) {
      runInAction('attend ok', () => {
        const attendee = createAttendee(this.rootStore.userStore.user!);
        if (this.activity) {
          this.activity.attendees.push(attendee);
          this.activity.isGoing = true;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.loading = false;
        }
      });
    } else {
      runInAction('attend failed', () => {
        this.loading = false;
      });
      toast.error('Problem attending the activity');
    }
  };

  @action cancelAttendance = async () => {
    this.loading = true;
    const [err] = await usePromise(
      agent.Activities.withdrawAttendance(this.activity!.id)
    );
    if (!err) {
      runInAction('withdraw activity ok', () => {
        if (this.activity) {
          this.activity.attendees = this.activity.attendees.filter(
            a => a.username !== this.rootStore.userStore.user!.username
          );
          this.activity.isGoing = false;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.loading = false;
        }
      });
    } else {
      runInAction('withdraw activity failed', () => {
        this.loading = false;
      });
      toast.error('Problem withdrawing the attendance of the activity');
    }
  };
}
