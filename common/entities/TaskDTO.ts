export interface TaskType {
  name: string;
  parameter: any;
}

export enum TaskTriggerType {
  scheduled, periodic
}

export interface TaskTrigger {
  type: TaskTriggerType;
}

export interface ScheduledTaskTrigger extends TaskTrigger {
  type: TaskTriggerType.scheduled;
  time: number;
}

export interface PeriodicTaskTrigger extends TaskTrigger {
  type: TaskTriggerType.periodic;

}

export interface TaskDTO {
  priority: number;
  type: TaskType;
  trigger: TaskTrigger;
}
