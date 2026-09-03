import { ACTION_TYPES, type ActionType } from "../types";

import type { ActionCard } from "./card-types";
import ApplicationSupportCard from "./application-support-card";
import CallActionCard from "./call-action-card";
import CampusVisitCard from "./campus-visit-card";
import CounselingCard from "./counseling-card";
import DocumentChecklistCard from "./document-checklist-card";
import EmailComposerCard from "./email-composer-card";
import EventInviteCard from "./event-invite-card";
import GenericActionCard from "./generic-action-card";
import HandoffCard from "./handoff-card";
import MeetingSchedulerCard from "./meeting-scheduler-card";
import MessageComposerCard from "./message-composer-card";
import ParentContactCard from "./parent-contact-card";

export const ACTION_CARD_REGISTRY: Record<ActionType, ActionCard> = {
  CALL: CallActionCard,
  EMAIL: EmailComposerCard,
  MESSAGE: MessageComposerCard,
  COUNSELING: CounselingCard,
  MEETING: MeetingSchedulerCard,
  EVENT_INVITE: EventInviteCard,
  CAMPUS_VISIT: CampusVisitCard,
  DOCUMENT_REQUEST: DocumentChecklistCard,
  APPLICATION_SUPPORT: ApplicationSupportCard,
  PARENT_CONTACT: ParentContactCard,
  HANDOFF: HandoffCard,
};

export { GenericActionCard };

/** The card for `type`, or {@link GenericActionCard} for unknown / missing. */
export function resolveActionCard(
  type: string | null | undefined,
): ActionCard {
  if (type && (ACTION_TYPES as readonly string[]).includes(type)) {
    return ACTION_CARD_REGISTRY[type as ActionType];
  }
  return GenericActionCard;
}
