export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum TimePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum TransactionTitle {
  CHAT_SESSION = 'Chat Session',
  CALL_SESSION = 'Call Session',
  VIDEO_SESSION = 'Video Session',
  WITHDRAWAL = 'Withdrawal',
  REFUND = 'Refund',
  BONUS = 'Bonus',
  ADJUSTMENT = 'Adjustment',
}

export enum WithdrawStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
