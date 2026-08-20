export enum SessionType {
  CHAT = 'chat',
  CALL = 'call',
  // VIDEO = 'video',
}

export enum SessionStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum FilterType {
  ALL = 'all',
  ACTIVE = 'active',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SessionTypeFilter {
  ALL = 'all',
  CHAT = 'chat',
  CALL = 'call',
}

export enum DateFilter {
  ALL = 'all',
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  WEEK = 'week',
  MONTH = 'month',
}

export enum AmountFilter {
  ALL = 'all',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
