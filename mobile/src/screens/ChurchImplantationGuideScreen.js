import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const IMPLANTATION_STEPS = [
  {
    id: 1,
    title: 'Passo 1: Apresente aos Pastores',
    icon: '⛪',
    duration: 'Semana 1',
    description: 'Comece pelo topo da hierarquia',
    details: [
      'Apresente o UniChurch aos pastores e líderes seniores da igreja',
      'Explique a visão: aumentar a conexão genuína entre os membros',
      'Mostre como a plataforma facilita o relacionamento e o discipulado',
      'Faça os pastores criarem seus perfis primeiro',
      'Incentive-os a compartilhar testemunhos e conteúdos edificantes'
    ],
    tips: '💡 Os pastores precisam ser os primeiros a abraçar a ferramenta. Sua adesão é crucial para o sucesso.',
    impact: 'Alto'
  },
  {
    id: 2,
    title: 'Passo 2: Capacite os Supervisores',
    icon: '👔',
    duration: 'Semana 2',
    description: 'Multiplicadores da visão',
    details: [
      'Realize um encontro com todos os supervisores e coordenadores',
      'Treine-os no uso da plataforma e nas melhores práticas',
      'Delegue a responsabilidade de treinar seus líderes de células/grupos',
      'Estabeleça metas de engajamento para cada supervisor',
      'Crie um grupo no WhatsApp para suporte e dúvidas'
    ],
    tips: '💡 Os supervisores são os multiplicadores. Invista tempo treinando-os bem.',
    impact: 'Muito Alto'
  },
  {
    id: 3,
    title: 'Passo 3: Ative os Líderes de Célula/Grupos',
    icon: '👥',
    duration: 'Semana 3',
    description: 'Ponto de contato direto com membros',
    details: [
      'Cada supervisor reúne seus líderes de célula/grupos',
      'Apresente o app de forma prática e interativa',
      '⭐ IMPORTANTE: Cada líder deve CRIAR o grupo da sua célula no app',
      'Demonstre como cadastrar membros usando o QR Code',
      'Mostre como criar eventos e compartilhar conteúdo',
      'Oriente sobre privacidade e respeito aos dados dos membros',
      'Verifique se cada líder criou o grupo da célula antes de sair'
    ],
    tips: '💡 Os líderes são a chave! Cada líder DEVE criar o grupo da sua célula no app antes do lançamento.',
    impact: 'Crítico'
  },
  {
    id: 4,
    title: 'Passo 4: Lançamento nas Células',
    icon: '🎯',
    duration: 'Semana 4',
    description: 'Momento de expansão massiva',
    details: [
      'Cada líder apresenta o app na próxima reunião de célula/grupo',
      'Faça o cadastro IN LOCO: todos baixam e se cadastram juntos',
      'Use o QR Code da igreja para agilizar o processo',
      'Ajude os membros a completarem seus perfis e interesses',
      '⭐ IMPORTANTE: Todos devem SOLICITAR ENTRADA no grupo da célula',
      'O líder aprova as solicitações imediatamente',
      'Incentive conexões imediatas entre membros com interesses similares'
    ],
    tips: '💡 O cadastro em grupo gera entusiasmo! E todos já ficam conectados à célula imediatamente.',
    impact: 'Muito Alto'
  },
  {
    id: 5,
    title: 'Passo 5: Manutenção e Engajamento',
    icon: '📈',
    duration: 'Contínuo',
    description: 'Sustentação do crescimento',
    details: [
      'Monitore o engajamento através do painel administrativo',
      'Celebre conexões e relacionamentos que surgirem',
      'Compartilhe testemunhos de membros que se conectaram',
      'Incentive líderes a promoverem a plataforma regularmente',
      'Faça atualizações periódicas de grupos e eventos',
      'Cadastre novos membros sempre que chegarem à igreja'
    ],
    tips: '💡 A chave do sucesso é manter o app vivo com conteúdo e novos membros constantemente.',
    impact: 'Sustentação'
  }
];

export default function ChurchImplantationGuideScreen({ navigation, route }) {
  const { church, onComplete, onSkip } = route.params || {};
  const [expandedStep, setExpandedStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const toggleStep = (stepId) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const markStepAsRead = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleFinish = () => {
    if (allStepsRead) {
      // Leu todos os passos - marca como completo
      if (onComplete) {
        onComplete();
      }
      navigation.goBack();
    } else {
      // Não leu tudo - apenas pula (NÃO marca como completo)
      if (onSkip) {
        onSkip();
      }
      navigation.goBack();
    }
  };

  const allStepsRead = completedSteps.length === IMPLANTATION_STEPS.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🚀</Text>
          <Text style={styles.title}>Guia de Implantação</Text>
          <Text style={styles.subtitle}>
            Siga esta estratégia comprovada para maximizar a conexão na sua igreja
          </Text>
        </View>

        <View style={styles.strategyBox}>
          <Text style={styles.strategyIcon}>🎯</Text>
          <View style={styles.strategyContent}>
            <Text style={styles.strategyTitle}>A Estratégia em Cascata</Text>
            <Text style={styles.strategyText}>
              A implantação deve seguir a hierarquia da igreja:{'\n'}
              Pastores → Supervisores → Líderes → Membros{'\n\n'}
              Cada nível treina o próximo, garantindo engajamento e compreensão da visão.
            </Text>
          </View>
        </View>

        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            {completedSteps.length} de {IMPLANTATION_STEPS.length} passos lidos
          </Text>
        </View>

        {IMPLANTATION_STEPS.map((step, index) => (
          <ImplantationStep
            key={step.id}
            step={step}
            isExpanded={expandedStep === step.id}
            isCompleted={completedSteps.includes(step.id)}
            onToggle={() => toggleStep(step.id)}
            onMarkAsRead={() => markStepAsRead(step.id)}
            isLast={index === IMPLANTATION_STEPS.length - 1}
          />
        ))}

        <View style={styles.finalTipBox}>
          <Text style={styles.finalTipIcon}>⚡</Text>
          <View style={styles.finalTipContent}>
            <Text style={styles.finalTipTitle}>Dica Final</Text>
            <Text style={styles.finalTipText}>
              O sucesso do UniChurch depende da adesão dos líderes! Quando os líderes abraçam a ferramenta, os membros seguem naturalmente. Invista tempo com eles.
            </Text>
          </View>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Resultado Esperado</Text>
          <View style={styles.resultItem}>
            <Text style={styles.resultIcon}>✅</Text>
            <Text style={styles.resultText}>
              Aumento significativo nas conexões entre membros
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultIcon}>✅</Text>
            <Text style={styles.resultText}>
              Redução da sensação de solidão na comunidade
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultIcon}>✅</Text>
            <Text style={styles.resultText}>
              Fortalecimento de células e grupos
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultIcon}>✅</Text>
            <Text style={styles.resultText}>
              Maior engajamento em eventos e ministérios
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultIcon}>✅</Text>
            <Text style={styles.resultText}>
              Integração mais rápida de novos membros
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={allStepsRead ? "Concluir tutorial ✓" : "Concluir depois"}
          onPress={handleFinish}
          size="large"
          variant={allStepsRead ? "primary" : "secondary"}
        />
      </View>
    </SafeAreaView>
  );
}

function ImplantationStep({ step, isExpanded, isCompleted, onToggle, onMarkAsRead, isLast }) {
  const getImpactColor = () => {
    switch (step.impact) {
      case 'Crítico': return colors.error;
      case 'Muito Alto': return colors.primary;
      case 'Alto': return colors.success;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.stepContainer}>
      <TouchableOpacity 
        style={[
          styles.stepHeader,
          isExpanded && styles.stepHeaderExpanded,
          isCompleted && styles.stepHeaderCompleted
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.stepHeaderLeft}>
          <View style={[
            styles.stepIconContainer,
            isCompleted && styles.stepIconContainerCompleted
          ]}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
          </View>
          <View style={styles.stepHeaderContent}>
            <View style={styles.stepTitleRow}>
              <Text style={[
                styles.stepTitle,
                isCompleted && styles.stepTitleCompleted
              ]}>
                {step.title}
              </Text>
              {isCompleted && (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} style={{ marginLeft: 8 }} />
              )}
            </View>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.stepMetaRow}>
              <View style={styles.stepDurationBadge}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.stepDuration}>{step.duration}</Text>
              </View>
              <View style={[styles.stepImpactBadge, { backgroundColor: getImpactColor() + '15' }]}>
                <Text style={[styles.stepImpact, { color: getImpactColor() }]}>
                  Impacto: {step.impact}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.stepContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Como executar:</Text>
            {step.details.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.detailBullet}>
                  <Text style={styles.detailBulletText}>{index + 1}</Text>
                </View>
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tipsSection}>
            <Text style={styles.tipsText}>{step.tips}</Text>
          </View>

          {!isCompleted && (
            <Button
              title="Marcar como lido"
              onPress={onMarkAsRead}
              variant="secondary"
              size="small"
            />
          )}
        </View>
      )}

      {!isLast && <View style={styles.stepConnector} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
    paddingHorizontal: spacing.md,
  },
  strategyBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    marginBottom: spacing.lg,
  },
  strategyIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  strategyContent: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  strategyText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  progressIndicator: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  progressText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    letterSpacing: -0.1,
  },
  stepContainer: {
    marginBottom: spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.small,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  stepHeaderExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  stepHeaderCompleted: {
    borderColor: colors.success + '30',
    backgroundColor: colors.success + '05',
  },
  stepHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepIconContainerCompleted: {
    backgroundColor: colors.success + '15',
  },
  stepIcon: {
    fontSize: 28,
  },
  stepHeaderContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: spacing.xxs,
  },
  stepTitleCompleted: {
    color: colors.success,
  },
  stepDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: -0.1,
  },
  stepMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  stepDuration: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  stepImpactBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: borderRadius.sm,
  },
  stepImpact: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  stepContent: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  detailsSection: {
    marginBottom: spacing.md,
  },
  detailsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  detailBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  detailBulletText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.card,
  },
  detailText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  tipsSection: {
    backgroundColor: colors.warning + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    marginBottom: spacing.md,
  },
  tipsText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  stepConnector: {
    width: 2,
    height: spacing.md,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 27,
  },
  finalTipBox: {
    flexDirection: 'row',
    backgroundColor: colors.secondary + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.secondary + '30',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  finalTipIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  finalTipContent: {
    flex: 1,
  },
  finalTipTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  finalTipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  resultBox: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.small,
    borderWidth: 2,
    borderColor: colors.success + '30',
  },
  resultTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resultIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  resultText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});

