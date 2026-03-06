export type CourseBasic = {
  id: string;
  name: string;
  status: CourseStatus;
};

export type Course = {
  id: string;
  downloadLink: string;
  name: string;
  units: Array<Unit>;
  labels?: Array<Label>;
  status: CourseStatus;
  isDownloaded?: boolean;
};

export enum CourseStatus {
  New = 'New',
  Running = 'Running',
  Closed = 'Closed',
}

export type Unit = {
  contentId: number;
  contentHash: string;
  name: string;
  lastEditedAt?: Date;
  sortingIndex: number;
  label?: Label;
  results?: XAPIResult[];
};

export type Label = {
  name: string;
  color: string;
  id: string;
};

export interface CourseScreenParams {
  course: Course;
}

export interface XAPIStatement {
  verb?: XAPIVerb;
  object?: XAPIObject;
  result?: XAPIResult;
  context?: XAPIContext;
  actor?: XAPIActor;
  children?: XAPIStatement;
  statement?: XAPIStatement;
}

interface XAPIObject {
  id: string;
  objectType: string;
  definition?: XAPIDefinition;
}

export type User = {
  userId: string;
  email: string;
  idToken: string;
  refreshToken: string;
};

export type InviteUser = {
  id: number;
  email: string;
};

interface XAPIDefinition {
  extensions?: {
    'http://h5p.org/x-api/h5p-local-content-id'?: string;
    'http://h5p.org/x-api/h5p-subContentId'?: string;
  };
  name?: {
    'en-US': string;
  };
}

export interface XAPIResult {
  score?: {
    raw?: number;
    min?: number;
    max?: number;
    scaled?: number;
  };
  completion?: boolean;
  success?: boolean;
  duration?: string;
}

interface XAPIContext {
  contextActivities?: {
    parent?: XAPIActivity[];
    category?: XAPIActivity[];
  };
}

interface XAPIActivity {
  id: string;
  objectType: string;
}

interface XAPIActor {
  name?: string;
  mbox?: string;
  objectType: string;
  account?: {
    name: string;
    homePage: string;
  };
}

interface XAPIVerb {
  id: string;
  display: {
    'en-US': string;
  };
}
