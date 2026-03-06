import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ObserverList from '../../../components/Cards/ObserverList';
import TwoButtonModal from '../../../components/Modal/TwoButtonModal';
import Theme from '../../../constants/Theme';
import {
  addInviteEmail,
  deleteInviteEmail,
  getInviteEmails,
} from '../../../services/service';
import { showError } from '../../../utils/alert';
import { InviteUser } from '../../../utils/types';

const { PRIMARY_COLOR } = Theme;
const LIGHT_BACKGROUND = '#F8F8F8';
const INPUT_COLOR = '#EFEFEF';
const BORDER_RADIUS = 6;
const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 2,
  elevation: 3,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_BACKGROUND,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: LIGHT_BACKGROUND,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 6,
  },
  searchInput: {
    flex: 1,
    backgroundColor: INPUT_COLOR,
    borderRadius: BORDER_RADIUS,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
  },
  plusButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: BORDER_RADIUS,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userListItem: {
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
    width: '98%',
  },
  userEmail: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontFamily: 'Roboto-Medium',
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    gap: 15,
  },
  actionIconContainer: {
    padding: 2,
  },
});

const UserListScreen = observer(() => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUserEmailForShare, setSelectedUserEmailForShare] =
    useState('');

  const { courseId } = useLocalSearchParams();

  const [users, setUsers] = useState<InviteUser[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const emails = await getInviteEmails(String(courseId));
        if (emails)
          setUsers(
            emails.length > 0
              ? emails.map((email, idx) => ({
                  id: idx + 1,
                  email,
                }))
              : [],
          );
      } catch (e) {
        console.log(e);
        showError(
          t('user_list.alert.error_title'),
          t('user_list.alert.fetch_failed'),
        );
      }
    };
    if (courseId) fetchUsers();
  }, [courseId, t]);

  const handleAddUser = async () => {
    if (newUserEmail.trim() === '') {
      showError(
        t('user_list.alert.error_title'),
        t('user_list.alert.email_required'),
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      showError(
        t('user_list.alert.error_title'),
        t('user_list.alert.invalid_email'),
      );
      return;
    }

    if (users.some(user => user.email === newUserEmail.trim())) {
      showError(
        t('user_list.alert.error_title'),
        t('user_list.alert.duplicate_email'),
      );
      return;
    }

    const newUser: InviteUser = {
      id: users.length + 1,
      email: newUserEmail.trim(),
    };

    try {
      await addInviteEmail(String(courseId), newUserEmail);
    } catch (e) {
      console.log(e);
    }

    setUsers([...users, newUser]);
    setNewUserEmail('');
  };

  const handleDeleteUser = async (email: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.email !== email));
    try {
      await deleteInviteEmail(String(courseId), email);
    } catch (e) {
      console.log(e);
      showError(
        t('user_list.alert.error_title'),
        t('user_list.alert.remove_failed'),
      );
    }
  };

  const onShare = useCallback(
    async (email?: string) => {
      let generatedLink = Linking.createURL('/');

      if (email) generatedLink += `?email=${selectedUserEmailForShare}`;

      try {
        const result = await Share.share({
          message: t('user_list.toast.share'),
          url: generatedLink,
          title: t('user_list.toast.share'),
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log(`Shared with: ${result.activityType}`);
          } else {
            console.log('Shared successfully');
          }
        } else if (result.action === Share.dismissedAction) {
          console.log('Share dismissed');
        }
      } catch (e) {
        console.log(e);
        showError(
          t('user_list.alert.error_title'),
          t('user_list.alert.sharing_failed'),
        );
      }
    },
    [selectedUserEmailForShare, t],
  );

  const openShareModal = (email: string) => {
    setSelectedUserEmailForShare(email);
    setModalVisible(true);
  };

  const renderUserItem = ({ item }: { item: InviteUser }) => (
    <View style={styles.userListItem}>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.userEmail}>
        {item.email}
      </Text>
      <View style={styles.iconActions}>
        <TouchableOpacity
          onPress={() => openShareModal(item.email)}
          style={styles.actionIconContainer}
        >
          <Feather name="share-2" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteUser(item.email)}
          style={styles.actionIconContainer}
        >
          <Feather name="trash-2" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('user_list.placeholder.email')}
            placeholderTextColor="#888"
            value={newUserEmail}
            onChangeText={setNewUserEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.plusButton} onPress={handleAddUser}>
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ObserverList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => String(item.email)}
          style={{ width: '100%' }}
          contentContainerStyle={{
            paddingHorizontal: 5, // Match horizontal padding for the cards
            paddingBottom: 20,
            flexGrow: 1,
          }}
        />
        <TwoButtonModal
          isVisible={modalVisible}
          title={t('modal.communication.title')}
          topButtonTitle={t('modal.communication.button_share')}
          onClose={() => setModalVisible(false)}
          onTopButtonTapped={() => onShare(selectedUserEmailForShare)}
          onBottomButtonTapped={() => console.log(selectedUserEmailForShare)}
        />
      </View>
    </SafeAreaView>
  );
});

export default UserListScreen;
