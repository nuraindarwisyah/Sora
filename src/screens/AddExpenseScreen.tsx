import React, {useState} from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import {useCreateExpense} from '../hooks/useExpenses';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';
import {EXPENSE_CATEGORIES} from '../constants/expenseCategories';


const CATEGORY_ICONS: Record<
  string,
  React.ComponentProps<typeof Ionicons>['name']
> = {
  'Food & Drinks': 'restaurant-outline',
  Transport: 'car-outline',
  Shopping: 'bag-handle-outline',
  'Bills & Utilities': 'receipt-outline',
  Groceries: 'basket-outline',
  Health: 'medkit-outline',
  Education: 'book-outline',
  Entertainment: 'game-controller-outline',
  Travel: 'airplane-outline',
  'Personal Care': 'cut-outline',
  Housing: 'home-outline',
  Other: 'grid-outline',
};

const CATEGORY_COLORS = [
  '#CFF7D3',
  '#FCE0C5',
  '#F8D0D3',
  '#BFE7EA',
  '#FBF5C7',
  '#DFDFF7',
  '#FFE5B4',
  '#E7DDF5',
  '#D6E9F9',
  '#F5DDEB',
  '#E4E0D7',
  '#DADCE5',
];

const AddExpenseScreen = ({navigation}: any) => {
  const createExpenseMutation = useCreateExpense();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setDropdownVisible(false);

    if (selectedCategory !== 'Other') {
      setOtherCategory('');
    }
  };

  const handleChooseImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Unable to select image',
          result.errorMessage || 'Please try again.',
        );
        return;
      }

      const image = result.assets?.[0];

      if (!image?.uri) {
        return;
      }

      setLoadingImage(true);

      const extension = image.fileName?.split('.').pop() || 'jpg';
      const destinationPath =
        `${RNFS.DocumentDirectoryPath}/receipt_${Date.now()}.${extension}`;

      const sourcePath = image.uri.startsWith('file://')
        ? image.uri.replace('file://', '')
        : image.uri;

      await RNFS.copyFile(sourcePath, destinationPath);

      setAttachment(`file://${destinationPath}`);
    } catch (error) {
      console.error('Image selection error:', error);

      Alert.alert(
        'Image Error',
        'Unable to save the selected image. Please try again.',
      );
    } finally {
      setLoadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setAttachment(null);
  };

  const handleSaveExpense = async () => {
    const finalCategory =
      category === 'Other' ? otherCategory.trim() : category;

    if (!title.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter an expense title.',
      );
      return;
    }

    if (!amount.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter an amount.',
      );
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid amount greater than zero.',
      );
      return;
    }

    if (!category) {
      Alert.alert(
        'Missing Information',
        'Please select an expense category.',
      );
      return;
    }

    if (category === 'Other' && !otherCategory.trim()) {
      Alert.alert(
        'Missing Category',
        'Please enter your custom category.',
      );
      return;
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      Alert.alert(
        'Invalid Date',
        'Please enter a valid date in YYYY-MM-DD format.',
      );
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        title: title.trim(),
        amount: numericAmount,
        category: finalCategory,
        date,
        description: description.trim(),
        attachment: attachment || undefined,
      });

      Alert.alert(
        'Expense Added',
        'Your expense has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setAmount('');
              setCategory('');
              setOtherCategory('');
              setDate(new Date().toISOString().split('T')[0]);
              setDescription('');
              setAttachment(null);

              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      console.error('Save expense error:', error);

      Alert.alert(
        'Unable to Save',
        'Your expense could not be saved. Please check your connection and try again.',
      );
    }
  };

  const isSaving = createExpenseMutation.isPending;

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.heading}>Add Expense</Text>
            <Text style={styles.subtitle}>
              Record a new expense
            </Text>
          </View>
        </View>

        {/* Expense Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Expense Details</Text>

          <Text style={styles.label}>Expense Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Lunch with friends"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <Text style={styles.label}>Amount (RM)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          {/* Category Dropdown */}
          <Text style={styles.label}>Category</Text>

          <TouchableOpacity
            style={[
              styles.dropdownButton,
              dropdownVisible && styles.dropdownButtonActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setDropdownVisible(true)}>
            <View style={styles.dropdownSelectedContent}>
              {category ? (
                <View
                  style={[
                    styles.selectedCategoryIcon,
                    {
                      backgroundColor:
                        CATEGORY_COLORS[
                          EXPENSE_CATEGORIES.indexOf(
                            category as (typeof EXPENSE_CATEGORIES)[number],
                          ) % CATEGORY_COLORS.length
                        ] || CATEGORY_COLORS[11],
                    },
                  ]}>
                  <Ionicons
                    name={CATEGORY_ICONS[category] || 'apps-outline'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
              ) : null}

              <Text
                style={[
                  styles.dropdownButtonText,
                  !category && styles.placeholderText,
                ]}>
                {category || 'Select a category'}
              </Text>
            </View>

            <Ionicons
              name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>

          {/* Custom Category */}
          {category === 'Other' && (
            <View>
              <Text style={styles.label}>Custom Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Pet Supplies"
                placeholderTextColor={colors.textSecondary}
                value={otherCategory}
                onChangeText={setOtherCategory}
                maxLength={50}
                autoCapitalize="words"
              />
            </View>
          )}

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={date}
            onChangeText={setDate}
          />

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Add some details..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Receipt */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Receipt</Text>
          <Text style={styles.receiptSubtitle}>
            Attach a photo of your receipt if you have one.
          </Text>

          {attachment ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{uri: attachment}}
                style={styles.imagePreview}
                resizeMode="cover"
              />

              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}>
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#B83D50"
                />
                <Text style={styles.removeImageText}>
                  Remove Receipt
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleChooseImage}
              disabled={loadingImage}
              activeOpacity={0.8}>
              <Ionicons
                name="cloud-upload-outline"
                size={30}
                color={colors.primary}
              />

              <Text style={styles.uploadButtonTitle}>
                {loadingImage
                  ? 'Adding receipt...'
                  : 'Upload Receipt'}
              </Text>

              <Text style={styles.uploadButtonSubtitle}>
                Choose an image from your gallery
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (isSaving || loadingImage) && styles.disabledButton,
          ]}
          onPress={handleSaveExpense}
          disabled={isSaving || loadingImage}
          activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving Expense...' : 'Save Expense'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDropdownVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}>
          <Pressable
            style={styles.dropdownModal}
            onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  Select Category
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose a category for this expense.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setDropdownVisible(false)}
                style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={23}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.categoryScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {EXPENSE_CATEGORIES.map((item, index) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryOption,
                    category === item &&
                      styles.categoryOptionSelected,
                    index === EXPENSE_CATEGORIES.length - 1 &&
                      styles.lastCategoryOption,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectCategory(item)}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          CATEGORY_COLORS[
                            index % CATEGORY_COLORS.length
                          ],
                      },
                    ]}>
                    <Ionicons
                      name={CATEGORY_ICONS[item] || 'apps-outline'}
                      size={22}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === item &&
                        styles.categoryOptionTextSelected,
                    ]}>
                    {item}
                  </Text>

                  {category === item && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  headerTextContainer: {
    flex: 1,
  },

  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.primary,
    fontSize: typography.fontSize.md,
    backgroundColor: colors.background,
  },

  descriptionInput: {
    minHeight: 100,
  },

  dropdownButton: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },

  dropdownButtonActive: {
    borderColor: colors.primary,
  },

  dropdownSelectedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedCategoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  dropdownButtonText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },

  placeholderText: {
    color: colors.textSecondary,
  },

  receiptSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },

  uploadButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  uploadButtonTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginTop: spacing.sm,
  },

  uploadButtonSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  imagePreviewContainer: {
    alignItems: 'center',
  },

  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.background,
  },

  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },

  removeImageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#B83D50',
    marginLeft: spacing.xs,
  },

  saveButton: {
    minHeight: 54,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },

  saveButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  disabledButton: {
    opacity: 0.6,
  },

  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },

  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  dropdownModal: {
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.lg,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  modalSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  categoryScroll: {
    flexGrow: 0,
  },

  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 12,
  },

  categoryOptionSelected: {
    backgroundColor: colors.background,
  },

  lastCategoryOption: {
    borderBottomWidth: 0,
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  categoryOptionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },

  categoryOptionTextSelected: {
    fontWeight: typography.fontWeight.bold,
  },
});

export default AddExpenseScreen;