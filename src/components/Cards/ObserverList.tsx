import { Observer, observer } from 'mobx-react';
import React, { PropsWithChildren } from 'react';

// we should use ObserverList instead of FlatList throughout the
// project, this is the only exception:
// eslint-disable-next-line id-denylist
import { FlatList, FlatListProps, ListRenderItemInfo } from 'react-native';

const ObserverList = observer(
  <T,>(props: PropsWithChildren<FlatListProps<T>>): React.ReactElement => {
    const { data, renderItem, ...otherProps } = props;
    return (
      <FlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...otherProps}
        data={data ? Array.from(data) : data}
        renderItem={
          renderItem
            ? (item: ListRenderItemInfo<T>) => (
                <Observer>{() => renderItem(item)}</Observer>
              )
            : renderItem
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    );
  },
);

export default ObserverList;
