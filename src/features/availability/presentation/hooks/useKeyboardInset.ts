import {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, LayoutChangeEvent, Platform} from 'react-native';

const SHOW_EVENT =
  Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT =
  Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

/**
 * Returns how much bottom space content above the bottom safe area must reserve for the keyboard.
 * Android may or may not resize the window (adjustResize vs. enforced edge-to-edge on API 35+),
 * so the inset is reduced by however much the root view actually shrank.
 */
export const useKeyboardInset = (bottomSafeInset: number) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const keyboardVisibleRef = useRef(false);
  const restingHeightRef = useRef(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(SHOW_EVENT, event => {
      keyboardVisibleRef.current = true;
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(HIDE_EVENT, () => {
      keyboardVisibleRef.current = false;
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onRootLayout = useCallback((event: LayoutChangeEvent) => {
    const {height} = event.nativeEvent.layout;
    if (!keyboardVisibleRef.current) {
      restingHeightRef.current = height;
    }
    setLayoutHeight(height);
  }, []);

  const isKeyboardVisible = keyboardHeight > 0;
  // Android reports the IME height above the navigation bar; iOS includes the home-indicator area.
  const coveredHeight =
    Platform.OS === 'ios' ? keyboardHeight - bottomSafeInset : keyboardHeight;
  const resizedBy = Math.max(0, restingHeightRef.current - layoutHeight);
  const keyboardInset = isKeyboardVisible
    ? Math.max(0, Math.round(coveredHeight - resizedBy))
    : 0;

  return {isKeyboardVisible, keyboardInset, onRootLayout};
};
