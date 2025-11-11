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
    if (typeof db.addAdminAction === 'function') {
      await db.addAdminAction(
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
