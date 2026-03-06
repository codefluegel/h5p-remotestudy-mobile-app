import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { observer } from 'mobx-react';
import React, { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ObserverList from '../../../components/Cards/ObserverList';
import GroupMoveHeader from '../../../components/Header/GroupMoveHeader';
import AddGroupModal from '../../../components/Modal/AddGroupModal';
import Theme from '../../../constants/Theme';
import { useStore } from '../../../store/context';
import { Label } from '../../../utils/types';

const { PRIMARY_COLOR } = Theme;
const LIGHT_BACKGROUND = '#F8F8F8';
const BORDER_RADIUS = 6;
const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 2,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BACKGROUND,
    paddingHorizontal: 10,
  },
  newGroupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  newGroupIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
    marginRight: 15,
  },
  newGroupText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: BORDER_RADIUS,
    ...CARD_SHADOW,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupNumberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    borderColor: '#CCC',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  groupNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  groupTitleContainer: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  groupSubtitle: {
    fontSize: 13,
    color: 'gray',
  },
});

const GroupSelectionModal = observer(() => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showAddLabelModal, setShowAddLabelModal] = useState(false);

  const { courseStore } = useStore();
  const { courseId, unitIds } = useLocalSearchParams();
  const course = courseStore.getCourse(String(courseId) ?? '');

  const handleClose = () => {
    router.back();
  };

  const handleSelectGroup = (group: Label) => {
    const unitsToEdit = course?.units.filter(unit =>
      unitIds?.includes(String(unit.contentId)),
    );

    if (unitsToEdit && unitsToEdit.length > 0) {
      const currentCourseId = String(courseId) ?? '';

      unitsToEdit.forEach(unit => {
        courseStore.updateUnit(currentCourseId, unit.contentId, {
          label: group,
          name: unit.name,
        });
      });
    }

    handleClose();
  };

  const createNewGroup = () => {
    setShowAddLabelModal(true);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitleAlign: 'left',
      headerStyle: {
        backgroundColor: 'white',
      },
      headerTintColor: '#333',
      headerTitle: () => <GroupMoveHeader onClose={handleClose} />,
      headerLeft: () => null,
      headerBackVisible: false,
      headerTitleContainerStyle: {
        left: 0,
        right: 0,
        paddingHorizontal: 0,
      },
    });
  }, [navigation]);

  const renderGroupItem = ({ item, index }: { item: Label; index: number }) => (
    <TouchableOpacity
      onPress={() => handleSelectGroup(item)}
      style={styles.groupCard}
    >
      <View style={styles.groupNumberCircle}>
        <Text style={styles.groupNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.groupTitleContainer}>
        <Text style={styles.groupTitle}>{item.name}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#888" />
    </TouchableOpacity>
  );

  const renderNewGroupItem = () => (
    <TouchableOpacity onPress={createNewGroup} style={styles.newGroupItem}>
      <View style={styles.newGroupIconCircle}>
        <Feather name="plus" size={24} color="white" />
      </View>
      <Text style={styles.newGroupText}>
        {t('modal.group_select.new_group')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ObserverList
        data={course?.labels || []}
        renderItem={renderGroupItem}
        keyExtractor={item => item.name}
        ListHeaderComponent={renderNewGroupItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <AddGroupModal
        isVisible={showAddLabelModal}
        courseId={String(courseId) ?? ''}
        onClose={() => setShowAddLabelModal(false)}
      />
    </View>
  );
});

export default GroupSelectionModal;
