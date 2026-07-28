import React from 'react';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

interface Props {
  svg: string;
}

const ChartSvgView = ({
  svg,
}: Props) => {
  const { width } =
    useWindowDimensions();

  return (
    <RenderHtml
      contentWidth={width}
      source={{
        html: svg,
      }}
    />
  );
};

export default ChartSvgView;