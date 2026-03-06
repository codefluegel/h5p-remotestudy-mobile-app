import { Feather } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { observer } from 'mobx-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Theme from '../constants/Theme';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  syncButton: {
    borderRadius: 8,
    height: 36,
    backgroundColor: Theme.PRIMARY_COLOR,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelButton: {
    borderRadius: 16,
    width: 182,
    height: 36,
    backgroundColor: Theme.PRIMARY_COLOR,
    justifyContent: 'center',
  },
  saveButton: {
    flex: 0,
    borderRadius: 4,
    height: 36,
    backgroundColor: Theme.PRIMARY_COLOR,
    justifyContent: 'center',
    marginRight: 16,
    paddingHorizontal: 16,
    width: 'auto',
  },
  buttonTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  bottomToolbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    paddingVertical: 12,
    paddingBottom: height * 0.04,
  },
  toolbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
});

const StatisticsToolbar = observer(
  ({
    onShare,
    onExport,
    onSync,
  }: {
    onShare: () => void;
    onExport: () => void;
    onSync: () => void;
  }): React.ReactElement => {
    const { t } = useTranslation();
    return (
      <View style={styles.bottomToolbarContainer}>
        <View style={styles.toolbarContent}>
          <View style={styles.toolbarLeft}>
            <TouchableOpacity onPress={onShare}>
              <Feather name="share" size={20} color="black" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.syncButton} onPress={onSync}>
            <Text style={styles.buttonTitle}>{t('submenu.sync_courses')}</Text>
          </TouchableOpacity>

          <View style={styles.toolbarRight}>
            <TouchableOpacity onPress={onExport}>
              <AntDesign name="usergroup-add" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

export default StatisticsToolbar;
