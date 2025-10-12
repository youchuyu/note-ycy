import { current } from 'immer';
import { useMemo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import ParallelWorldButton from '@/src/bizComponents/parallelWorld/others/ParallelWorldButton';
import { PARALLEL_WORLD_PAGES_ENUM, useWorldStore } from '@/src/store/world';
import { colors } from '@/src/theme';
import { StyleSheet } from '@/src/utils';
import { Icon } from '@Components/icons';
import { Text } from '@Components/text';
import TimelineBottom from '../bottomBar/timeline-bottom';
import { useShallow } from 'zustand/react/shallow';

interface BottomBarProps {
  barStyle?: StyleProp<ViewStyle>;
}

export default function ConsumerBottomBar(props: BottomBarProps) {
  const { timeline, plotIndex } = useWorldStore(
    useShallow(state => ({
      plotId: state.plotId,
      currentWorld: state.currentWorld,
      plotIndex: state.plotIndex,
      timeline: state.timelinePlots
    }))
  );

  return (
    <TimelineBottom
      sections={timeline}
      key={timeline.length}
      active={plotIndex}
      onActive={idx => {
        // changeActiveTimelineSectionIdx(idx);
        // getPlot({ plotId: newTimeLine[idx]?.plotId });
      }}
      barRight={
        <ParallelWorldButton
          onPress={() => {
            // switchParallelWorldPage(PARALLEL_WORLD_PAGES_ENUM.PUBLISH);
            useWorldStore.getState().pushWorldRouteStack({
              route: PARALLEL_WORLD_PAGES_ENUM.PUBLISH
            });
          }}
          style={{
            height: 40,
            borderRadius: 20,
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.white
          }}
        >
          <Text style={buttonStyles.$text}>先写到这里</Text>
          <Icon icon="publish_pw" size={16} />
        </ParallelWorldButton>
      }
    />
  );
}

const buttonStyles = StyleSheet.create({
  $text: {
    marginRight: 4,
    fontWeight: '500',
    fontSize: 16,
    color: StyleSheet.currentColors.white
  }
});
