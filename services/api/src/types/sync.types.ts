export interface RawRecord {
  id: string;
  [key: string]: any;
}

export interface TableChanges {
  created: RawRecord[];
  updated: RawRecord[];
  deleted: string[];
}

export interface Changes {
  [tableName: string]: TableChanges;
}

export interface PullRequest {
  lastPulledAt: number | null;
  schemaVersion: number;
  migration?: {
    from: number;
    tables: string[];
    columns: Array<{
      table: string;
      columns: string[];
    }>;
  };
}

export interface PullResponse {
  changes: Changes;
  timestamp: number;
}

export interface PushRequest {
  changes: Changes;
  lastPulledAt: number;
}

export interface PushResponse {
  experimentalRejectedIds?: string[];
}
