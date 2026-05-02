import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { ViewProps } from 'react-native';

interface ThemedGradientProps extends ViewProps {
  children: React.ReactNode;
}

export function ThemedGradient({ style, children, ...props }: ThemedGradientProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const gradientColors = colorScheme === 'dark' 
    ? ['#2c3e50', '#3498db', '#2980b9'] 
    : ['#ff9aa2', '#fecfef', '#ff6b9d', '#ffd166'];

  return (
    <LinearGradient
      colors={gradientColors}
      style={[{ flex: 1 }, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

