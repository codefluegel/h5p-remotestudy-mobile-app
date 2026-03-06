import { MaterialIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectionHeaderProps {
  selectedCount: number;
  onExit: () => void;
  onMoveToGroup: () => void;
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 15,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  countText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
});

const SelectionHeader = observer(
  ({
    selectedCount,
    onExit,
    onMoveToGroup,
  }: SelectionHeaderProps): React.ReactElement => {
    const { t } = useTranslation();
    return (
      <View style={styles.headerContainer}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={onExit} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.countText}>
            {selectedCount} {t('header.selection.text')}
          </Text>
        </View>

        <TouchableOpacity onPress={onMoveToGroup}>
          <Text style={styles.actionText}>
            {t('header.selection.move_link')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

export default SelectionHeader;
