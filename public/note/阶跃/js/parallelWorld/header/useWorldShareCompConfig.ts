import { useMemoizedFn } from 'ahooks';
import { router } from 'expo-router';
import stableStringify from 'json-stable-stringify';
import { useMemo } from 'react';
import { shareCompPresets } from '@/src/components/share/channelConfig';
import {
  ChannelConfig,
  DisableShareTypeList,
  DisableShareTypeListForAuditing,
  ShareCompPreset
} from '@/src/components/share/typings';
import {
  genDeleteDetailItemConfig,
  genDislikeConfig,
  genReportItemConfig,
  genSharePostImageItemConfig
} from '@/src/components/shareButton/CommonShareButton';
import { REMOTE_ICON_URL, SHARE_WORLD_URL } from '@/src/constants';
import { useAuthStore } from '@/src/store/authInfo';
import { useDetailStore } from '@/src/store/detail';
import { useWorldStore } from '@/src/store/world';
import { Theme } from '@/src/theme/colors/type';
import {
  GameType,
  ShareImageType,
  ShareInfo,
  ShareTemplateName
} from '@/src/types';
import { abstractActStoryText, getAllActItemsText } from '../genCard';
import { useShallow } from 'zustand/react/shallow';

export function useDetailShareCompConfig(params: {
  cardId: string;
  //   onSharing?: () => void;
  //   onCloseSharing?: () => void;
}) {
  const { cardId } = params;

  const { uid } = useAuthStore(
    useShallow(state => ({
      uid: state.uid
    }))
  );

  const { control, commonInfo } = useDetailStore(
    useShallow(state => {
      const info = state.getDetail(cardId);
      return {
        control: info?.control,
        commonInfo: info?.commonInfo
      };
    })
  );

  const shareDisabled = control?.sharable === false;

  const auditing = control?.censoring === true;

  const isMine =
    commonInfo?.profile?.uid !== undefined && commonInfo?.profile?.uid === uid;

  const getDetailShareInfo: () => ShareInfo = useMemoizedFn(() => {
    const currentWorld = useWorldStore.getState().currentWorld;
    const cardId = currentWorld?.cardId;
    const plotId = currentWorld?.getCurrentPlotId();
    const currentPlot = currentWorld?.getCurrentPlot();
    const actId2 = currentPlot?.getCurrentActId();
    const shareImageUrl =
      SHARE_WORLD_URL + `?id=${cardId}&pid=${plotId}&actid=${actId2}`;
    const actItems = currentPlot?.getCurrentAct()?.getItems() || [];
    const story = abstractActStoryText(actItems);
    const desc = story || getAllActItemsText(actItems, '\n');
    const images = currentPlot?.queryImages();
    return {
      contentid: cardId || '',
      // 待替换为剧本name
      title: currentWorld?.world?.title ?? '',
      thumbnail: auditing ? REMOTE_ICON_URL : undefined,
      description: desc,
      url: shareImageUrl,
      // 待替换为当前的幕 index
      imageIndex: (currentPlot?.actIndex || 0) + 1,
      images: images?.map(item => item?.imageUrl || '') || []
    };
  });

  const shareCompConfigs = useMemo(() => {
    let channels = [...shareCompPresets[ShareCompPreset.WORLD_CONTENT_SHARE]];
    let operations: ChannelConfig[] = [
      ...shareCompPresets[ShareCompPreset.CONTENT_OPERATIONS]
    ];

    operations.push(
      genSharePostImageItemConfig({
        detailId: cardId || '',
        getShareInfo: () => {
          const shareInfo = getDetailShareInfo?.() || {};
          return {
            shareInfo,
            type: ShareImageType.image,
            shareTemplateName: ShareTemplateName.world,
            extra: stableStringify(commonInfo?.profile || {})
          };
        },
        theme: Theme.DARK
      })
    );

    !isMine &&
      operations.push(
        genDislikeConfig({
          contentId: cardId,
          gameType: GameType.WORLD,
          uid: commonInfo?.profile?.uid
        })
      );

    operations.push(
      isMine
        ? genDeleteDetailItemConfig({
            detailId: cardId,
            onSuccess: () => router.back()
          })
        : genReportItemConfig({
            contentid: cardId
          })
    );

    const disabledList = shareDisabled
      ? DisableShareTypeList
      : auditing
        ? DisableShareTypeListForAuditing
        : [];

    if (disabledList.length) {
      operations = operations.map(item => {
        const disabled = item.type && disabledList.includes(item.type);
        return {
          ...item,
          disabled,
          disabledToast: auditing ? '作品审核中 请稍后再试' : undefined
        };
      });
      channels = channels.map(item => {
        const disabled = item.type && disabledList.includes(item.type);
        return {
          ...item,
          disabled,
          disabledToast: auditing ? '作品审核中 请稍后再试' : undefined
        };
      });
    }

    return [channels, operations];
  }, [commonInfo, isMine, shareDisabled, auditing]);

  return { isMine, shareCompConfigs, getShareInfo: getDetailShareInfo };
}
