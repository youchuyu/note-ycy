import { router } from 'expo-router';
import { current } from 'immer';
import { useEffect, useMemo } from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { CommonShareButton } from '@/src/components/shareButton/CommonShareButton';
import { SHARE_WORLD_URL } from '@/src/constants';
import { selectState } from '@/src/store/_utils';
import { useAuthStore } from '@/src/store/authInfo';
import { useDetailStore } from '@/src/store/detail';
import { useWorldStore } from '@/src/store/world';
import World, { WorldModel } from '@/src/store/world/models/WorldModel';
import { getThemeColor } from '@/src/theme/colors/common';
import { Theme } from '@/src/theme/colors/type';
import { UserProfile } from '@/src/types';
import { ShareTemplateName } from '@/src/types';
import { StyleSheet } from '@/src/utils';
import { WaterMarkType } from '@/src/utils/getWaterMark';
import { stirngRemoveEnter } from '@/src/utils/opt/replace';
import { reportClick } from '@/src/utils/report';
import { Avatar } from '@Components/avatar';
import { Follow } from '@Components/follow';
import { ButtonPreset } from '@Components/primaryButton/PresetButton/typing';
import { ShareButton } from '@Components/shareButton';
import { Text } from '@Components/text';
import ACBadge from '../../achievement/badge';
import { SCREEN_WIDTH } from '../../nestedScrollView';
import { abstractActStoryText, getAllActItemsText } from '../genCard';
import { TimelinePlot } from '@/proto-registry/src/web/raccoon/world/world_pb';
import { useShallow } from 'zustand/react/shallow';
import { useDetailShareCompConfig } from './useWorldShareCompConfig';

const $headerWrapStyle: ViewStyle = {
  alignItems: 'center',
  marginLeft: -5
};

const st = StyleSheet.create({
  $title: {
    fontSize: 14,
    lineHeight: 26,
    marginLeft: 8,
    maxWidth: SCREEN_WIDTH < 375 ? 120 : 160,
    overflow: 'hidden',
    fontWeight: '600'
  }
});

export function HeaderLeft({ detailId }: { detailId: string }) {
  const { plotId, plotIndex, currentWorld } = useWorldStore(
    useShallow(state => ({
      plotId: state.plotId,
      currentWorld: state.currentWorld,
      plotIndex: state.plotIndex
    }))
  );

  const currentAuthor = useMemo(
    () => currentWorld?.getTlPlot(plotIndex)?.author,
    [plotIndex, currentWorld]
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        const id = currentAuthor?.uid;
        reportClick('post_user', {
          module: 'world',
          detailId
        });
        if (id) {
          router.push({
            pathname: `/user/${id}`
          });
        }
      }}
      style={[StyleSheet.rowStyle, $headerWrapStyle]}
    >
      <Avatar
        profile={currentAuthor}
        size={36}
        onGotoUserpage={() => {
          // useWorldStore.getState().reset();
        }}
      />
      <Text
        style={[st.$title, { color: getThemeColor(Theme.DARK).fontColor }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {stirngRemoveEnter(currentAuthor?.name)}
      </Text>
      <ACBadge
        badgeIconStyle={{
          marginLeft: 4
        }}
        icon={currentAuthor?.simpleAchievementInfo?.achievementIconUrl}
      />
    </TouchableOpacity>
  );
}

const useFollow = ({
  detailId,
  user,
  plotInfo
}: {
  detailId: string;
  user: UserProfile | null;
  plotInfo: TimelinePlot | undefined;
}) => {
  const { commonInfo, updateDetail } = useDetailStore(
    useShallow(state => {
      const info = state.getDetail(detailId);
      return {
        commonInfo: info?.commonInfo,
        updateDetail: state.updateDetail
      };
    })
  );

  function onUpdatefollow(followed: boolean) {
    reportClick('follow_button', {
      module: '__normal',
      contentid: detailId,
      followed
    });
    updateDetail(detailId, {
      commonInfo: {
        ...commonInfo,
        followed
      }
    });
  }

  /* 关注相关逻辑 */
  // 未登陆的用户显示关注
  // 已登陆但是detail请求未加载完的用户，先不显示关注
  // detail加载完之后，再根据数据做显示
  const showFollow = !user || (user && plotInfo?.isFollowed !== undefined);

  return { onUpdatefollow, showFollow };
};

export function HeaderRight({ detailId }: { detailId: string }) {
  const { plotId, actIndex, plotIndex, currentWorld } = useWorldStore(
    useShallow(state => ({
      plotId: state.plotId,
      currentWorld: state.currentWorld,
      plotIndex: state.plotIndex,
      actIndex: state.actIndex
    }))
  );

  const currentTLPlot = useMemo(
    () => currentWorld?.getTlPlot(plotIndex),
    [plotIndex, currentWorld]
  );

  const { user } = useAuthStore(
    useShallow(state => ({
      user: state.userInfo
    }))
  );

  // 点击关注按钮
  const { onUpdatefollow, showFollow } = useFollow({
    detailId,
    plotInfo: currentTLPlot,
    user
  });

  // 分享所需信息
  const { getShareInfo, shareCompConfigs, isMine } = useDetailShareCompConfig({
    cardId: detailId
  });

  const { control } = useDetailStore(
    useShallow(state => {
      const info = state.getDetail(detailId);
      return {
        control: info?.control
      };
    })
  );

  const shareDisabled = control?.sharable === false;

  if (!currentTLPlot) return null;

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      {showFollow ? (
        <Follow
          followed={currentTLPlot?.isFollowed}
          beingFollowed={Boolean(currentTLPlot?.beingFollowed)}
          uid={currentTLPlot?.author?.uid}
          style={{ marginRight: 12 }}
          theme={ButtonPreset.SOLID_DARK_MODE}
          onUnfollow={() => onUpdatefollow(false)}
          onFollow={() => onUpdatefollow(true)}
        />
      ) : null}
      <CommonShareButton
        theme={Theme.DARK}
        detailId={detailId}
        getShareInfo={getShareInfo}
        isMine={isMine}
        compConfigs={shareCompConfigs}
        waterMarkType={
          shareDisabled ? WaterMarkType.NO_WMK : WaterMarkType.AIGC
        }
      />
    </View>
  );
}
