export enum InterState {
  initial = "initial", // 初始状态
  plotstart = "plotstart", // 开始剧情
  typing = "typing", // 开始打字
  typed = "typed", // 打字结束
  choose = "choose", // 展示选项
  choiced = "choiced", //选择完
  resultText = "resultText", // 出结果文本
  result = "result", // 出最终结果
  plotend = "plotend", // 一段剧情结束
  lock = "lock", // 锁住一段剧情
  error = "error",
}

const events = {
  startPlot: {
    from: InterState.initial,
    to: InterState.plotstart,
    after: ["startType"],
  },
  startType: { from: InterState.plotstart, to: InterState.typing },
  stopTypePlot: { from: InterState.typed, to: InterState.plotend },

  stopType: { from: InterState.typing, to: InterState.typed },
  toChoose: { from: InterState.typed, to: InterState.choose },
  choiced: { from: InterState.choose, to: InterState.choiced },

  film: { from: InterState.choiced, to: InterState.resultText },
  result: { from: InterState.resultText, to: InterState.result },
  stopPlot: { from: InterState.result, to: InterState.plotend },
  nextPlot: {
    from: InterState.plotend,
    to: InterState.plotstart,
    after: ["startType"],
  },
  lock: { from: InterState.plotend, to: InterState.lock },
  unlock: { from: InterState.lock, to: InterState.plotend },
  retry: { from: InterState.error, to: InterState.choose },
};

export type Events = typeof events;
export type EventName = keyof typeof events;
export type EventCallbackKeys =
  | "onEnterTyping"
  | "onEnterPlotend"
  | "onEnterPlotstart"
  | "nextPlot"
  | "change";

export type EventCallbacks = Partial<{ [key in EventCallbackKeys]: any }>;

type Props = {
  initial?: InterState | null;
  events?: Events;
  callbacks?: {};
  error?: {};
};

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export class StateMachine {
  state = null;
  events: Partial<Events> = {};
  callbacks: EventCallbacks = {};
  error = {};
  constructor(config: Props) {
    if (config.initial) this.state = config.initial!;

    this.events = config.events!;
    this.setCallBacks(config.callbacks || {});
    this.error =
      config.error ||
      ((name, from, to, args, error, msg, e) => {
        throw e || msg;
      });
  }

  start() {
    this.state = InterState.initial;
  }

  on(eventName: EventCallbackKeys, callback) {
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
    }
    this.callbacks[eventName].push(callback);
  }

  setCallBacks(callbacks: EventCallbacks) {
    for (const eventName in callbacks) {
      const cb = callbacks[eventName];
      this.on(eventName as EventCallbackKeys, cb);
    }
  }

  transition(name, from, to, args, params) {
    if (this.state !== from) {
      console.warn("状态变更不合法", this.state, from, to);
      return false;
    }
    console.log("transition===>", name, from, to);

    const callbacks = this.callbacks[name];
    if (callbacks) {
      callbacks.forEach((callback) => callback(...params));
    }

    const enterCbs = this.callbacks["onEnter" + capitalizeFirstLetter(to)];
    if (enterCbs) {
      enterCbs.forEach((callback) => callback(...params));
    }

    const exitCbs = this.callbacks["onExit" + capitalizeFirstLetter(from)];
    if (exitCbs) {
      exitCbs.forEach((callback) => callback(...params));
    }

    this.state = to;

    const changeCbs = this.callbacks["change"];
    if (changeCbs) {
      changeCbs.forEach((callback) => callback(this.state));
    }

    return true;
  }

  onError() {
    console.log("this.error!!!", this.state);

    this.transition("", this.state, InterState.error, null, null);
  }

  do(
    eventName: EventName,
    config: { forbidAfter?: boolean } = { forbidAfter: false }
  ) {
    const { forbidAfter } = config;
    const event = this.events[eventName];
    console.log("event===>", event);

    // @ts-ignore
    this.transition(eventName, event.from, event.to, event.args, event.params);
    // @ts-ignore
    if (event?.after && !forbidAfter) {
      // @ts-ignore
      event.after.forEach((ev) => {
        this.do(ev);
      });
    }
  }

  getState() {
    return this.state;
  }
}

export const fsm = new StateMachine({
  // initial: InterState.initial,
  events: events,
});
