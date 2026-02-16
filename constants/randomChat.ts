// Random chat WebSocket message types
export const RANDOM_EVENTS = {
  JOIN: "random:join",
  MATCHED: "random:matched",
  MESSAGE: "random:message",
  NEW_MESSAGE: "random:new_message",
  TYPING: "random:typing",
  STOP_TYPING: "random:stop_typing",
  PARTNER_TYPING: "random:partner_typing",
  PARTNER_STOP_TYPING: "random:partner_stop_typing",
  LEAVE: "random:leave",
  PARTNER_LEFT: "random:partner_left",
} as const;
