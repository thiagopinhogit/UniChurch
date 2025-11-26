require('dotenv').config();
const mongoose = require('mongoose');
const Church = require('./models/Church');
const User = require('./models/User');
const Group = require('./models/Group');
const GroupMember = require('./models/GroupMember');
const InterestTag = require('./models/InterestTag');
const Event = require('./models/Event');

const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const shuffleArray = (array) => {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const churchesData = [
  {
    name: 'Igreja UniChurch São Paulo',
    city: 'São Paulo',
    qr_code_id: 'unichurch-sp-main',
    logo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    location: { type: 'Point', coordinates: [-46.6333, -23.5505] },
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    admin_email: 'admin.sp@unichurch.com',
    admin_password: 'unichurch123',
    admin_name: 'Pr. Gabriel Silva'
  },
  {
    name: 'Igreja Comunidade Rio de Janeiro',
    city: 'Rio de Janeiro',
    qr_code_id: 'comunidade-rj-copacabana',
    logo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
    location: { type: 'Point', coordinates: [-43.1729, -22.9068] },
    address: 'Av. Atlântica, 500 - Copacabana, Rio de Janeiro - RJ',
    admin_email: 'admin.rj@unichurch.com',
    admin_password: 'unichurch123',
    admin_name: 'Pra. Daniela Albuquerque'
  },
  {
    name: 'Igreja Nova Vida Curitiba',
    city: 'Curitiba',
    qr_code_id: 'nova-vida-curitiba',
    logo_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300',
    location: { type: 'Point', coordinates: [-49.2643, -25.4284] },
    address: 'Rua XV de Novembro, 100 - Centro, Curitiba - PR',
    admin_email: 'admin.ctba@unichurch.com',
    admin_password: 'unichurch123',
    admin_name: 'Pr. Henrique Mattos'
  },
  {
    name: 'Igreja Renascer Londrina',
    city: 'Londrina',
    qr_code_id: 'renascer-londrina',
    logo_url: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=300',
    location: { type: 'Point', coordinates: [-51.1628, -23.3045] },
    address: 'Av. Higienópolis, 200 - Centro, Londrina - PR',
    admin_email: 'admin.ldn@unichurch.com',
    admin_password: 'unichurch123',
    admin_name: 'Pra. Camila Ribeiro'
  },
  {
    name: 'Igreja Esperança Maringá',
    city: 'Maringá',
    qr_code_id: 'esperanca-maringa',
    logo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    location: { type: 'Point', coordinates: [-51.9389, -23.4205] },
    address: 'Av. Brasil, 300 - Centro, Maringá - PR',
    admin_email: 'admin.mga@unichurch.com',
    admin_password: 'unichurch123',
    admin_name: 'Pr. Eduardo Lopes'
  }
];

const memberProfiles = [
  { name: 'Ana Souza', profession: 'Designer UX', instagram: '@ana.souza', whatsappSuffix: '001' },
  { name: 'Lucas Oliveira', profession: 'Engenheiro de Software', instagram: '@lucasoliv', whatsappSuffix: '002' },
  { name: 'Mariana Lima', profession: 'Professora', instagram: '@marilima', whatsappSuffix: '003' },
  { name: 'Pedro Santos', profession: 'Empreendedor', instagram: '@pedros.santos', whatsappSuffix: '004' },
  { name: 'Fernanda Carvalho', profession: 'Fisioterapeuta', instagram: '@fernandac', whatsappSuffix: '005' },
  { name: 'João Mendes', profession: 'Advogado', instagram: '@jmendes', whatsappSuffix: '006' },
  { name: 'Beatriz Rocha', profession: 'Médica', instagram: '@beatrocha', whatsappSuffix: '007' },
  { name: 'Rafael Costa', profession: 'Arquiteto', instagram: '@rafa.costa', whatsappSuffix: '008' },
  { name: 'Carolina Pereira', profession: 'Marketing Digital', instagram: '@carol.p', whatsappSuffix: '009' },
  { name: 'Gustavo Almeida', profession: 'Músico', instagram: '@gustavo.play', whatsappSuffix: '010' }
];

const groupTemplates = [
  { name: 'Célula Central', type: 'CELL', description: 'Célula para jovens casais com encontros semanais nas quartas.', emoji: '🏠' },
  { name: 'Célula Famílias', type: 'CELL', description: 'Célula focada em famílias com filhos pequenos.', emoji: '🏡' },
  { name: 'Ministério de Louvor', type: 'MINISTRY', description: 'Equipe de louvor e adoração. Ensaios aos domingos.', emoji: '🎵' },
  { name: 'Grupo de Empreendedores', type: 'PROFESSION', description: 'Rede de apoio e networking para empreendedores cristãos.', emoji: '💼' },
  { name: 'Pelada Unida', type: 'SPORT', description: 'Futebol recreativo toda sexta-feira à noite.', emoji: '⚽' },
  { name: 'Clube do Cinema & Café', type: 'HOBBY', description: 'Debates sobre filmes e séries com uma boa xícara de café.', emoji: '🎬' }
];

const createInterestTags = async () => {
  const sports = [
    { name: 'Futebol', category: 'ESPORTE', emoji: '⚽' },
    { name: 'Vôlei', category: 'ESPORTE', emoji: '🏐' },
    { name: 'Corrida', category: 'ESPORTE', emoji: '🏃' },
    { name: 'Academia', category: 'ESPORTE', emoji: '💪' },
    { name: 'Ciclismo', category: 'ESPORTE', emoji: '🚴' },
    { name: 'Natação', category: 'ESPORTE', emoji: '🏊' }
  ];

  const hobbies = [
    { name: 'Música', category: 'HOBBY', emoji: '🎵' },
    { name: 'Fotografia', category: 'HOBBY', emoji: '📷' },
    { name: 'Leitura', category: 'HOBBY', emoji: '📚' },
    { name: 'Café & Conversas', category: 'HOBBY', emoji: '☕' },
    { name: 'Viagens', category: 'HOBBY', emoji: '✈️' }
  ];

  const lifeStages = [
    { name: 'Solteiro', category: 'FASE_VIDA', emoji: '🙋' },
    { name: 'Casado', category: 'FASE_VIDA', emoji: '💑' },
    { name: 'Pais de Primeira Viagem', category: 'FASE_VIDA', emoji: '👶' },
    { name: 'Jovem Profissional', category: 'FASE_VIDA', emoji: '🧑‍💼' }
  ];

  const areas = [
    { name: 'Tecnologia', category: 'AREA_INTERESSE', emoji: '💻' },
    { name: 'Empreendedorismo', category: 'AREA_INTERESSE', emoji: '🚀' },
    { name: 'Educação', category: 'AREA_INTERESSE', emoji: '📖' },
    { name: 'Saúde & Bem-estar', category: 'AREA_INTERESSE', emoji: '🩺' }
  ];

  const tags = [...sports, ...hobbies, ...lifeStages, ...areas];
  await InterestTag.insertMany(tags);
  return tags.length;
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Promise.all([
      Church.deleteMany({}),
      User.deleteMany({}),
      Group.deleteMany({}),
      GroupMember.deleteMany({}),
      InterestTag.deleteMany({}),
      Event.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    const interestCount = await createInterestTags();
    console.log(`✅ Inserted ${interestCount} interest tags`);

    const allEvents = [];

    for (const [index, churchData] of churchesData.entries()) {
      const church = new Church(churchData);
      await church.save();

      console.log(`\n➡️  Seeding church: ${church.name}`);

      const adminUser = await User.create({
        church_id: church._id,
        name: church.admin_name,
        email: church.admin_email,
        phone: `11${index + 1}9000000`,
        show_profile: true,
        show_whatsapp: true,
        show_instagram: false,
        whatsapp: `11${index + 1}9000000`,
        profession: 'Pastor',
        is_new: false,
        is_church_admin: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60)
      });

      const churchSlug = slugify(church.city || church.name);
      const memberDocs = [];

      for (const [mIndex, profile] of memberProfiles.entries()) {
        const email = `${slugify(profile.name)}.${churchSlug}${mIndex}@unichurch.com`;
        const member = await User.create({
          church_id: church._id,
          name: profile.name,
          email,
          phone: `11${index + 1}9${(80000000 + mIndex * 137 + index * 1000).toString().slice(-8)}`,
          whatsapp: `11${index + 1}9${(80000000 + mIndex * 137 + index * 1000).toString().slice(-8)}`,
          show_whatsapp: mIndex % 2 === 0,
          show_profile: true,
          instagram: profile.instagram,
          show_instagram: Boolean(profile.instagram),
          profession: profile.profession,
          is_new: mIndex >= memberProfiles.length - 2,
          created_at: new Date(Date.now() - (mIndex + 2) * 1000 * 60 * 60 * 24)
        });
        memberDocs.push(member);

        if (mIndex < 3) {
          allEvents.push({
            church_id: church._id,
            user_id: member._id,
            type: 'NEW_MEMBER',
            created_at: new Date(Date.now() - (mIndex + 1) * 1000 * 60 * 60 * 12)
          });
        }
      }

      const membersPool = [adminUser, ...memberDocs];

      const churchGroupsData = groupTemplates.map((template, gIndex) => ({
        ...template,
        church_id: church._id,
        name: `${template.name} ${church.city.split(' ')[0]}`,
        description: `${template.description} (${church.city})`,
        created_at: new Date(Date.now() - (gIndex + 1) * 1000 * 60 * 60 * 6)
      }));

      const createdGroups = await Group.insertMany(churchGroupsData);
      const membershipDocs = [];

      for (const group of createdGroups) {
        const randomMembers = shuffleArray(memberDocs).slice(0, 4 + (group.type === 'CELL' ? 1 : 0));
        const groupMembers = [adminUser, ...randomMembers];

        groupMembers.forEach((member, memberIdx) => {
          membershipDocs.push({
            group_id: group._id,
            user_id: member._id,
            joined_at: new Date(Date.now() - (memberIdx + 1) * 1000 * 60 * 60 * 2)
          });

          if (member._id.toString() !== adminUser._id.toString()) {
            const eventType =
              group.type === 'CELL' && memberIdx === 1 ? 'FIRST_CELL' : 'JOIN_GROUP';
            allEvents.push({
              church_id: church._id,
              user_id: member._id,
              group_id: group._id,
              type: eventType,
              created_at: new Date(Date.now() - (memberIdx + 2) * 1000 * 60 * 30)
            });
          }
        });

        if (group.type === 'CELL') {
          const idsToUpdate = groupMembers.map((member) => member._id);
          await User.updateMany(
            { _id: { $in: idsToUpdate } },
            { cell_id: group._id }
          );
        }
      }

      await GroupMember.insertMany(membershipDocs);

      console.log(
        `   • ${memberDocs.length + 1} membros (${adminUser.name} + ${memberDocs.length})`
      );
      console.log(`   • ${createdGroups.length} grupos criados`);
    }

    if (allEvents.length > 0) {
      await Event.insertMany(allEvents);
      console.log(`\n🗞️  ${allEvents.length} eventos gerados para o mural`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('📋 Summary:');
    console.log(`   Churches: ${churchesData.length}`);
    console.log(`   Members per church: ${memberProfiles.length + 1}`);
    console.log(`   Groups per church: ${groupTemplates.length}`);
    console.log(`   Interest Tags: ${interestCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

