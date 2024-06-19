export type rawStatusPayload = {
  name: string;
  handlers: string[];
  mem_free: number;
  hardware: string;
  version: string;
  mem_alloc: number;
};
export type StatusPayload = rawStatusPayload & {
  timestamp: Date;
  id: string;
};
