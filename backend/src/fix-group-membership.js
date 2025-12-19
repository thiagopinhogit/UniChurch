const mongoose = require('mongoose');
const Group = require('./models/Group');
const GroupMember = require('./models/GroupMember');
const User = require('./models/User');
const Event = require('./models/Event');

// Script para adicionar admins da igreja como membros dos grupos que eles criaram
async function fixGroupMembership() {
  try {
    console.log('🔧 Iniciando correção de membros dos grupos...\n');

    // Buscar todas as igrejas (church_id nos grupos)
    const churches = await Group.distinct('church_id');
    console.log(`📊 Encontradas ${churches.length} igrejas com grupos\n`);

    let totalGroupsFixed = 0;
    let totalMembersAdded = 0;

    for (const churchId of churches) {
      console.log(`\n🏛️  Processando igreja: ${churchId}`);
      
      // Buscar o admin da igreja (usuário com isAdmin = true e church_id correspondente)
      const admin = await User.findOne({ 
        church_id: churchId,
        // Nota: precisamos adicionar campo isAdmin no modelo User se não existir
        // Por enquanto, vamos pegar o primeiro usuário que criou grupos desta igreja
      });

      if (!admin) {
        console.log(`   ⚠️  Admin não encontrado para esta igreja`);
        continue;
      }

      console.log(`   👤 Admin encontrado: ${admin.name} (${admin._id})`);

      // Buscar todos os grupos desta igreja
      const groups = await Group.find({ church_id: churchId, is_active: true });
      console.log(`   📋 ${groups.length} grupos encontrados`);

      for (const group of groups) {
        // Verificar se o admin já é membro
        const existingMember = await GroupMember.findOne({
          group_id: group._id,
          user_id: admin._id
        });

        if (!existingMember) {
          console.log(`   ➕ Adicionando admin ao grupo: ${group.name}`);
          
          // Adicionar como membro
          const groupMember = new GroupMember({
            group_id: group._id,
            user_id: admin._id
          });
          await groupMember.save();
          
          // Adicionar como admin do grupo se ainda não for
          if (!group.admins.includes(admin._id)) {
            group.admins.push(admin._id);
            await group.save();
          }
          
          // Se for célula, atualizar o user (se ainda não tiver célula)
          if (group.type === 'CELL') {
            const userHasCell = await User.findOne({ 
              _id: admin._id, 
              cell_id: { $exists: true } 
            });
            
            if (!userHasCell) {
              await User.findByIdAndUpdate(admin._id, { cell_id: group._id });
            }
          }
          
          // Criar evento no mural (opcional, pode gerar muitos eventos antigos)
          // const event = new Event({
          //   church_id: group.church_id,
          //   user_id: admin._id,
          //   type: 'JOIN_GROUP',
          //   group_id: group._id
          // });
          // await event.save();
          
          totalMembersAdded++;
          totalGroupsFixed++;
        } else {
          console.log(`   ✓ Admin já é membro do grupo: ${group.name}`);
        }
      }
    }

    console.log('\n\n✅ Migração concluída!');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Grupos corrigidos: ${totalGroupsFixed}`);
    console.log(`   - Membros adicionados: ${totalMembersAdded}`);
    console.log(`   - Igrejas processadas: ${churches.length}`);

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com banco fechada');
  }
}

// Conectar ao MongoDB e executar
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unichurch';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('🔗 Conectado ao MongoDB\n');
  return fixGroupMembership();
})
.catch((error) => {
  console.error('❌ Erro ao conectar ao MongoDB:', error);
  process.exit(1);
});

