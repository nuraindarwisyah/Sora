
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import {useCreateExpense} from '../hooks/useExpenses';
import {EXPENSE_CATEGORIES} from '../constants/expenseCategories';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';

function AddExpenseScreen() {
  const createExpenseMutation = useCreateExpense();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const isSaving = createExpenseMutation.isPending;

  // Select a receipt image and copy it into private app storage.
  const handleChooseImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Image Error',
          result.errorMessage || 'Unable to select an image.',
        );
        return;
      }

      const selectedImage = result.assets?.[0];

      if (!selectedImage?.uri) {
        Alert.alert(
          'Image Error',
          'No image was selected. Please try again.',
        );
        return;
      }

      // Determine the image file extension.
      const extension =
        selectedImage.fileName?.match(/\.[^/.]+$/)?.[0] || '.jpg';

      const fileName = `expense_${Date.now()}${extension}`;
      const destinationPath =
        `${RNFS.DocumentDirectoryPath}/${fileName}`;

      let sourcePath = selectedImage.uri;

      if (sourcePath.startsWith('file://')) {
        sourcePath = sourcePath.replace(/^file:\/\//, '');
      } else if (sourcePath.startsWith('content://')) {
        Alert.alert(
          'Unable to save image',
          'The selected image uses a content URI that this copy method cannot handle. Please choose another image.',
        );
        return;
      }

      await RNFS.copyFile(sourcePath, destinationPath);

      setImageUri(`file://${destinationPath}`);

      Alert.alert(
        'Image saved',
        'The receipt image has been saved locally.',
      );
    } catch (error) {
      console.warn('Image selection or storage error:', error);

      Alert.alert(
        'Image Error',
        'Unable to save the selected image. Please try again.',
      );
    }
  };

  // Save the expense through the existing React Query mutation.
  const handleSave = async () => {
    const numericAmount = Number(amount);

    if (
      !title.trim() ||
      !amount.trim() ||
      !category.trim() ||
      !date.trim() ||
      (category === 'Other' && !otherCategory.trim())
    ) {
      Alert.alert(
        'Missing information',
        category === 'Other' && !otherCategory.trim()
          ? 'Please enter your own category.'
          : 'Please fill in the title, amount, category, and date.',
      );
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert(
        'Invalid amount',
        'Please enter an amount greater than zero.',
      );
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert(
        'Invalid date',
        'Please enter the date in YYYY-MM-DD format.',
      );
      return;
    }

    // Check that the date is a real calendar date.
    const [year, month, day] = date.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);

    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      Alert.alert(
        'Invalid date',
        'Please enter a valid calendar date.',
      );
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        title: title.trim(),
        amount: numericAmount,
        category:
          category === 'Other'
            ? otherCategory.trim()
            : category,
        date,
        description: description.trim() || undefined,
        attachment: imageUri || undefined,
      });

      Alert.alert('Success', 'Your expense has been saved.');

      // Clear the form after a successful save.
      setTitle('');
      setAmount('');
      setCategory('');
      setOtherCategory('');
      setShowCategoryOptions(false);
      setDate(new Date().toISOString().slice(0, 10));
      setDescription('');
      setImageUri(null);
    } catch (error) {
      console.warn('Save expense error:', error);

      Alert.alert(
        'Unable to save expense',
        'Your expense could not be saved. Please check your connection and try again.',
      );
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Text style={styles.brand}>sora.</Text>

      <View style={styles.heading}>
        <Text style={styles.title}>Add expense</Text>

        <Text style={styles.subtitle}>
          Record a new expense to keep your spending organised.
        </Text>
      </View>

      <View style={styles.form}>
        {/* Expense title */}
        <Text style={styles.label}>Expense title</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Lunch"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          editable={!isSaving}
          maxLength={100}
          returnKeyType="next"
        />

        {/* Amount */}
        <Text style={styles.label}>Amount (RM)</Text>

        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!isSaving}
        />

        {/* Category dropdown */}
        <Text style={styles.label}>Category</Text>

        <TouchableOpacity
          style={[
            styles.categoryDropdown,
            showCategoryOptions && styles.categoryDropdownActive,
          ]}
          activeOpacity={0.8}
          disabled={isSaving}
          onPress={() =>
            setShowCategoryOptions(current => !current)
          }>
          <Text
            style={[
              styles.categoryDropdownText,
              !category && styles.categoryPlaceholder,
            ]}>
            {category || 'Select a category'}
          </Text>

          <Text style={styles.dropdownArrow}>
            {showCategoryOptions ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showCategoryOptions && (
          <View style={styles.categoryOptions}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={styles.categoryOptionsScroll}>
              {EXPENSE_CATEGORIES.map((item, index) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryOption,
                    index === EXPENSE_CATEGORIES.length - 1 &&
                      styles.lastCategoryOption,
                    category === item &&
                      styles.selectedCategoryOption,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryOptions(false);

                    if (item !== 'Other') {
                      setOtherCategory('');
                    }
                  }}>
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === item &&
                        styles.selectedCategoryOptionText,
                    ]}>
                    {item}
                  </Text>

                  {category === item && (
                    <Text style={styles.selectedMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Custom category when Other is selected */}
        {category === 'Other' && (
          <>
            <Text style={styles.label}>Your category</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Pet supplies"
              placeholderTextColor={colors.textSecondary}
              value={otherCategory}
              onChangeText={setOtherCategory}
              editable={!isSaving}
              maxLength={50}
            />
          </>
        )}

        {/* Date */}
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>

        <TextInput
          style={styles.input}
          placeholder="2026-10-26"
          placeholderTextColor={colors.textSecondary}
          value={date}
          onChangeText={setDate}
          editable={!isSaving}
          autoCapitalize="none"
          maxLength={10}
        />

        {/* Description */}
        <Text style={styles.label}>Description (optional)</Text>

        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Add some details"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          editable={!isSaving}
          maxLength={500}
        />

        {/* Receipt image */}
        <Text style={styles.label}>Receipt image (optional)</Text>

        <TouchableOpacity
          style={[
            styles.imageButton,
            isSaving && styles.buttonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleChooseImage}
          disabled={isSaving}>
          <Text style={styles.imageButtonText}>
            {imageUri ? 'Change image' : 'Choose image'}
          </Text>
        </TouchableOpacity>

        {/* Receipt image preview */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{uri: imageUri}}
              style={styles.imagePreview}
              resizeMode="cover"
              onError={() => {
                console.warn('Unable to display image:', imageUri);
              }}
            />

            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImageUri(null)}
              disabled={isSaving}
              activeOpacity={0.7}>
              <Text style={styles.removeImageText}>
                Remove image
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Save expense */}
        <TouchableOpacity
          style={[
            styles.button,
            isSaving && styles.buttonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Save expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  brand: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xl,
  },

  heading: {
    marginBottom: spacing.xl,
  },

  title: {
    color: colors.primary,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  form: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.lg,
  },

  label: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },

  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.primary,
    fontSize: typography.fontSize.sm,
  },

  categoryDropdown: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryDropdownActive: {
    borderColor: colors.primary,
  },

  categoryDropdownText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },

  categoryPlaceholder: {
    color: colors.textSecondary,
  },

  dropdownArrow: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: spacing.sm,
  },

  categoryOptions: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },

  categoryOptionsScroll: {
    maxHeight: 220,
  },

  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  lastCategoryOption: {
    borderBottomWidth: 0,
  },

  selectedCategoryOption: {
    backgroundColor: colors.secondary,
  },

  categoryOptionText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },

  selectedCategoryOptionText: {
    fontWeight: typography.fontWeight.semibold,
  },

  selectedMark: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.sm,
  },

  descriptionInput: {
    minHeight: 90,
  },

  imageButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.xs,
  },

  imageButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  imageContainer: {
    marginTop: spacing.md,
  },

  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.background,
  },

  removeImageButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },

  removeImageText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: spacing.xl,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default AddExpenseScreen;
