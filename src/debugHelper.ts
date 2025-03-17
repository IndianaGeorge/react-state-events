import type { ICallback } from "./types/StateEvents";

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

export function debugListen<T>(id: string, type: string, setValue: ICallback<T>) {
  window.addEventListener('message', (event) => {
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
  });
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
