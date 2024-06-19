import { connect, Msg, NatsConnection, NatsError } from "nats.ws";
import { useState, useEffect, useReducer, useCallback } from "react";
import { StatusPayload, rawStatusPayload } from "../types/StatusPayload";

export const natsClientPromise = connect({ servers: "ws://localhost:8443" });

export function useNats() {
  const [nats, setNats] = useState<NatsConnection | null>(null);

  useEffect(() => {
    if (nats) return;

    natsClientPromise
      .then((nc) => setNats(nc))
      .catch((err) => console.error("connect failed", err));
  }, [nats]);

  return nats;
}

export function useNatsSubscription(
  subj: string,
  onMessage: (msg: Msg) => void,
  onError: (err: NatsError) => void
) {
  const nc = useNats();

  useEffect(() => {
    if (!nc) return;

    const sub = nc.subscribe(subj, {
      callback: function (err: NatsError | null, msg: Msg) {
        if (err) {
          onError?.(err);
        } else {
          onMessage(msg);
        }
      },
    });

    return () => sub.unsubscribe();
  }, [nc, onError, onMessage, subj]);
}

type StateDefinition = {
  iras: Map<string, StatusPayload>;
  error: NatsError | null;
};

type Actions =
  | { type: "NEW_MESSAGE"; payload: Msg }
  | { type: "NATS_ERROR"; error: NatsError };

function stateReducer(state: StateDefinition, action: Actions) {
  switch (action.type) {
    case "NEW_MESSAGE": {
      const topic = action.payload.subject;

      // 0       .1  .2     .3      .4       .5     .6
      // area3001.ira.group4.devices.4466cbf3.output.rgb
      const splitTopic = topic.split(".");
      const group = splitTopic[2];
      const id = splitTopic[4];
      // const output = splitTopic?.[6];
      // console.log(id);

      if (!id) {
        console.error("payload, no ID", topic);
        return state;
      }
      if (!group) {
        console.error("payload, no group", topic);
        return state;
      }

      const iras = new Map(state.iras);
      if (splitTopic.length === 5) {
        // Status update like
        // Topic: area3001.ira.testbak.devices.c82b968b1700
        // payload: {"name": "219", "handlers": ["output.dmx_raw", "output.config", "output.configure", "fx.list", "output.rgb", "output.dmx", "fx.run", "fx.stop", "fx.load"], "mem_free": 4150656, "hardware": "ira", "version": "2.0", "mem_alloc": 34112}
        let payload;
        try {
          payload = {
            ...(action.payload.json() as rawStatusPayload),
            id,
            timestamp: new Date(),
          };
          const ira = iras.get(id);
          if (!ira) {
            iras.set(id, payload);
          }
        } catch (err) {
          console.error("payload, not JSON", topic, action.payload.string());
          return state;
        }
      }

      return { ...state, iras, error: null };
    }

    case "NATS_ERROR": {
      return { ...state, error: action.error };
    }

    default:
      return state;
  }
}

export function useIras(subj: string) {
  const [state, dispatch] = useReducer(stateReducer, {
    iras: new Map(),
    error: null,
  } satisfies StateDefinition);

  useNatsSubscription(
    subj,
    useCallback((msg) => dispatch({ type: "NEW_MESSAGE", payload: msg }), []),
    useCallback((err) => dispatch({ type: "NATS_ERROR", error: err }), [])
  );

  return state;
}
