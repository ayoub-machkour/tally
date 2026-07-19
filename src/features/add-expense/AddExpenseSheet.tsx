import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Keypad } from './components/Keypad';
import { CategoryGrid } from './components/CategoryGrid';
import { useExpenseStore } from '@/store/expenseStore';
import { parseAmount, formatCurrency } from '@/lib/currency';
import { colors, typography, spacing, radii, shadows, animation } from '@/ui/tokens';
import type { CategoryId } from '@/domain/types';

const absoluteFillStyles = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

let idCounter = Date.now();
function generateId(): string {
  return `exp_${++idCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddExpenseSheet({ visible, onClose }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const addExpense = useExpenseStore((s) => s.addExpense);
  const showToast = useExpenseStore((s) => s.showToast);
  const currency = useExpenseStore((s) => s.settings.currency);
  const selectedDate = useExpenseStore((s) => s.selectedDate);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  // Sheet slide animation
  const translateY = useSharedValue(Dimensions.get('window').height);

  // Checkmark animation
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setAmount('');
      setNote('');
      setSaved(false);
      checkScale.value = 0;
      checkOpacity.value = 0;
      translateY.value = withSpring(0, {
        damping: 26,
        stiffness: 260,
        mass: 0.9,
      });
    } else {
      translateY.value = withTiming(Dimensions.get('window').height, {
        duration: reducedMotion ? 0 : 280,
      });
    }
  }, [visible, reducedMotion, translateY, checkScale, checkOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const handleSave = useCallback(async () => {
    const num = parseAmount(amount);
    if (num <= 0) return;

    // Build timestamp: today's time but on selectedDate
    const selectedTs = new Date(selectedDate + 'T' + new Date().toTimeString().slice(0, 8)).getTime();

    const expense = {
      id: generateId(),
      amount: num,
      category,
      note: note.trim().slice(0, 100),
      createdAt: selectedTs,
    };

    // Spring checkmark
    if (!reducedMotion) {
      checkScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 400 }),
        withSpring(1, animation.spring),
      );
      checkOpacity.value = withTiming(1, { duration: 150 });
    }
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);

    await addExpense(expense);
    showToast(`Logged ${formatCurrency(num, currency)}`);

    setTimeout(() => {
      onClose();
      setSaved(false);
    }, 600);
  }, [amount, category, note, selectedDate, currency, addExpense, showToast, onClose, reducedMotion, checkScale, checkOpacity]);

  const displayAmount = amount || '0';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing['5']) },
            sheetStyle,
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Amount display */}
            <View style={styles.amountSection}>
              <Animated.Text style={styles.amountPrefix}>{currency}</Animated.Text>
              <Animated.Text style={styles.amountDisplay} numberOfLines={1}>
                {displayAmount}
              </Animated.Text>
            </View>

            {/* Checkmark overlay (spring) */}
            {saved && (
              <Animated.View style={[styles.checkOverlay, checkStyle]}>
                <Animated.Text style={styles.checkMark}>✓</Animated.Text>
              </Animated.View>
            )}

            {/* Category grid */}
            <View style={styles.section}>
              <CategoryGrid selected={category} onSelect={setCategory} />
            </View>

            {/* Note input */}
            <View style={styles.noteSection}>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note (optional)"
                placeholderTextColor={colors.muted}
                value={note}
                onChangeText={setNote}
                maxLength={100}
                returnKeyType="done"
                accessibilityLabel="Note"
              />
            </View>

            {/* Keypad */}
            <View style={styles.keypadSection}>
              <Keypad value={amount} onChange={setAmount} />
            </View>

            {/* Save button */}
            <View style={styles.saveSection}>
              <Pressable
                style={[
                  styles.saveBtn,
                  parseAmount(amount) <= 0 && styles.saveBtnDisabled,
                ]}
                onPress={handleSave}
                disabled={parseAmount(amount) <= 0 || saved}
                accessibilityRole="button"
                accessibilityLabel="Log expense"
                accessibilityState={{ disabled: parseAmount(amount) <= 0 }}
              >
                <Animated.Text style={styles.saveBtnLabel}>Log expense</Animated.Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...absoluteFillStyles,
    backgroundColor: 'rgba(23,21,31,0.5)',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    paddingTop: spacing['3'],
    maxHeight: '92%',
    ...shadows.hero,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: spacing['5'],
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['4'],
    gap: spacing['1'],
    minHeight: 80,
  },
  amountPrefix: {
    fontFamily: typography.serifFamily,
    fontSize: 32,
    color: colors.muted,
    lineHeight: 40,
  },
  amountDisplay: {
    fontFamily: typography.serifFamily,
    fontSize: 56,
    color: colors.ink,
    letterSpacing: -2,
    lineHeight: 60,
    fontVariant: ['tabular-nums'],
  },
  checkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: spacing['5'],
    zIndex: 10,
  },
  checkMark: {
    fontSize: 48,
    color: colors.success,
    fontFamily: typography.sansFamily,
  },
  section: {
    paddingVertical: spacing['3'],
  },
  noteSection: {
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['2'],
  },
  noteInput: {
    fontFamily: typography.sansFamily,
    fontSize: typography.size.base,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.line,
  },
  keypadSection: {
    paddingTop: spacing['3'],
    paddingBottom: spacing['2'],
  },
  saveSection: {
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['3'],
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.xl,
    paddingVertical: spacing['5'],
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.size.md,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
