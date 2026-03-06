import { useDeviceOrientation } from '@react-native-community/hooks';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Dimensions } from 'react-native';
import { Course } from '../../utils/types';
import CourseCard from './CourseCard';
import ObserverList from './ObserverList';

const DimensionsFlatList = observer(
  ({
    data,
    onPress,
    onPressStatus,
  }: {
    data: Course[];
    onPress: (course: Course) => void;
    onPressStatus?: (course: Course) => void;
  }): React.ReactElement => {
    const deviceOrientation = useDeviceOrientation();

    const numColumns = computed(() => {
      const landscapeWidth = Math.max(
        Dimensions.get('window').width,
        Dimensions.get('window').height,
      );
      let cols =
        deviceOrientation === 'portrait' ? 1 : Math.floor(landscapeWidth / 600);
      cols = Math.min(cols, 2);
      return cols;
    }).get();

    const renderItem = ({ item, index }: { item: Course; index: number }) => {
      return (
        <CourseCard
          item={item}
          status={item?.status ?? ''}
          title={item?.name}
          onPress={() => onPress(item)}
          onPressStatus={() =>
            onPressStatus ? onPressStatus(item) : undefined
          }
          index={index}
        />
      );
    };

    return (
      <ObserverList
        key={`${numColumns}#`}
        numColumns={numColumns}
        data={data}
        keyExtractor={item => `${numColumns}#${item.id}`}
        renderItem={renderItem}
      />
    );
  },
);

export default DimensionsFlatList;
