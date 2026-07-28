// import React, { useRef, useEffect, useMemo } from 'react';
// import { View, Animated, StyleSheet, Easing } from 'react-native';

// const ZODIAC_SYMBOLS = [
//   '\u2648',
//   '\u2649',
//   '\u264A',
//   '\u264B',
//   '\u264C',
//   '\u264D',
//   '\u264E',
//   '\u264F',
//   '\u2650',
//   '\u2651',
//   '\u2652',
//   '\u2653',
// ];

// interface ZodiacRingProps {
//   opacity: Animated.Value;
//   ringRadius?: number;
//   fontSize?: number;
// }

// export const ZodiacRing: React.FC<ZodiacRingProps> = ({
//   opacity,
//   ringRadius = 180,
//   fontSize = 24,
// }) => {
//   const rotation = useRef(new Animated.Value(0)).current;
//   const pulseOpacity = useRef(new Animated.Value(0.35)).current;

//   useEffect(() => {
//     const rotateAnim = Animated.loop(
//       Animated.timing(rotation, {
//         toValue: 1,
//         duration: 30000,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       }),
//     );

//     const pulseAnim = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseOpacity, {
//           toValue: 0.6,
//           duration: 3000,
//           easing: Easing.inOut(Easing.sin),
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseOpacity, {
//           toValue: 0.25,
//           duration: 3000,
//           easing: Easing.inOut(Easing.sin),
//           useNativeDriver: true,
//         }),
//       ]),
//     );

//     rotateAnim.start();
//     pulseAnim.start();

//     return () => {
//       rotateAnim.stop();
//       pulseAnim.stop();
//     };
//   }, [rotation, pulseOpacity]);

//   const spin = rotation.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });

//   const containerSize = ringRadius * 2 + fontSize * 2;
//   const halfContainer = containerSize / 2;

//   const symbols = useMemo(() => {
//     return ZODIAC_SYMBOLS.map((symbol, index) => {
//       const angle = (index * 360) / ZODIAC_SYMBOLS.length;
//       const radians = (angle * Math.PI) / 180;
//       const x = halfContainer + ringRadius * Math.cos(radians) - fontSize / 2;
//       const y = halfContainer + ringRadius * Math.sin(radians) - fontSize / 2;

//       return (
//         <Animated.Text
//           key={index}
//           style={[
//             styles.zodiacSymbol,
//             {
//               left: x,
//               top: y,
//               fontSize,
//               color: '#D4AF37',
//               opacity: pulseOpacity,
//               transform: [
//                 {
//                   rotate: rotation.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [`-${angle}deg`, `${360 - angle}deg`],
//                   }),
//                 },
//               ],
//             },
//           ]}>
//           {symbol}
//         </Animated.Text>
//       );
//     });
//   }, [halfContainer, ringRadius, fontSize, pulseOpacity, rotation]);

//   const ringDiameter = ringRadius * 2;
//   const innerRingDiameter = ringRadius * 1.5;
//   const ringOffset = (containerSize - ringDiameter) / 2;
//   const innerRingOffset = (containerSize - innerRingDiameter) / 2;

//   return (
//     <Animated.View
//       style={[
//         styles.container,
//         {
//           width: containerSize,
//           height: containerSize,
//           opacity,
//           transform: [{ rotate: spin }],
//         },
//       ]}>
//       <View
//         style={[
//           styles.ring,
//           {
//             width: ringDiameter,
//             height: ringDiameter,
//             borderRadius: ringRadius,
//             borderWidth: 0.5,
//             borderColor: 'rgba(212, 175, 55, 0.12)',
//             left: ringOffset,
//             top: ringOffset,
//           },
//         ]}
//       />
//       <View
//         style={[
//           styles.ring,
//           {
//             width: innerRingDiameter,
//             height: innerRingDiameter,
//             borderRadius: innerRingDiameter / 2,
//             borderWidth: 0.5,
//             borderColor: 'rgba(212, 175, 55, 0.06)',
//             left: innerRingOffset,
//             top: innerRingOffset,
//           },
//         ]}
//       />
//       {symbols}
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 300,
//     width: 300,
//   },
//   ring: {
//     position: 'absolute',
//   },
//   zodiacSymbol: {
//     position: 'absolute',
//     fontWeight: '300',
//     textAlign: 'center',
//   },
// });



import React, { useRef, useEffect, useMemo } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

const ZODIAC_SYMBOLS = [
  '\u2648','\u2649','\u264A','\u264B',
  '\u264C','\u264D','\u264E','\u264F',
  '\u2650','\u2651','\u2652','\u2653',
];

interface ZodiacRingProps {
  opacity: Animated.Value;
  ringRadius?: number;
}

export const ZodiacRing: React.FC<ZodiacRingProps> = ({
  opacity,
  ringRadius = 180,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.35)).current;

  // 🔥 Dynamic font (auto big)
  const fontSize = ringRadius * 0.2;

  useEffect(() => {
    const rotateAnim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: 0.6,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0.25,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    rotateAnim.start();
    pulseAnim.start();

    return () => {
      rotateAnim.stop();
      pulseAnim.stop();
    };
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ✅ Important (font ke hisaab se size badhao)
  const containerSize = ringRadius * 2 + fontSize * 2;
  const halfContainer = containerSize / 2;

  const symbols = useMemo(() => {
    return ZODIAC_SYMBOLS.map((symbol, index) => {
      const angle = (index * 360) / ZODIAC_SYMBOLS.length;
      const radians = (angle * Math.PI) / 180;

      const x =
        halfContainer + ringRadius * Math.cos(radians) - fontSize / 2;
      const y =
        halfContainer + ringRadius * Math.sin(radians) - fontSize / 2;

      return (
        <Animated.Text
          key={index}
          style={[
            styles.zodiacSymbol,
            {
              left: x,
              top: y,
              fontSize,
              color: '#D4AF37',
              opacity: pulseOpacity,
              transform: [
                {
                  rotate: rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [`-${angle}deg`, `${360 - angle}deg`],
                  }),
                },
              ],
            },
          ]}
        >
          {symbol}
        </Animated.Text>
      );
    });
  }, [halfContainer, ringRadius, fontSize]);

  const ringDiameter = ringRadius * 2;
  const innerRingDiameter = ringRadius * 1.5;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          opacity,
          transform: [{ rotate: spin }],
        },
      ]}
    >
      {/* Outer Ring */}
      <View
        style={{
          position: 'absolute',
          width: ringDiameter,
          height: ringDiameter,
          borderRadius: ringRadius,
          borderWidth: 0.6,
          borderColor: 'rgba(212,175,55,0.15)',
          top: (containerSize - ringDiameter) / 2,
          left: (containerSize - ringDiameter) / 2,
        }}
      />

      {/* Inner Ring */}
      <View
        style={{
          position: 'absolute',
          width: innerRingDiameter,
          height: innerRingDiameter,
          borderRadius: innerRingDiameter / 2,
          borderWidth: 0.6,
          borderColor: 'rgba(212,175,55,0.08)',
          top: (containerSize - innerRingDiameter) / 2,
          left: (containerSize - innerRingDiameter) / 2,
        }}
      />

      {symbols}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacSymbol: {
    position: 'absolute',
    fontWeight: '400',
    textAlign: 'center',
  },
});

