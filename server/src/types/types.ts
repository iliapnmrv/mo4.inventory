export type TokenPayload = {
  fio: string;
  id: number;
  account: string;
  projects: Record<string, number>;
};
