import React, { useState } from 'react';
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface AppImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType | string;
  width?: number;
  height?: number;
  borderRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  showLoading?: boolean;
  fallback?: ImageSourcePropType;
}

export const AppImage: React.FC<AppImageProps> = ({
  source,
  width,
  height,
  borderRadius = 0,
  resizeMode = 'cover',
  showLoading = true,
  fallback,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const resolvedSource: ImageSourcePropType =
    typeof source === 'string' ? { uri: source } : source;

  const fallbackSource: ImageSourcePropType | undefined = fallback
    ? typeof fallback === 'string'
      ? { uri: fallback }
      : fallback
    : undefined;

  const containerStyle = StyleSheet.flatten([
    {
      width: width,
      height: height,
      borderRadius,
      overflow: 'hidden' as const,
      backgroundColor: theme.colors.surface,
    },
    style,
  ]);

  return (
    <View style={containerStyle}>
      <Image
        source={error && fallbackSource ? fallbackSource : resolvedSource}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        style={[StyleSheet.absoluteFill, { width: width, height: height }]}
        {...props}
      />
      {showLoading && loading && (
        <View style={[styles.loadingContainer, { borderRadius }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
