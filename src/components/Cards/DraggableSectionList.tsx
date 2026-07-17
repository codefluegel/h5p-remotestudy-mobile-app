import { observer } from 'mobx-react';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Unit } from '../../utils/types';

type ListItem =
  | {
      isHeader: true;
      sectionTitle: string;
      sectionIndex: number;
    }
  | {
      isHeader: false;
      item: Unit;
      sectionTitle: string;
      sectionIndex: number;
    };

export interface Section<T> {
  title: string;
  data: T[];
}

type Props = {
  sections: Section<Unit>[];
  renderItem: (params: RenderItemParams<Unit>) => React.ReactElement;
  onUpdateSorting: (updatedUnits: Unit[]) => void;
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
});

const DraggableSectionList = observer(
  ({ sections, renderItem, onUpdateSorting }: Props) => {
    const flatData: ListItem[] = sections.flatMap((section, sectionIndex) => [
      {
        item: { contentId: section.title, sortingIndex: -1 },
        isHeader: true,
        sectionTitle: `${sectionIndex + 1}) ${section.title}`,
        sectionIndex,
      },
      ...section.data
        .slice()
        .sort((a, b) => a.sortingIndex - b.sortingIndex)
        .map(unit => ({
          item: unit,
          isHeader: false,
          sectionTitle: section.title,
          sectionIndex,
        })),
    ]);

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DraggableFlatList
          style={{ width: '100%' }}
          contentContainerStyle={{ paddingBottom: 80 }}
          data={flatData}
          keyExtractor={listItem =>
            listItem.isHeader
              ? listItem.sectionTitle
              : listItem.item.contentId.toString()
          }
          renderItem={({ item: listItem, ...rest }) => {
            if (listItem.isHeader) {
              return (
                <View>
                  <Text style={styles.sectionHeader}>
                    {listItem.sectionTitle}
                  </Text>
                </View>
              );
            }
            return (
              <ScaleDecorator>
                {renderItem({ item: listItem.item, ...rest })}
              </ScaleDecorator>
            );
          }}
          onDragEnd={({ data }) => {
            const updatedUnits: Unit[] = [];
            const sortingIndex = 0;
            data.forEach(listItem => {
              if (!listItem.isHeader) {
                updatedUnits.push({
                  ...listItem.item,
                  sortingIndex: sortingIndex + 1,
                });
              }
            });
            onUpdateSorting(updatedUnits);
          }}
        />
      </GestureHandlerRootView>
    );
  },
);

export default DraggableSectionList;
