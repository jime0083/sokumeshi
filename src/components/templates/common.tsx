import { View, ViewProps } from 'react-native';
import { Orientation } from '@/src/types/card';

export const CARD_SIZE = {
  vertical: { width: 343, height: 570 },
  horizontal: { width: 313, height: 189 },
};

export function CardContainer({ orientation, children, style }: ViewProps & { orientation: Orientation }) {
  const size = CARD_SIZE[orientation];
  return (
    <View
      style={[
        {
          width: size.width,
          height: size.height,
          borderRadius: 16,
          backgroundColor: '#fff',
          overflow: 'hidden',
          alignSelf: 'center',
        },
        style as any,
      ]}
    >
      {children}
    </View>
  );
}


