/**
 * Shared contract of the domain adapters in `nest-*-router.ts`. An adapter maps
 * one service operation (an operation id such as `crm.api.user.update_user_role`)
 * onto Nest REST calls, or answers `NOT_HANDLED` for an operation it does not own.
 */
export const NOT_HANDLED = Symbol("not-handled");

export type Params = Record<string, string | undefined>;
export type Body = Record<string, unknown> | undefined;
export type MethodHandler = (
  method: string,
  params: Params,
  body: Body,
) => Promise<unknown>;
