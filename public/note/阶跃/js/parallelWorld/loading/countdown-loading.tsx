import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { parallelWorldColors } from '@/src/bizComponents/parallelWorld/constants';
import { selectState } from '@/src/store/_utils';
import { CreateSatus, useWorldStore } from '@/src/store/world';
import { useParallelWorldStore } from '@/src/store/world/parallel-world';
import {
  PLOT_CREATE_STATUS_ENUM,
  useParallelWorldConsumerStore
} from '@/src/store/world/parallel-world-consumer';
import { colors, typography } from '@/src/theme';
import { createStyle } from '@/src/utils';
import { Text } from '@Components/text';
import IDCountdown, { IDCountdownRef } from '../others/id-countdown';
import { useShallow } from 'zustand/react/shallow';
import Lightning from './lightning';
import Narration from './narration';

export default function CountdownLoading() {
  const { toggleParallelWorldLoading } = useParallelWorldStore(
    useShallow(state => selectState(state, ['toggleParallelWorldLoading']))
  );

  const { currentWorld, worldCreateStatus } = useWorldStore(
    useShallow(state => ({
      currentWorld: state.currentWorld,
      worldCreateStatus: state.worldCreateStatus
    }))
  );

  const newWorld = useMemo(() => {
    return currentWorld?.world;
  }, [currentWorld]);

  const { plotCreateStatus, isNewWorldMounted } = useParallelWorldConsumerStore(
    useShallow(state =>
      selectState(state, ['newWorld', 'plotCreateStatus', 'isNewWorldMounted'])
    )
  );

  const countDownRef = useRef<IDCountdownRef>();

  useEffect(() => {
    if (worldCreateStatus !== CreateSatus.world) {
      countDownRef.current?.manualSetTarget(
        String(currentWorld?.world?.worldNum || '')
          ?.split('')
          .map(() => -1)
      );
    } else {
      countDownRef.current?.manualSetTarget(
        String(currentWorld?.world?.worldNum || '')
          ?.split('')
          .map(Number)
      );
    }
  }, [currentWorld, worldCreateStatus]);

  return (
    <Animated.View
      style={{
        alignItems: 'center',
        justifyContent: 'center'
      }}
      // exiting={FadeOut.duration(1000)}
    >
      <View
        style={{
          flexDirection: 'row',
          height: 48,
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}
      >
        {isNewWorldMounted ? (
          <>
            <Text style={fontStyles.$basic}>继续创作</Text>
            {newWorld?.worldNum && (
              <Text
                style={fontStyles.$worldNum}
              >{`${newWorld?.worldNum}号`}</Text>
            )}
            <Text style={fontStyles.$basic}>平行世界</Text>
          </>
        ) : (
          <>
            <Text style={fontStyles.$basic}>正在创建 </Text>
            {newWorld?.worldNum && (
              <>
                <IDCountdown
                  ref={countDownRef}
                  targetId={''}
                  textStyle={[
                    fontStyles.$worldNum,
                    {
                      width: 10
                    }
                  ]}
                  // onLoaded={handleCreatePlot}
                  onEnd={() => {
                    // setCountWorldId('');
                    console.log('onEnd!!!!!!!!!!!!!');

                    toggleParallelWorldLoading(false);
                  }}
                />
                <Text style={fontStyles.$worldNum}>号</Text>
              </>
            )}
            <Text style={fontStyles.$basic}> 平行世界</Text>
          </>
        )}
      </View>
      <Narration />
      <Lightning />
    </Animated.View>
  );
}

const fontStyles = createStyle({
  $basic: {
    fontSize: 14,
    color: colors.white,
    fontFamily: typography.fonts.world
  },
  $worldNum: {
    marginBottom: -2,
    fontSize: 18,
    color: parallelWorldColors.fontGlow,
    fontFamily: typography.fonts.world
  }
});
