import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setTheme, toggleTheme } from '../store/slices/themeSlice';
import { ThemeMode, createTheme, lightTheme, darkTheme } from '../theme';

export const useTheme = () => {
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      dispatch(setTheme(newMode));
    },
    [dispatch],
  );

  const toggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  return { theme, mode, setMode, toggle };
};
