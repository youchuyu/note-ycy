import React, { ReactNode, useMemo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { getGenImgWidthByHeight } from '@/src/bizComponents/parallelWorld/constants';
import { colors } from '@/src/theme';
import { Image } from '@Components/image';
import InfoCard from '@BizComponents/parallelWorld/infoCard';

// export const getGenImgHeightByWidth = (imgWidth: number) => (imgWidth / 2) * 3;

export interface StaticCardProps {
  imageUrl: string;
  imgHeight: number;
  containerStyle?: StyleProp<ViewStyle>;
  textNode?: ReactNode;
}

export default function StaticCard({
  imageUrl,
  imgHeight = 300,
  containerStyle: $containerStyle = {},
  textNode
}: StaticCardProps) {
  const imgWidth = useMemo(() => {
    return getGenImgWidthByHeight(imgHeight);
  }, []);

  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          alignItems: 'center'
        },
        $containerStyle
      ]}
    >
      <View
        style={{
          padding: 10,
          paddingBottom: 0,
          position: 'relative'
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              borderWidth: 2,
              borderColor: colors.black,
              width: imgWidth,
              height: imgHeight
            }}
          />
        ) : (
          <View
            style={{
              borderWidth: 2,
              borderColor: colors.black,
              width: imgWidth,
              height: imgHeight
            }}
          />
        )}
      </View>

      <InfoCard isBgPicVisible={false}>
        <View
          style={{
            width: imgWidth - 4,
            paddingVertical: 10,
            paddingHorizontal: 16,
            overflow: 'hidden',
            gap: 8
          }}
        >
          {textNode}
        </View>
      </InfoCard>
    </View>
  );
}
