import {Injectable} from '@angular/core';
import {GalleryCacheService} from './cache.gallery.service';
import {Media} from './Media';
import {MediaIcon} from './MediaIcon';
import {Config} from '../../../../common/config/public/Config';
import {Person, PersonDTO} from '../../../../common/entities/PersonDTO';

export enum ThumbnailLoadingPriority {
  extraHigh = 4, high = 3, medium = 2, low = 1
}

@Injectable()
export class ThumbnailLoaderService {

  que: Array<ThumbnailTask> = [];
  runningRequests = 0;

  constructor(private galleryCacheService: GalleryCacheService) {
  }

  run = () => {
    if (this.que.length === 0 || this.runningRequests >= Config.Client.Thumbnail.concurrentThumbnailGenerations) {
      return;
    }
    const task = this.getNextTask();

    if (task === null) {
      return;
    }

    this.runningRequests++;
    task.taskEntities.forEach(te => te.listener.onStartedLoading());
    task.inProgress = true;

    const curImg = new Image();
    curImg.onload = () => {
      task.onLoaded();
      task.taskEntities.forEach((te: ThumbnailTaskEntity) => te.listener.onLoad());

      this.taskReady(task);
      this.runningRequests--;
      this.run();
    };

    curImg.onerror = (error) => {
      task.taskEntities.forEach((te: ThumbnailTaskEntity) => te.listener.onError(error));

      this.taskReady(task);
      this.runningRequests--;
      this.run();
    };

    curImg.src = task.path;
  };

  removeTask(taskEntry: ThumbnailTaskEntity) {

    const index = taskEntry.parentTask.taskEntities.indexOf(taskEntry);
    if (index === -1) {
      throw new Error('ThumbnailTaskEntity not exist on Task');
    }
    taskEntry.parentTask.taskEntities.splice(index, 1);

    if (taskEntry.parentTask.taskEntities.length === 0
      && taskEntry.parentTask.inProgress === false) {
      const i = this.que.indexOf(taskEntry.parentTask);
      if (i === -1) {
        throw new Error('ThumbnailTask not exist');
      }
      this.que.splice(i, 1);
    }

  }

  loadIcon(media: MediaIcon, priority: ThumbnailLoadingPriority, listener: ThumbnailLoadingListener): ThumbnailTaskEntity {


    return this.load(media.getIconPath(),
      () => {
        media.iconLoaded();
        this.galleryCacheService.mediaUpdated(media.media);
      },
      priority,
      listener);
  }

  loadImage(media: Media, priority: ThumbnailLoadingPriority, listener: ThumbnailLoadingListener): ThumbnailTaskEntity {

    return this.load(media.getThumbnailPath(),
      () => {
        media.thumbnailLoaded();
        this.galleryCacheService.mediaUpdated(media.media);
      },
      priority,
      listener);
  }

  loadPersonThumbnail(person: PersonDTO, priority: ThumbnailLoadingPriority, listener: ThumbnailLoadingListener): ThumbnailTaskEntity {

    return this.load(Person.getThumbnailUrl(person),
      () => {
      },
      priority,
      listener);

  }


  private load(path: string,
               onLoaded: () => void,
               priority: ThumbnailLoadingPriority,
               listener: ThumbnailLoadingListener): ThumbnailTaskEntity {
    let thTask: ThumbnailTask = null;
    // is image already queued?
    for (let i = 0; i < this.que.length; i++) {
      if (this.que[i].path === path) {
        thTask = this.que[i];
        break;
      }
    }
    if (thTask == null) {
      thTask = {
        inProgress: false,
        taskEntities: [],
        onLoaded: onLoaded,
        path: path
      };
      this.que.push(thTask);
    }

    const thumbnailTaskEntity = {priority: priority, listener: listener, parentTask: thTask};
    thTask.taskEntities.push(thumbnailTaskEntity);
    if (thTask.inProgress === true) {
      listener.onStartedLoading();
    }


    setTimeout(this.run, 0);
    return thumbnailTaskEntity;
  }

  private getNextTask(): ThumbnailTask {
    if (this.que.length === 0) {
      return null;
    }

    let highestPriority: ThumbnailTask = null;
    let currentPriority: ThumbnailLoadingPriority = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < this.que.length; i++) {
      for (let j = 0; j < this.que[i].taskEntities.length; j++) {
        if (this.que[i].inProgress === false) {
          if (highestPriority == null || currentPriority < this.que[i].taskEntities[j].priority) {
            highestPriority = this.que[i];
            currentPriority = this.que[i].taskEntities[j].priority;
            if (currentPriority === ThumbnailLoadingPriority.extraHigh) {
              return highestPriority;
            }
          }
        }
      }
    }

    return highestPriority;
  }

  private taskReady(task: ThumbnailTask) {
    const i = this.que.indexOf(task);
    if (i === -1) {
      if (task.taskEntities.length !== 0) {
        console.error('ThumbnailLoader: can\'t find poolTask to remove');
      }
      return;
    }
    this.que.splice(i, 1);
  }
}


export interface ThumbnailLoadingListener {
  onStartedLoading: () => void;
  onLoad: () => void;
  onError: (error: any) => void;
}


export interface ThumbnailTaskEntity {
  priority: ThumbnailLoadingPriority;
  listener: ThumbnailLoadingListener;
  parentTask: ThumbnailTask;
}

interface ThumbnailTask {
  inProgress: boolean;
  taskEntities: Array<ThumbnailTaskEntity>;
  path: string;
  onLoaded: () => void;
}

