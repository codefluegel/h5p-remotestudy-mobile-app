import { Feather } from '@expo/vector-icons';
import { observer } from 'mobx-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStore } from '../../store/context';

interface SubmenuOverlayProps {
  visible: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  isTeacher: boolean;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  menuContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  badge: {
    backgroundColor: 'red',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 12,
    marginLeft: 'auto',
  },
});

const SubmenuOverlay = observer(
  ({ visible, onClose, onAction, isTeacher }: SubmenuOverlayProps) => {
    const { courseStore } = useStore();
    const { t } = useTranslation();
    const unsyncedCount = courseStore.unsyncedResults.length;

    const handleItemPress = (key: string) => {
      if (key === 'sync_pending') {
        courseStore.syncUnsyncedResults();
      } else {
        onAction(key);
      }
      onClose();
    };

    const MENU_ACTIONS = [
      {
        name: t('submenu.export_results'),
        key: 'export_results',
        icon: 'download',
        teacherOnly: true,
        show: true,
      },
      {
        name: t('submenu.sync_courses'),
        key: 'sync_courses',
        icon: 'refresh-ccw',
        teacherOnly: true,
        show: true,
      },
      {
        name: t('submenu.save_course'),
        key: 'save_course',
        icon: 'save',
        teacherOnly: true,
        show: true,
      },
      {
        name: t('submenu.clear_local_data'),
        key: 'clear_local_data',
        icon: 'hard-drive',
        teacherOnly: false,
        show: true,
      },
      {
        name: t('submenu.delete_course'),
        key: 'delete_course',
        icon: 'trash-2',
        teacherOnly: false,
        show: true,
      },
    ];

    const allMenuActions = [
      ...MENU_ACTIONS,
      {
        name: t('submenu.sync_results'),
        key: 'sync_pending',
        icon: 'upload-cloud',
        teacherOnly: false,
        show: unsyncedCount > 0,
      },
    ];

    return (
      <Modal
        transparent
        visible={visible}
        onRequestClose={onClose}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.menuContainer}>
            {allMenuActions
              .filter(
                elem =>
                  (elem.teacherOnly === isTeacher || !elem.teacherOnly) &&
                  (elem.show === undefined || elem.show),
              )
              .map((item, index, arr) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => handleItemPress(item.key)}
                  style={[
                    styles.menuItem,
                    index === arr.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  <Feather
                    name={
                      item.icon as React.ComponentProps<typeof Feather>['name']
                    }
                    size={18}
                    color="#333"
                  />
                  <Text style={styles.menuText}>{item.name}</Text>
                  {item.key === 'sync_pending' && unsyncedCount > 0 && (
                    <Text style={styles.badge}>{unsyncedCount}</Text>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  },
);

export default SubmenuOverlay;
