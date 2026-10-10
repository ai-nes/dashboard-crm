/**
 * Student ownership against the Nest backend, keeping the service-shaped
 * request/response the owner picker already understands.
 */
import { nestRequest } from "./nest-client";

export interface NestAssignableOwner {
  name: string;
  label: string;
  profile: string;
  role: string;
  function: string;
  team: string;
  teamId: string;
  campus: string;
}

interface OwnershipEvent {
  id: string;
  eventType: string;
  aggregateRevision: number;
  nextOwnerUserId: string | null;
}

export async function nestAssignableOwners(
  studentId: string,
): Promise<{ owners: NestAssignableOwner[] }> {
  const result = await nestRequest<{ owners: NestAssignableOwner[] }>(
    `/api/v1/students/${encodeURIComponent(studentId)}/ownership-targets`,
  );
  return { owners: result.owners };
}

export async function nestAssignOwner(input: {
  studentId: string;
  ownerId: string;
  targetTeamId: string;
  reason: string;
  expectedRevision: number;
  idempotencyKey: string;
}): Promise<Record<string, unknown>> {
  const result = await nestRequest<{ data: OwnershipEvent }>(
    `/api/v1/students/${encodeURIComponent(input.studentId)}/ownership`,
    {
      method: "POST",
      body: {
        target: {
          kind: "owner",
          userId: input.ownerId,
          teamId: input.targetTeamId,
        },
        expectedRevision: input.expectedRevision,
        reason: input.reason,
        idempotencyKey: input.idempotencyKey,
      },
    },
  );
  return {
    student: input.studentId,
    owner: result.data.nextOwnerUserId,
    ownership_revision: result.data.aggregateRevision,
    event: result.data.id,
  };
}
