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
    // IMPORTANT: call the method on the db instance to preserve `this` binding
    if (typeof (db as any).addAdminAction === 'function') {
      await (db as any).addAdminAction(
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
