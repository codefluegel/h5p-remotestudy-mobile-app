import { Href, router } from 'expo-router';
import { observer } from 'mobx-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ImageProps,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import StudentProfile from '../../assets/images/StudentProfile.png';
import TeacherProfile from '../../assets/images/TeacherProfile.png';
import Theme from '../constants/Theme';
import { useStore } from '../store/context';

const MAX_CONTENT_WIDTH = 550;
const SPACING = 20;
const IMAGE_HEIGHT_PORTRAIT = 200;
const CARD_RADIUS = 12;
const IMAGE_HEIGHT_MAX_LANDSCAPE = 300;

const loginScreenRoute = '/LoginScreen' as Href;

interface RoleCardProps {
  title: string;
  description: string;
  imageSource: ImageProps['source'];
  onPress: () => void;
  selectButtonText: string;
}

const RoleCard: React.FC<RoleCardProps> = observer(
  ({ title, description, imageSource, onPress, selectButtonText }) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const isLandscape = screenWidth > screenHeight;
    const imageDisplayHeight = isLandscape
      ? Math.min(IMAGE_HEIGHT_MAX_LANDSCAPE, screenHeight * 0.4) // Cap at 300 or 40% of screen height
      : IMAGE_HEIGHT_PORTRAIT;

    const cardStyles = StyleSheet.create({
      card: {
        backgroundColor: 'white',
        borderRadius: CARD_RADIUS,
        marginBottom: SPACING,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        width: '100%',
      },
      imageContainer: {
        // Use the calculated height
        height: imageDisplayHeight,
        width: '100%',
        backgroundColor: Theme.PRIMARY_COLOR
          ? `${Theme.PRIMARY_COLOR}20`
          : '#FEF0E7',
      },
      image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      },
      detailsContainer: {
        padding: SPACING,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      textGroup: {
        flex: 1,
        marginRight: SPACING,
      },
      title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#34495E',
        marginBottom: 4,
      },
      description: {
        fontSize: 14,
        color: '#7F8C8D',
      },
      selectButton: {
        backgroundColor: Theme.PRIMARY_COLOR || '#FF7F4C',
        paddingHorizontal: SPACING * 1.5,
        paddingVertical: 10,
        borderRadius: 8,
      },
      selectButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
      },
    });

    return (
      <View style={cardStyles.card}>
        <View style={cardStyles.imageContainer}>
          <Image source={imageSource} style={cardStyles.image} />
        </View>
        <View style={cardStyles.detailsContainer}>
          <View style={cardStyles.textGroup}>
            <Text style={cardStyles.title}>{title}</Text>
            <Text style={cardStyles.description}>{description}</Text>
          </View>
          <TouchableOpacity style={cardStyles.selectButton} onPress={onPress}>
            <Text style={cardStyles.selectButtonText}>{selectButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const ChooseRoleScreen = observer(() => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { appStateStore } = useStore();
  const { t } = useTranslation();

  const teacherRoleSelected = () => {
    appStateStore.setRole('Teacher');
    router.replace(loginScreenRoute);
  };

  const studentRoleSelected = () => {
    appStateStore.setRole('Student');
    router.replace(loginScreenRoute);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: 'center',
      paddingBottom: SPACING * 2,
    },
    contentWrapper: {
      width: '100%',
      maxWidth: MAX_CONTENT_WIDTH,
      paddingHorizontal: SPACING,
      paddingTop: Math.max(SPACING * 2, screenHeight * 0.08),
    },
    headerText: {
      fontSize: Math.min(screenWidth * 0.08, 32),
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#2C3E50',
      marginBottom: SPACING * 2,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <ScrollView
        contentContainerStyle={dynamicStyles.scrollContent}
        scrollEnabled
        bounces={false}
      >
        <View style={dynamicStyles.contentWrapper}>
          <Text style={dynamicStyles.headerText}>{t('role.title.main')}</Text>

          <RoleCard
            title={t('role.card.teacher_title')}
            description={t('role.card.teacher_desc')}
            imageSource={TeacherProfile}
            onPress={teacherRoleSelected}
            selectButtonText={t('role.button.select')}
          />

          <RoleCard
            title={t('role.card.student_title')}
            description={t('role.card.student_desc')}
            imageSource={StudentProfile}
            onPress={studentRoleSelected}
            selectButtonText={t('role.button.select')}
          />
        </View>
      </ScrollView>
    </View>
  );
});

export default ChooseRoleScreen;
