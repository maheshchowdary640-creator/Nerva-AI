import { BusinessEvent } from '../types/business';

export const eventService = {
  getEventsByStream(events: BusinessEvent[], stream: BusinessEvent['stream']): BusinessEvent[] {
    return events.filter(e => e.stream === stream);
  },

  getEventsBySeverity(events: BusinessEvent[], severity: BusinessEvent['severity']): BusinessEvent[] {
    return events.filter(e => e.severity === severity);
  },

  getEventsByBranch(events: BusinessEvent[], branchId: string): BusinessEvent[] {
    return events.filter(e => e.branchId === branchId || e.branchId === 'ALL');
  },

  getRecentEvents(events: BusinessEvent[], limit: number = 10): BusinessEvent[] {
    return events.slice(0, limit);
  }
};
