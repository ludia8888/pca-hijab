import { db } from '../db';
import type { AdminContext } from '../types';

interface AuditDetails {
  [key: string]: unknown;
}

export const logAdminAction = async (
  actionType: string,
  details: AuditDetails = {},
  actor?: AdminContext,
  sessionId: string | null = null
): Promise<void> => {
  if (!actor) {
    return;
  }

  try {
    const maybeAdd = (db as unknown as { addAdminAction?: (
      sessionId: string | null,
      actionType: string,
      actionDetails: unknown,
      performedBy?: string
    ) => Promise<boolean> }).addAdminAction;

    if (typeof maybeAdd === 'function') {
      await maybeAdd(
        sessionId,
        actionType,
        {
          ...details,
          adminId: actor.userId,
          adminRole: actor.role
        },
        actor.email
      );
    } else {
      console.info('[AdminAudit]', {
        actionType,
        details,
        actor: actor.email ?? actor.userId
      });
    }
  } catch (error) {
    console.error('[AdminAudit] Failed to record action', {
      actionType,
      error
    });
  }
};
