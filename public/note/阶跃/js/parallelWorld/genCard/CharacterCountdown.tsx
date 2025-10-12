import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { parallelWorldColors } from '@/src/bizComponents/parallelWorld/constants';
import { typography } from '@/src/theme';
import { createStyle } from '@/src/utils';
import { Text } from '@Components/text';
import UserDisplay from '../others/user-display';

export default function CharacterCountdown({
  avatarUrl
}: {
  avatarUrl?: string;
}) {
  const [counter, setCounter] = useState(10);

  const frameRef = useRef<number>();

  useEffect(() => {
    const interval = 1000;
    let time = performance.now();
    const step = (now: number) => {
      frameRef.current = requestAnimationFrame(step);
      if (now - time >= interval) {
        time = now;
        setCounter(count => {
          const newCount = count - 1;
          if (newCount < 0 && frameRef.current) {
            cancelAnimationFrame(frameRef.current);
          }
          return newCount;
        });
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <View
      style={{
        position: 'absolute',
        height: 50,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
        // backgroundColor: 'red'
      }}
    >
      <Text style={styles.$basicText}>正在召唤主角&nbsp;</Text>
      {avatarUrl && <UserDisplay uri={avatarUrl} />}
      {counter >= 0 && (
        <>
          <Text style={styles.$basicText}>&nbsp;(倒计时</Text>
          <Text
            style={[
              styles.$basicText,
              {
                color: parallelWorldColors.fontGlow,
                width: 24,
                textAlign: 'center'
              }
            ]}
          >
            {`${counter}s`}
          </Text>
          <Text style={styles.$basicText}>)</Text>
        </>
      )}
    </View>
  );
}

const styles = createStyle({
  $basicText: {
    fontFamily: typography.fonts.world,
    fontSize: 18,
    color: 'white'
  }
});
