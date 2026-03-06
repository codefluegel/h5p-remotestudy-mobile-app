import AsyncStorage from '@react-native-async-storage/async-storage';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import euLogo from '../../assets/images/eu-logo.png';
import Theme from '../constants/Theme';
import { useStore } from '../store/context';
import { showAlert } from '../utils/alert';
import DeleteAccountModal from './Modal/DeleteAccountModal';
import LegalPageModal from './Modal/LegalPageModal';

type LegalPageType = 'impressum' | 'terms' | 'privacy' | null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.BACKGROUND_COLOR,
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: Theme.SURFACE_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 40,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: Theme.SECONDARY_TEXT_COLOR,
    marginRight: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.PRIMARY_COLOR,
  },
  legalLinksSection: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: Theme.SURFACE_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 12,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.PRIMARY_TEXT_COLOR,
    marginBottom: 15,
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: Theme.BACKGROUND_COLOR,
    borderWidth: 1,
    borderColor: Theme.PRIMARY_COLOR,
  },
  linkText: {
    color: Theme.PRIMARY_TEXT_COLOR,
    fontSize: 16,
    fontWeight: '500',
  },
  dangerZoneSection: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: Theme.SURFACE_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Theme.BACKGROUND_COLOR,
    borderWidth: 1,
    borderColor: Theme.PRIMARY_COLOR,
    marginBottom: 12,
  },
  logoutButtonText: {
    color: Theme.PRIMARY_TEXT_COLOR,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteAccountButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Theme.PRIMARY_COLOR,
  },
  deleteAccountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  languageSection: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: Theme.SURFACE_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 12,
    marginTop: 20,
  },
  languageButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Theme.PRIMARY_COLOR,
    backgroundColor: Theme.BACKGROUND_COLOR,
  },
  languageButtonActive: {
    backgroundColor: Theme.PRIMARY_COLOR,
  },
  languageButtonText: {
    color: Theme.PRIMARY_TEXT_COLOR,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  languageButtonTextActive: {
    color: 'white',
  },
  fundingSection: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: Theme.SURFACE_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  fundingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fundingRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  fundingLogo: {
    width: 120,
    height: 80,
    resizeMode: 'contain',
  },
  fundingLogoMobile: {
    width: 200,
    height: 110,
  },
  fundingTextContainer: {
    flex: 1,
  },
  fundingTextContainerMobile: {
    alignItems: 'center',
  },
  fundingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.PRIMARY_TEXT_COLOR,
    marginBottom: 8,
  },
  fundingTitleMobile: {
    textAlign: 'center',
  },
  fundingBody: {
    fontSize: 13,
    color: Theme.SECONDARY_TEXT_COLOR,
    lineHeight: 18,
  },
  fundingBodyMobile: {
    textAlign: 'center',
  },
});

const legalPages = {
  impressum: {
    url: 'https://codefluegel.com/impressum/',
  },
  terms: {
    url: 'https://codefluegel.com/agb/',
  },
  privacy: {
    url: 'https://codefluegel.com/datenschutz/datenschutz-remotestudy/',
  },
};

const ProfileScreen = observer(() => {
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageType>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { i18n, t } = useTranslation();
  const { width } = useWindowDimensions();
  const isPhone = width < 600;

  const { appStateStore, authService } = useStore();

  const userEmail: string = appStateStore.user?.email || 'N/A';
  const userRole: string = appStateStore.role || 'N/A';

  const handleLegalPagePress = (pageType: LegalPageType): void => {
    setActiveLegalPage(pageType);
  };

  const handleDeleteAccountPress = (): void => {
    showAlert(t('profile.alert.delete_title'), t('profile.alert.delete_msg'), [
      {
        text: t('modal.delete_account.button.cancel') || 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: t('modal.delete_account.button.delete') || 'Delete',
        onPress: () => setShowDeleteModal(true),
        style: 'destructive',
      },
    ]);
  };

  const handleLogoutPress = (): void => {
    authService.logout();
  };

  const handleLanguageChange = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('appLanguage', language);
    } catch (error) {
      console.warn('Failed to change language:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.label.email')}</Text>
            <Text style={styles.infoValue}>{userEmail}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.label.role')}</Text>
            <Text style={styles.infoValue}>{userRole}</Text>
          </View>
        </View>

        <View style={styles.legalLinksSection}>
          <Text style={styles.sectionTitle}>{t('profile.section.legal')}</Text>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleLegalPagePress('impressum')}
          >
            <Text style={styles.linkText}>{t('profile.link.impressum')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleLegalPagePress('terms')}
          >
            <Text style={styles.linkText}>{t('profile.link.terms')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleLegalPagePress('privacy')}
          >
            <Text style={styles.linkText}>{t('profile.link.privacy')}</Text>
          </TouchableOpacity>
        </View>

        {Platform.OS !== 'windows' && (
          <View style={styles.languageSection}>
            <Text style={styles.sectionTitle}>
              {t('profile.section.language')}
            </Text>
            <View style={styles.languageButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  i18n.language === 'en' && styles.languageButtonActive,
                ]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    i18n.language === 'en' && styles.languageButtonTextActive,
                  ]}
                >
                  {t('profile.language.english')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  i18n.language === 'de' && styles.languageButtonActive,
                ]}
                onPress={() => handleLanguageChange('de')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    i18n.language === 'de' && styles.languageButtonTextActive,
                  ]}
                >
                  {t('profile.language.german')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.dangerZoneSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogoutPress}
          >
            <Text style={styles.logoutButtonText}>
              {t('profile.button.logout')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccountPress}
          >
            <Text style={styles.deleteAccountButtonText}>
              {t('profile.button.delete_account')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fundingSection}>
          <View style={[styles.fundingRow, isPhone && styles.fundingRowMobile]}>
            <Image
              style={[styles.fundingLogo, isPhone && styles.fundingLogoMobile]}
              source={euLogo}
              accessibilityLabel={t('profile.funding.title')}
            />
            <View
              style={[
                styles.fundingTextContainer,
                isPhone && styles.fundingTextContainerMobile,
              ]}
            >
              <Text
                style={[
                  styles.fundingTitle,
                  isPhone && styles.fundingTitleMobile,
                ]}
              >
                {t('profile.funding.title')}
              </Text>
              <Text
                style={[
                  styles.fundingBody,
                  isPhone && styles.fundingBodyMobile,
                ]}
              >
                {t('profile.funding.text')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {activeLegalPage && (
        <LegalPageModal
          isVisible
          onClose={() => setActiveLegalPage(null)}
          title={t(`profile.link.${activeLegalPage}`)}
          url={legalPages[activeLegalPage].url}
        />
      )}

      <DeleteAccountModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </ScrollView>
  );
});

export default ProfileScreen;
