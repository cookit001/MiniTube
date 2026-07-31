import { z } from 'zod';

// Centralized Access Check
export async function enforceApiAccess(req: Request, requiredRole: string = 'user') {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }
  
  // In a real system, verify the JWT here.
  const token = authHeader.split(' ')[1];
  if (token !== process.env.VALID_API_TOKEN) {
    throw new Error('FORBIDDEN');
  }

  // Role validation logic goes here
  return { userId: 'user_123', role: 'admin' };
}

// Mandatory Audit Logging
export async function logAuditEvent(action: string, actorId: string, metadata: any) {
  // Never skip audit logging. Push to secure log store (e.g., Datadog, CloudWatch).
  console.info(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'AUDIT_LOG',
    action,
    actorId,
    metadata,
  }));
}
