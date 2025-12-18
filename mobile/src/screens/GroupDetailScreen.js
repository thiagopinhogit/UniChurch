import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGroupById, joinGroup, leaveGroup, requestJoinGroup, approveJoinRequest, rejectJoinRequest, getGroupPendingRequests, deleteGroup, toggleGroupAdmin } from '../services/api';
import { getUser } from '../services/storage';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

export default function GroupDetailScreen({ route, navigation }) {
  const { group: initialGroup, groupId } = route.params;
  const [group, setGroup] = useState(initialGroup);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getUser();
      setCurrentUser(user);

      // Aceita tanto o objeto group quanto o groupId
      const id = groupId || initialGroup?._id;
      if (!id) {
        throw new Error('Group ID not provided');
      }

      const response = await getGroupById(id);
      const groupData = response.data;
      setGroup(groupData);

      // Admin da igreja sempre é membro e admin de todos os grupos
      const isChurchAdmin = user.is_church_admin || user.isAdmin || false;

      // Check if user is already a member (filtra nulls)
      const userIsMember = isChurchAdmin || groupData.members?.filter(m => m != null).some(m => m._id === user._id) || false;
      setIsMember(userIsMember);

      // Check if user is admin (admin da igreja OU admin do grupo)
      const userIsGroupAdmin = groupData.admins?.filter(adminId => adminId != null).some(adminId => 
        (typeof adminId === 'string' ? adminId : adminId._id) === user._id
      ) || false;
      
      const userIsAdmin = isChurchAdmin || userIsGroupAdmin;
      setIsAdmin(userIsAdmin);

      // Check if user has pending request (filtra nulls e verifica tipo)
      const userHasPending = !isChurchAdmin && groupData.pending_requests?.filter(req => req != null).some(req => 
        (typeof req === 'string' ? req : req._id) === user._id
      ) || false;
      setHasPendingRequest(userHasPending);

      // Load pending requests if user is admin
      if (userIsAdmin && groupData.is_private) {
        try {
          const requestsRes = await getGroupPendingRequests(id);
          setPendingRequests((requestsRes.data || []).filter(r => r != null));
        } catch (error) {
          console.error('Error loading pending requests:', error);
        }
      }
    } catch (error) {
      console.error('Error loading group:', error);
      Alert.alert('Erro', 'Não foi possível carregar o grupo.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!currentUser) return;

    // Se o grupo for privado, solicita entrada ao invés de entrar diretamente
    if (group.is_private) {
      handleRequestJoin();
      return;
    }

    setActionLoading(true);
    try {
      await joinGroup(group._id, currentUser._id);
      Alert.alert('Sucesso', 'Você entrou no grupo!');
      setIsMember(true);
      // Reload data to get updated member count
      await loadData();
    } catch (error) {
      console.error('Error joining group:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Não foi possível entrar no grupo.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestJoin = async () => {
    if (!currentUser) return;

    setActionLoading(true);
    try {
      await requestJoinGroup(group._id, currentUser._id);
      Alert.alert(
        'Solicitação enviada', 
        'Sua solicitação foi enviada aos administradores do grupo.'
      );
      setHasPendingRequest(true);
      await loadData();
    } catch (error) {
      console.error('Error requesting to join:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Não foi possível enviar a solicitação.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRequest = async (userId) => {
    setActionLoading(true);
    try {
      await approveJoinRequest(group._id, userId);
      Alert.alert('Sucesso', 'Solicitação aprovada!');
      await loadData();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível aprovar a solicitação.');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (userId) => {
    setActionLoading(true);
    try {
      await rejectJoinRequest(group._id, userId);
      Alert.alert('Sucesso', 'Solicitação recusada.');
      await loadData();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível recusar a solicitação.');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Sair do grupo',
      'Tem certeza que deseja sair deste grupo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: confirmLeaveGroup }
      ]
    );
  };

  const confirmLeaveGroup = async () => {
    if (!currentUser) return;

    setActionLoading(true);
    try {
      await leaveGroup(group._id, currentUser._id);
      Alert.alert('Sucesso', 'Você saiu do grupo.');
      setIsMember(false);
      await loadData();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair do grupo.');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (group.whatsapp_link) {
      Linking.openURL(group.whatsapp_link);
    }
  };

  const handleEditGroup = () => {
    navigation.navigate('EditGroup', { groupId: group._id });
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Excluir Grupo',
      `Tem certeza que deseja excluir o grupo "${group.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: confirmDeleteGroup 
        }
      ]
    );
  };

  const confirmDeleteGroup = async () => {
    setActionLoading(true);
    try {
      await deleteGroup(group._id);
      Alert.alert(
        'Sucesso', 
        'Grupo excluído com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o grupo.');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleGroupAdmin = async (member) => {
    if (!member || !currentUser) return;

    const isGroupAdmin = group.admins?.some(adminId => {
      const id = typeof adminId === 'string' ? adminId : adminId._id;
      return id === member._id;
    });

    Alert.alert(
      isGroupAdmin ? 'Remover Admin do Grupo' : 'Promover a Admin do Grupo',
      isGroupAdmin 
        ? `Remover ${member.name} como administrador deste grupo?\n\nEle não poderá mais gerenciar membros e configurações do grupo.`
        : `Promover ${member.name} a administrador deste grupo?\n\nEle poderá gerenciar membros e configurações do grupo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isGroupAdmin ? 'Remover' : 'Promover',
          style: isGroupAdmin ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setActionLoading(true);
              await toggleGroupAdmin(group._id, member._id);
              
              Alert.alert(
                'Sucesso',
                isGroupAdmin 
                  ? `${member.name} não é mais admin do grupo`
                  : `${member.name} agora é admin do grupo`
              );

              // Reload group data
              await loadData();
            } catch (error) {
              console.error('Error toggling group admin:', error);
              Alert.alert('Erro', 'Não foi possível atualizar as permissões');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const getGroupTypeLabel = (type) => {
    const labels = {
      'CELL': 'Célula',
      'HOBBY': 'Hobby',
      'PROFESSION': 'Profissão',
      'MINISTRY': 'Ministério',
      'SPORT': 'Esporte',
    };
    return labels[type] || type;
  };

  const getGroupIcon = (type) => {
    const icons = {
      'CELL': 'home',
      'HOBBY': 'color-palette',
      'PROFESSION': 'briefcase',
      'MINISTRY': 'heart',
      'SPORT': 'football',
    };
    return icons[type] || 'people';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Grupo não encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[
          styles.header,
          group.type === 'CELL' && styles.headerCell
        ]}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getGroupIcon(group.type)} 
              size={40} 
              color={colors.text} 
            />
          </View>
          <Text style={styles.name}>{group.name}</Text>
          
          {/* Categoria e Status */}
          <View style={styles.badgesRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{getGroupTypeLabel(group.type)}</Text>
            </View>
            <View style={[
              styles.privacyBadge,
              group.is_private ? styles.privacyBadgePrivate : styles.privacyBadgePublic
            ]}>
              <Ionicons 
                name={group.is_private ? 'lock-closed' : 'globe'} 
                size={12} 
                color={group.is_private ? colors.warning : colors.success} 
              />
              <Text style={[
                styles.privacyBadgeText,
                group.is_private ? styles.privacyBadgeTextPrivate : styles.privacyBadgeTextPublic
              ]}>
                {group.is_private ? 'Privado' : 'Aberto'}
              </Text>
            </View>
          </View>

          <View style={styles.memberCountContainer}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
          <Text style={styles.memberCount}>
              {(group.members && group.members.length > 0) 
                ? group.members.filter(m => m != null).length 
                : (group.member_count || 0)} {((group.members && group.members.length > 0) ? group.members.filter(m => m != null).length : group.member_count) === 1 ? 'membro' : 'membros'}
          </Text>
          </View>
        </View>

        {group.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Text style={styles.description}>{group.description}</Text>
          </View>
        )}

        {/* Seção de solicitações pendentes (apenas para admins) */}
        {isAdmin && pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Solicitações Pendentes ({pendingRequests.length})
            </Text>
            {pendingRequests.filter(request => request != null).map((request, index) => (
              <View key={index} style={styles.requestItem}>
                <Image 
                  source={request.photo_url ? { uri: request.photo_url } : require('../../assets/default-avatar.png')}
                  style={styles.requestAvatar}
                />
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{request.name || 'Usuário'}</Text>
                  <Text style={styles.requestDate}>
                    Solicitou entrada
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.requestButton, styles.requestButtonApprove]}
                    onPress={() => handleApproveRequest(request._id)}
                    disabled={actionLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.requestButton, styles.requestButtonReject]}
                    onPress={() => handleRejectRequest(request._id)}
                    disabled={actionLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {group.members && group.members.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Membros ({group.members.length})
            </Text>
            <View style={styles.membersContainer}>
              {group.members.filter(member => member != null).slice(0, 10).map((member, index) => {
                const isMemberAdmin = group.admins?.some(adminId => {
                  const id = typeof adminId === 'string' ? adminId : adminId._id;
                  return id === member._id;
                });

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.memberItem}
                    onPress={() => {
                      if (isAdmin) {
                        navigation.navigate('PersonProfile', { userId: member._id });
                      }
                    }}
                    onLongPress={() => {
                      if (isAdmin && member._id !== currentUser._id) {
                        handleToggleGroupAdmin(member);
                      }
                    }}
                    activeOpacity={isAdmin ? 0.7 : 1}
                  >
                    <Image 
                      source={member.photo_url ? { uri: member.photo_url } : require('../../assets/default-avatar.png')}
                      style={styles.memberAvatar}
                    />
                    {isMemberAdmin && (
                      <View style={styles.memberAdminBadge}>
                        <Ionicons name="shield-checkmark" size={10} color={colors.primary} />
                      </View>
                    )}
                    <Text style={styles.memberName} numberOfLines={1}>
                      {member.name || 'Usuário'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {group.member_count > 10 && (
              <Text style={styles.moreMembers}>
                + {group.member_count - 10} outros membros
              </Text>
            )}
            {isAdmin && (
              <Text style={styles.adminHint}>
                💡 Pressione e segure em um membro para promover/remover como admin do grupo
              </Text>
            )}
          </View>
        )}

        {isMember && group.whatsapp_link && (
          <View style={styles.section}>
            <Button
              title="Abrir grupo no WhatsApp"
              onPress={handleOpenWhatsApp}
              variant="secondary"
              icon={<Ionicons name="logo-whatsapp" size={20} color={colors.primary} />}
            />
          </View>
        )}

        {/* Seção de Administração (apenas para admins) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administração</Text>
            <View style={styles.adminActions}>
              <TouchableOpacity
                style={styles.adminButton}
                onPress={handleEditGroup}
                activeOpacity={0.7}
              >
                <View style={styles.adminButtonIcon}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.adminButtonText}>Editar Grupo</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminButton, styles.adminButtonDanger]}
                onPress={handleDeleteGroup}
                activeOpacity={0.7}
              >
                <View style={[styles.adminButtonIcon, styles.adminButtonIconDanger]}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </View>
                <Text style={[styles.adminButtonText, styles.adminButtonTextDanger]}>Excluir Grupo</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isMember ? (
          <Button
            title="Sair do grupo"
            onPress={handleLeaveGroup}
            variant="outline"
            loading={actionLoading}
          />
        ) : hasPendingRequest ? (
          <Button
            title="Solicitação Pendente"
            onPress={() => {}}
            variant="outline"
            disabled={true}
          />
        ) : (
          <Button
            title={group.is_private ? 'Solicitar Entrada' : 'Entrar no Grupo'}
            onPress={handleJoinGroup}
            loading={actionLoading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerCell: {
    backgroundColor: colors.primaryLight + '08',
    borderBottomColor: colors.primary + '30',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  privacyBadgePublic: {
    backgroundColor: colors.success + '20',
  },
  privacyBadgePrivate: {
    backgroundColor: colors.warning + '20',
  },
  privacyBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.1,
  },
  privacyBadgeTextPublic: {
    color: colors.success,
  },
  privacyBadgeTextPrivate: {
    color: colors.warning,
  },
  memberCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  memberCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberItem: {
    width: 70,
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.round,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  memberAdminBadge: {
    position: 'absolute',
    top: 0,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primaryLight + '40',
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  moreMembers: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    letterSpacing: -0.1,
  },
  adminHint: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.round,
    backgroundColor: colors.border,
  },
  requestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
    letterSpacing: -0.2,
  },
  requestDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  requestButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestButtonApprove: {
    backgroundColor: colors.success,
  },
  requestButtonReject: {
    backgroundColor: colors.error,
  },
  adminActions: {
    gap: spacing.sm,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  adminButtonDanger: {
    borderColor: colors.error + '30',
  },
  adminButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  adminButtonIconDanger: {
    backgroundColor: colors.error + '15',
  },
  adminButtonText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    letterSpacing: -0.2,
  },
  adminButtonTextDanger: {
    color: colors.error,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});

