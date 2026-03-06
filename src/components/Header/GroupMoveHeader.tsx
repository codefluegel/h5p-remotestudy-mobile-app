// components/Headers/GroupMoveHeader.tsx

import { MaterialIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GroupMoveHeaderProps {
  onClose: () => void;
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 15,
  },
  closeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  titleText: {
    color: '#333', // Dark text color for visibility
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const GroupMoveHeader = observer(
  ({ onClose }: GroupMoveHeaderProps): React.ReactElement => {
    const { t } = useTranslation();
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.titleText}>{t('header.group_move.title')}</Text>
      </View>
    );
  },
);

export default GroupMoveHeader;
