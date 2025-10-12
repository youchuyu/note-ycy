import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { PW_PURE_BG_VIDEO } from '@/src/bizComponents/parallelWorld/constants';
import PreloadImg from '@/src/components/emoji/preload-img';
import { createStyle } from '@/src/utils';
import { ResizeMode, Video } from '@Components/video/BaseVideo';

export default function LoadingImg({
  url,
  isLoading,
  size,
  style: $style = {}
}: {
  url: string;
  isLoading: boolean;
  size: Pick<ViewStyle, 'height' | 'width'>;
  style?: StyleProp<ViewStyle>;
}) {
  // 预览图是否加载完成
  const [isPreviewLoaded, setIsPreviewLoaded] = useState<boolean>(false);

  // loading视频是否展示
  const [isVideoShow, setIsVideoShow] = useState(false);
  const videoRef = useRef<Video>(null);

  // 预览图加载完成关闭loading
  useEffect(() => {
    if (isPreviewLoaded) {
      setIsVideoShow(false);
    }
  }, [isPreviewLoaded]);

  // 初始化isVideoShow的状态
  useEffect(() => {
    if (isLoading) {
      setIsVideoShow(true);
    }
    return () => {
      videoRef.current?.stopAsync();
    };
  }, []);

  return (
    <View style={[imgStyles.$box, size, $style]}>
      {url && (
        <PreloadImg
          url={url}
          size={imgStyles.$imgBasic}
          tosSize="size10"
          onPreviewImgLoad={setIsPreviewLoaded}
        />
      )}
      {isVideoShow && (
        <Video
          url={PW_PURE_BG_VIDEO}
          style={[imgStyles.$imgBasic, imgStyles.$loading]}
          shouldPlay
          isLooping
          ref={videoRef}
          resizeMode={ResizeMode.COVER}
        />
      )}
    </View>
  );
}

const imgStyles = createStyle({
  $box: {
    position: 'relative'
  },
  $loading: { position: 'absolute' },
  $imgBasic: { height: '100%', width: '100%' }
});
