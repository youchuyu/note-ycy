import { FlexStyle, View } from 'react-native';
import { Image } from '@/src/components';

export enum GUIDE_LINE_DIR {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

const rotateMap = {
  [GUIDE_LINE_DIR.DOWN]: 0,
  [GUIDE_LINE_DIR.LEFT]: 90,
  [GUIDE_LINE_DIR.UP]: 180,
  [GUIDE_LINE_DIR.RIGHT]: 270
};

const flexMap: { [K in GUIDE_LINE_DIR]: FlexStyle['flexDirection'] } = {
  [GUIDE_LINE_DIR.DOWN]: 'column',
  [GUIDE_LINE_DIR.LEFT]: 'row-reverse',
  [GUIDE_LINE_DIR.UP]: 'column-reverse',
  [GUIDE_LINE_DIR.RIGHT]: 'row'
};

const flexMapReverse: { [K in GUIDE_LINE_DIR]: FlexStyle['flexDirection'] } = {
  [GUIDE_LINE_DIR.DOWN]: 'column-reverse',
  [GUIDE_LINE_DIR.LEFT]: 'row',
  [GUIDE_LINE_DIR.UP]: 'column',
  [GUIDE_LINE_DIR.RIGHT]: 'row-reverse'
};

interface GuideLineProps {
  dir: GUIDE_LINE_DIR;
  count: number;
  size: { height: number; width: number };
  fade?: number;
  isFadeIn?: boolean;
  // width: number;
}

const GUIDE_VERTICAL = require('@Assets/image/parallel-world/guide.png');
const GUIDE = require('@Assets/image/parallel-world/guide-h.png');

export default function GuideLine({
  dir,
  count,
  size,
  isFadeIn = true,
  fade = 0.1
}: GuideLineProps) {
  const isVertical = dir === GUIDE_LINE_DIR.DOWN || dir === GUIDE_LINE_DIR.UP;

  return (
    <View
      style={{
        flexDirection: isFadeIn ? flexMap[dir] : flexMapReverse[dir],
        justifyContent: 'flex-end'
      }}
    >
      {Array(count)
        .fill(1)
        .map((_, idx) => (
          <Image
            key={idx}
            source={isVertical ? GUIDE_VERTICAL : GUIDE}
            contentFit="contain"
            style={[
              isVertical
                ? {
                    width: size.width,
                    height: size.height
                  }
                : { width: size.height, height: size.width },
              {
                transform: [
                  {
                    rotate: `${dir === GUIDE_LINE_DIR.UP || dir === GUIDE_LINE_DIR.LEFT ? 180 : 0}deg`
                  }
                ],
                opacity: 1 - idx * fade
              }
            ]}
          />
        ))}
    </View>
  );
}
