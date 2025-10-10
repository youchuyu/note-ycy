// const cardWidth = 180

const easeInQuad = (t: number) => {
  return t * t;
};

const easeOutQuad = (t: number) => {
  return 1 - t * t; // 进度平方，用于模拟速度逐渐增加
};

export type MoveAnimationInstance = { id: number };

interface EasyMoveProps {
  speedPer: number; // 0-1
  minSpeedPer: number; // 0-1
  maxSpeed: number; // 速度系数
  cardWidth: number;
  speedupDur: number;
  speedLowDur: number;
}

class EaseMove {
  speedPer: number;
  cardWidth: number;
  maxSpeed: number = 0.5;
  minSpeedPer: number = 0.2;
  speedupDur: number = 4000;
  speedLowDur: number = 4000;

  constructor({
    speedPer = 0,
    cardWidth = 100,
    maxSpeed = 0.5,
    minSpeedPer = 0.2,
    speedupDur = 4000,
    speedLowDur = 4000,
  }: Partial<EasyMoveProps>) {
    this.speedPer = speedPer;
    this.maxSpeed = maxSpeed;
    this.cardWidth = cardWidth;
    this.minSpeedPer = minSpeedPer;
    this.speedupDur = speedupDur;
    this.speedLowDur = speedLowDur;
  }

  startMove(els: NodeListOf<HTMLElement>) {
    const instance: MoveAnimationInstance = { id: null };

    const maxSpeed = this.maxSpeed;
    const speedupDur = this.speedupDur;
    const cardWidth = this.cardWidth;

    const elWidth = parseFloat(window.getComputedStyle(els[0]).width);
    // 初始化位置为最后一张卡片
    let roundMoves = Array.from({ length: els.length }).map(
      () => elWidth - cardWidth
    );

    let totalTime = 0;
    let lastTimestamp = 0;

    const moveSpeedUp = ({
      el,
      _move,
      idx,
      elWidth,
    }: {
      el: HTMLElement;
      _move: number;
      idx: number;
      elWidth: number;
    }) => {
      const _diff = idx * elWidth;

      roundMoves[idx] += _move;

      el.style.transform = `translateX(${-roundMoves[idx]}px)`;

      const moveExceeded = roundMoves[idx] - (2 * elWidth + _diff - cardWidth);
      if (Math.floor(Math.abs(moveExceeded / _move)) <= 1) {
        // console.log('moveSpeedUp speed', this.speedPer)

        roundMoves[idx] = -cardWidth + _diff + moveExceeded;
      }
    };

    const startMove = (timestamp: DOMHighResTimeStamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      // 暂时先不要
      // const elWidth = parseFloat(window.getComputedStyle(els[0]).width)

      const deltaTime = timestamp - lastTimestamp;

      lastTimestamp = timestamp;

      totalTime += deltaTime;

      if (this.speedPer < 1) {
        const progress = Math.min(totalTime / speedupDur, 1);
        this.speedPer = easeInQuad(progress);
      }

      const _move = this.speedPer * maxSpeed * deltaTime;

      els.forEach((element, idx) => {
        moveSpeedUp({ el: element, _move, idx, elWidth });
      });
      instance.id = requestAnimationFrame(startMove);
    };

    instance.id = requestAnimationFrame(startMove);

    return instance;
  }

  endMove(els: NodeListOf<HTMLElement>) {
    const instance: MoveAnimationInstance = { id: null };

    const maxSpeed = this.maxSpeed;
    const minSpeedPer = this.minSpeedPer;
    const speedLowDur = this.speedLowDur;
    const cardWidth = this.cardWidth;

    const roundMoves = [];
    els.forEach((el, idx) => {
      roundMoves[idx] = -1 * getTransform(el);
    });

    // console.log('roundMoves====>', roundMoves)

    let totalTime = Math.sqrt(1 - this.speedPer) * speedLowDur;
    let lastTimestamp = 0;

    function moveSlowDown({
      el,
      _move,
      idx,
      elWidth,
    }: {
      el: HTMLElement;
      _move: number;
      idx: number;
      elWidth: number;
    }) {
      roundMoves[idx] += _move;
      const _diff = idx * elWidth;

      const roundMove = roundMoves[idx];

      el.style.transform = `translateX(${-roundMove}px)`;

      const moveExceeded = roundMoves[idx] - (2 * elWidth + _diff - cardWidth);

      if (Math.floor(Math.abs(moveExceeded / _move)) <= 1) {
        roundMoves[idx] = -cardWidth + _diff + moveExceeded;
      }
    }

    const stopMove = (timestamp: DOMHighResTimeStamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaTime = timestamp - lastTimestamp;

      const elWidth = parseFloat(window.getComputedStyle(els[0]).width);

      totalTime += deltaTime;

      lastTimestamp = timestamp;

      const progress = Math.min(totalTime / speedLowDur, 1);

      this.speedPer = easeOutQuad(progress);

      const _move = Math.max(minSpeedPer, this.speedPer) * deltaTime * maxSpeed;

      if (
        this.speedPer <= minSpeedPer &&
        Math.ceil(Math.abs(roundMoves[0] - (elWidth - cardWidth)) / _move) <= 1
      ) {
        cancelAnimationFrame(instance.id);
        setTimeout(() => {
          els.forEach((el) => {
            el.style.transform = `translateX(${-(elWidth - cardWidth)}px)`;
          });
        });

        // console.log('end position===>', position, elWidth - cardWidth)
        return;
      }

      els.forEach((element, idx) => {
        moveSlowDown({ el: element, _move: _move, idx: idx, elWidth: elWidth });
      });

      instance.id = requestAnimationFrame(stopMove);
    };

    instance.id = requestAnimationFrame(stopMove);
  }

  async endMoveInLastLoop(
    els: NodeListOf<HTMLElement>,
    {
      minSpeedPer = this.minSpeedPer,
      speedLowDur = this.speedLowDur,
    }: { minSpeedPer?: number; speedLowDur?: number }
  ): Promise<EaseMove> {
    // console.log('endMove=======>', els)
    const instance: MoveAnimationInstance = { id: null };

    const elWidth = parseFloat(window.getComputedStyle(els[0]).width);

    const maxSpeed = this.maxSpeed;
    // const minSpeedPer = minSpeed
    // const speedLowDur = this.speedLowDur
    const cardWidth = this.cardWidth;

    let isSlowDownBegin = false;

    const roundMoves = [];
    els.forEach((el, idx) => {
      roundMoves[idx] = -1 * getTransform(el);
    });

    // console.log('roundMoves====>', roundMoves)
    // console.log('stop speed===>', this.speedPer)

    let totalTime = Math.sqrt(1 - this.speedPer) * speedLowDur;
    let lastTimestamp = 0;

    return new Promise((resolve) => {
      const moveSlowDown = ({
        el,
        _move,
        idx,
        elWidth,
      }: {
        el: HTMLElement;
        _move: number;
        idx: number;
        elWidth: number;
      }) => {
        roundMoves[idx] += _move;
        const _diff = idx * elWidth;

        const roundMove = roundMoves[idx];

        el.style.transform = `translateX(${-roundMove}px)`;

        const moveExceeded =
          roundMoves[idx] - (2 * elWidth + _diff - cardWidth);

        if (Math.floor(Math.abs(moveExceeded / _move)) <= 1) {
          roundMoves[idx] = -cardWidth + _diff + moveExceeded;

          if (!isSlowDownBegin && idx === 0) {
            isSlowDownBegin = true;
          }
        }
      };

      const stopMove = (timestamp: DOMHighResTimeStamp) => {
        if (!lastTimestamp) {
          lastTimestamp = timestamp;
        }

        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        if (this.speedPer > minSpeedPer) {
          if (isSlowDownBegin) {
            let progress = 0;
            totalTime += deltaTime;
            progress = Math.min(totalTime / speedLowDur, 1);
            // this.speedPer = Math.max(easeOutQuad(progress), minSpeedPer)
            this.speedPer = Math.min(
              Math.max(easeOutQuad(progress), minSpeedPer),
              this.speedPer
            );
            // console.log(
            // 	'endMoveInLastLoop totalTime ==> ',
            // 	totalTime,
            // 	this.speedPer,
            // 	minSpeedPer
            // )
          }
        }

        const _move =
          Math.max(minSpeedPer, this.speedPer) * deltaTime * maxSpeed;

        if (
          isSlowDownBegin &&
          Math.ceil(Math.abs(roundMoves[0] - (elWidth - cardWidth)) / _move) <=
            1
        ) {
          // console.log('endMoveInLastLoop ===>speedPer', this.speedPer)

          cancelAnimationFrame(instance.id);
          resolve(this);
          return;
        }

        els.forEach((element, idx) => {
          moveSlowDown({
            el: element,
            _move: _move,
            idx: idx,
            elWidth: elWidth,
          });
        });

        instance.id = requestAnimationFrame(stopMove);
      };

      instance.id = requestAnimationFrame(stopMove);
    });
  }

  slideToLast(els: NodeListOf<HTMLElement>): Promise<EaseMove> {
    const instance: MoveAnimationInstance = { id: null };

    const maxSpeed = this.maxSpeed;
    const minSpeedPer = this.minSpeedPer;
    const speedLowDur = this.speedLowDur;
    const cardWidth = this.cardWidth;

    const roundMoves = [];
    els.forEach((el, idx) => {
      roundMoves[idx] = -1 * getTransform(el);
    });

    const elWidth = parseFloat(window.getComputedStyle(els[0]).width);

    let totalTime = Math.sqrt(1 - this.speedPer) * speedLowDur;

    let lastTimestamp = 0;

    return new Promise((resolve) => {
      const moveSlowDown = ({
        el,
        _move,
        idx,
        elWidth,
      }: {
        el: HTMLElement;
        _move: number;
        idx: number;
        elWidth: number;
      }) => {
        roundMoves[idx] += _move;
        const _diff = idx * elWidth;

        const roundMove = roundMoves[idx];

        el.style.transform = `translateX(${-roundMove}px)`;

        const moveExceeded =
          roundMoves[idx] - (2 * elWidth + _diff - cardWidth);

        if (Math.floor(Math.abs(moveExceeded / _move)) <= 1) {
          roundMoves[idx] = -cardWidth + _diff + moveExceeded;
        }
      };

      const stopMove = (timestamp: DOMHighResTimeStamp) => {
        if (!lastTimestamp) {
          lastTimestamp = timestamp;
        }

        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        if (this.speedPer > minSpeedPer) {
          totalTime += deltaTime;
          const progress = Math.min(totalTime / speedLowDur, 1);
          this.speedPer = Math.min(
            Math.max(easeOutQuad(progress), minSpeedPer),
            this.speedPer
          );
          // console.log('slideToLast totalTime ==> ', totalTime, this.speedPer)
        }

        const _move =
          Math.max(minSpeedPer, this.speedPer) * maxSpeed * deltaTime;

        if (
          Math.ceil(Math.abs(roundMoves[0] - (elWidth - cardWidth)) / _move) <=
          1
        ) {
          cancelAnimationFrame(instance.id);

          setTimeout(() => {
            els.forEach((el) => {
              el.style.transform = `translateX(${-(elWidth - cardWidth)}px)`;
            });
            resolve(this);
          });

          return;
        }

        els.forEach((element, idx) => {
          moveSlowDown({
            el: element,
            _move: _move,
            idx: idx,
            elWidth: elWidth,
          });
        });

        instance.id = requestAnimationFrame(stopMove);
      };

      instance.id = requestAnimationFrame(stopMove);
    });
  }

  resetLastPosition(els) {
    this.speedPer = this.minSpeedPer;
    const elWidth = parseFloat(window.getComputedStyle(els[0]).width);
    const cardWidth = this.cardWidth;
    els.forEach((el) => {
      el.style.transform = `translateX(${-(elWidth - cardWidth)}px)`;
    });
  }
}

const getTransform = (el: HTMLElement) => {
  const transformStr = window.getComputedStyle(el).transform;

  const values = transformStr.match(/matrix.*\((.+)\)/)[1].split(", ");

  if (values.length === 6) {
    // matrix(a, b, c, d, tx, ty) 格式
    return parseFloat(values[4]); // 第五个值是 X 轴的平移
  } else if (values.length === 16) {
    // matrix3d(a1, a2, ..., d13, d14) 格式
    return parseFloat(values[12]); // 第十三个值是 X 轴的平移
  }
};

export const easeMove = new EaseMove({
  maxSpeed: 2,
  speedLowDur: 1500,
  speedupDur: 1000,
  minSpeedPer: 0.2,
  cardWidth: window.innerWidth,
});
