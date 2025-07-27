import type { ICallback } from "./types/StateEvents";

export interface IDebugEvent<T> {
  type: string,
  id: string,
  streamType: string,
  payload: T,
}

export type DebugListener<T> = (event: MessageEvent<T>) => any;


export function debugAnnounce<T>(name: string, type: string, id: string, initial: T) {
  setTimeout(function () {
    window.postMessage(
      {
        type: 'react-state-event-devTool-streamId',
        payload: {
          debugName: name,
          streamType: type,
        },
        id,
        init: initial
      },
      '*'
    );
  }, 1000);
};

export function debugAddListener<T>(id: string, type: string, setValue: ICallback<T>): DebugListener<IDebugEvent<T>> {
  const listener: DebugListener<IDebugEvent<T>> = (event: MessageEvent<IDebugEvent<T>>) => {
    if (
      event.origin !== window.origin ||
      event.source !== window ||
      event.data.type !== 'react-state-event-devTool-set' ||
      event.data.id !== id ||
      event.data.streamType !== type
    ) {
      return;
    }
    setValue(event.data.payload);
  };
  window.addEventListener('message', listener);
  return listener;
};

export function debugRemoveListener<T>(listener: (this: Window, ev: MessageEvent<IDebugEvent<T>>) => any) {
  window.removeEventListener('message', listener);
}

export function debugSend<T>(id: string, type: string, success: boolean, value: T | any) {
  window.postMessage(
    {
      type: 'react-state-event-devTool-notify',
      payload: {
        streamType: type,
        streamId: id,
        success,
        value
      }
    },
    '*'
  );
}
