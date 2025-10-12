import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, TextStyle, View, ViewStyle } from 'react-native';
import { ShadowedView, shadowStyle } from 'react-native-fast-shadow';
import { TouchableOpacity } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, SheetModal } from '@/src/components';
import { useWorldStore } from '@/src/store/world';
import { currentColors } from '@/src/theme';
import { Image } from '@Components/image';
import { Text } from '@Components/text';
import { StyleSheet } from '@Utils/StyleSheet';
import { useShallow } from 'zustand/react/shallow';
import SectionCard from './SectionCard';
import TLCrad from './TLCard';

const BG = require('@Assets/image/parallel-world/timeline.png');
const DOT = require('@Assets/image/parallel-world/timeline-modal-dot.png');
export default function Timeline() {
  const { actId, plotId, timeline, plotIndex } = useWorldStore(
    useShallow(state => ({
      actId: state.actId,
      plotId: state.plotId,
      plotIndex: state.plotIndex,
      currentWorld: state.currentWorld,
      timeline: state.timelinePlots
    }))
  );
  const [isSectionVisible, setSectionVisible] = useState(false);
  const flatlistRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!timeline.length) return;
    const timer = setTimeout(() => {
      const scrollIndex = Math.min(
        timeline.length - 1,
        Math.max(0, plotIndex || 0)
      );
      flatlistRef.current?.scrollToIndex({
        index: scrollIndex,
        //     animated?: boolean;
        // viewOffset: 0 - 145 * scrollIndex,
        viewPosition: 0
      });
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [timeline]);

  return (
    <>
      <View
        style={{
          position: 'relative',
          marginTop: 15,
          marginBottom: 15,
          height: 52
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: -5,
            width: '100%',
            height: 27
          }}
        >
          <Image source={BG} style={StyleSheet.absoluteFill} />
        </View>
        <FlatList
          contentContainerStyle={{ paddingRight: 65 }}
          ref={flatlistRef}
          horizontal
          data={timeline}
          getItemLayout={getItemLayout}
          renderItem={({ item, index }) => (
            <TLCrad active={index === plotIndex} index={index} item={item} />
          )}
          keyExtractor={item => item.cardId + item.plotId}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
        <ShadowedView
          style={[
            $sectionBtnWrap,
            shadowStyle({
              opacity: 0.4,
              radius: 4,
              offset: [-4, 0],
              color: '#26303B'
            })
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              setSectionVisible(true);
            }}
            style={[StyleSheet.centerStyle, { width: '100%', height: '100%' }]}
          >
            <Icon icon="world_section" size={20} />
            <Text style={$secTitle}>全部章节</Text>
          </TouchableOpacity>
        </ShadowedView>
      </View>
      <SheetModal
        style={{ backgroundColor: '#161C25' }}
        isVisible={isSectionVisible}
        title="请选择你想要拍摄的同款"
        maskShown={true}
        maskOpacity={0.4}
        closeBtn={true}
        remainHeight={0}
        onClose={onClose}
      >
        <View style={[$modalWrap]}>
          <LinearGradient
            style={StyleSheet.absoluteFill}
            colors={['#1E2835', '#161C25']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View
              style={[
                StyleSheet.rowStyle,
                {
                  width: '100%',
                  justifyContent: 'center',
                  gap: 5,
                  paddingTop: 22,
                  marginBottom: 20
                }
              ]}
            >
              <Icon icon="world_section" size={20} />
              <Text style={$modalTitle}>全部章节</Text>
            </View>
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 235,
                height: 131
              }}
            >
              <Image source={DOT} style={StyleSheet.absoluteFill} />
              <Icon
                onPress={onClose}
                size={20}
                color={currentColors.white}
                icon="close2"
                style={{ position: 'absolute', top: 23, right: 22 }}
              />
            </View>
            <FlatList
              contentContainerStyle={{
                paddingHorizontal: 18,
                paddingTop: 20,
                paddingBottom: 40
              }}
              // ref={flatlistRef}

              data={timeline}
              getItemLayout={getSecItemLayout}
              renderItem={({ item, index }) => (
                <SectionCard
                  active={index === plotIndex}
                  index={index}
                  item={item}
                  onClose={onClose}
                />
              )}
              keyExtractor={item => item.cardId + item.plotId}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            ></FlatList>
          </LinearGradient>
        </View>
      </SheetModal>
    </>
  );

  function onClose() {
    setSectionVisible(false);
  }
  function getItemLayout(_: unknown, index: number) {
    return {
      length: timeline.length,
      offset: 145 * index,
      index
    };
  }

  function getSecItemLayout(_: unknown, index: number) {
    return {
      length: timeline.length,
      offset: 74 * index,
      index
    };
  }
}

const $sectionBtnWrap: ViewStyle = {
  position: 'absolute',
  right: 0,
  backgroundColor: '#26303B',
  width: 65,
  height: '100%'
};

const $secTitle: TextStyle = {
  color: '#7FD9FF',
  fontSize: 10,
  fontWeight: '900'
};

const $modalWrap: ViewStyle = {
  width: '100%',
  height: 426,

  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  overflow: 'hidden'
};

const $modalTitle: TextStyle = {
  fontSize: 16,
  fontWeight: '900',
  color: currentColors.white
};
