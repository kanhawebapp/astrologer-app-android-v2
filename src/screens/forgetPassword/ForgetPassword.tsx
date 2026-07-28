// import React from "react";

// import { View, StyleSheet } from "react-native";
// import { AppText } from "../../components/common/AppText";
// import { AppInput } from "../../components/common/AppInput";
// import { AppButton } from "../../components/common/AppButton";
// import { useTheme } from "../../hooks/useTheme";
// import { forgetPassStyle } from "./forgetPassStyle";

// const ForgetPasswordScreen: React.FC = () => {
//   const { theme } = useTheme();

//   const styles = forgetPassStyle

//   return (
//     <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
//       <AppText variant="h3" color={theme.colors.textPrimary} style={styles.title}>
//         Forgot Password
//       </AppText>
//       <AppText
//         variant="body1"
//         color={theme.colors.textSecondary}
//         style={styles.subtitle}
//       >
//         Enter your email address to receive a password reset link.
//       </AppText>
//       <AppInput
//         label="Email Address"
//         placeholder="Enter your email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         style={styles.input}
//       />
//       <AppButton title="Send Reset Link" onPress={() => {}} />
//     </View>
//   );
// };


// export default ForgetPasswordScreen;
