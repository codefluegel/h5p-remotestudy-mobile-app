import { MaterialIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import style from '../../constants/Style';
import { ContentMetadata } from '../../localH5pServer';

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 90,
    marginBottom: 5,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  leftContent: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F3FF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 12,
    color: '#007AFF',
    fontFamily: 'Roboto-Regular',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: 'black',
  },
  metadataText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  rightIconsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  circleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D3D3D3',
    marginRight: 10,
  },
  optionsIcon: {
    padding: 4,
  },
  sortArrowsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortArrow: {
    padding: 2,
  },
});

const UnitEditingRow = observer(
  ({
    title,
    onPressUnit,
    onDrag,
    disabled,
    metaData,
    onPressOptions,
    typeText,
    isSelected,
    isTeacher,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
    disableReorder,
  }: {
    title: string;
    onPressUnit: () => void;
    onDrag: (() => void) | undefined;
    disabled: boolean;
    metaData: ContentMetadata | undefined;
    onPressOptions?: () => void;
    isSelected?: boolean;
    typeText?: string;
    isTeacher?: boolean;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    disableReorder?: boolean;
  }): React.ReactElement => {
    const metadataParts = [];
    if (metaData?.authors?.[0]?.name) {
      metadataParts.push(`Authors: ${metaData.authors[0].name}`);
    }
    if (metaData?.license) {
      metadataParts.push(`License: ${metaData.license}`);
    }
    if (metaData?.yearFrom) {
      metadataParts.push(`${metaData.yearFrom}`);
    }

    const metadataString = metadataParts.join(' | ');

    return (
      <View style={{ marginTop: 10 }}>
        <TouchableOpacity
          onPress={onPressUnit}
          disabled={disabled}
          style={[
            styles.container,
            style.shadowProp,
            disabled && { backgroundColor: 'lightgrey' },
          ]}
        >
          <View style={styles.leftContent}>
            {typeText && (
              <View style={styles.tagContainer}>
                <Text style={styles.typeText}>{typeText}</Text>
              </View>
            )}

            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.title}>
              {title}
            </Text>

            {metadataString.length > 0 && (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.metadataText}
              >
                {metadataString}
              </Text>
            )}
          </View>

          {isTeacher && (
            <View style={styles.rightIconsContainer}>
              <TouchableOpacity
                style={styles.optionsIcon}
                onPress={onPressOptions}
                disabled={!onPressOptions}
              >
                <MaterialIcons
                  name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                  size={24}
                  color={isSelected ? '#3F51B5' : '#D3D3D3'}
                />
              </TouchableOpacity>
              {isWeb ? (
                <View style={styles.sortArrowsContainer}>
                  <TouchableOpacity
                    style={styles.sortArrow}
                    onPress={onMoveUp}
                    disabled={!!disableReorder || isFirst}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-up"
                      size={24}
                      color={disableReorder || isFirst ? '#D3D3D3' : 'black'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sortArrow}
                    onPress={onMoveDown}
                    disabled={!!disableReorder || isLast}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={24}
                      color={disableReorder || isLast ? '#D3D3D3' : 'black'}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.optionsIcon}
                  onLongPress={onDrag}
                  disabled={!!disableReorder || !onDrag}
                >
                  <MaterialIcons
                    name="drag-indicator"
                    size={24}
                    color={disableReorder ? '#D3D3D3' : 'black'}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

export default UnitEditingRow;
