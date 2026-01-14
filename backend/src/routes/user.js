const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Church = require('../models/Church');
const UserInterest = require('../models/UserInterest');
const GroupMember = require('../models/GroupMember');
const Event = require('../models/Event');

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Member Login with Email/Password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Find user by email only - must explicitly select password
    const user = await User.findOne({ 
      email: email.toLowerCase()
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Check if user has password (might be OAuth only)
    if (!user.password) {
      return res.status(401).json({ 
        error: 'Esta conta usa login social. Por favor, use Google ou Apple.' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Get user interests
    const interests = await UserInterest.find({ user_id: user._id })
      .populate('interest_tag_id')
      .lean();
    
    // Get church data
    const church = await Church.findById(user.church_id).lean();
    
    // Return user data without password
    const userData = user.toObject();
    delete userData.password;
    userData.interests = interests.map(i => i.interest_tag_id);
    userData.church_name = church?.name;

    res.json({
      message: 'Login realizado com sucesso',
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Member Register with Email/Password
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, church_id } = req.body;

    // Validation
    if (!email || !password || !name || !church_id) {
      return res.status(400).json({ 
        error: 'Email, senha, nome e igreja são obrigatórios' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'A senha deve ter no mínimo 6 caracteres' 
      });
    }

    // Check if email already exists in this church
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      church_id 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Este email já está cadastrado nesta igreja' 
      });
    }

    // Check if church exists
    const church = await Church.findById(church_id);
    if (!church) {
      return res.status(404).json({ error: 'Igreja não encontrada' });
    }

    // Try to get Instagram photo if provided
    let photoUrl = req.body.photo_url;
    if (req.body.instagram && !photoUrl) {
      photoUrl = await getInstagramPhotoUrl(req.body.instagram);
    }

    // Create user
    const user = new User({
      ...req.body,
      email: email.toLowerCase(),
      password,
      auth_provider: 'email',
      photo_url: photoUrl
    });

    await user.save();

    // Create NEW_MEMBER event for mural
    const event = new Event({
      church_id: user.church_id,
      user_id: user._id,
      type: 'NEW_MEMBER'
    });
    await event.save();

    // Get user without password
    const userWithoutPassword = await User.findById(user._id);

    res.status(201).json({
      message: 'Conta criada com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
});

// OAuth Login/Register (Google or Apple)
router.post('/oauth', async (req, res) => {
  try {
    const { 
      provider, // 'google' or 'apple'
      provider_user_id, 
      email, 
      name, 
      photo_url,
      church_id 
    } = req.body;

    // Validation
    if (!provider || !provider_user_id || !email || !name || !church_id) {
      return res.status(400).json({ 
        error: 'Dados do provedor OAuth incompletos' 
      });
    }

    if (!['google', 'apple'].includes(provider)) {
      return res.status(400).json({ 
        error: 'Provedor não suportado' 
      });
    }

    // Check if church exists
    const church = await Church.findById(church_id);
    if (!church) {
      return res.status(404).json({ error: 'Igreja não encontrada' });
    }

    // Check if user already exists with this provider
    let user = await User.findOne({ 
      provider_user_id,
      auth_provider: provider
    });

    let isNewUser = false;

    if (!user) {
      // Check if email already exists in this church
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        church_id 
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Este email já está cadastrado. Use o método de login original.' 
        });
      }

      // Create new user
      user = new User({
        ...req.body,
        email: email.toLowerCase(),
        auth_provider: provider,
        provider_user_id,
        photo_url: photo_url || null
      });

      await user.save();
      isNewUser = true;

      // Create NEW_MEMBER event for mural
      const event = new Event({
        church_id: user.church_id,
        user_id: user._id,
        type: 'NEW_MEMBER'
      });
      await event.save();
    }

    // Get user interests
    const interests = await UserInterest.find({ user_id: user._id })
      .populate('interest_tag_id')
      .lean();
    
    const userData = user.toObject();
    userData.interests = interests.map(i => i.interest_tag_id);

    res.status(isNewUser ? 201 : 200).json({
      message: isNewUser ? 'Conta criada com sucesso' : 'Login realizado com sucesso',
      user: userData,
      isNewUser
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper function to get Instagram profile photo
async function getInstagramPhotoUrl(username) {
  if (!username || username.length < 2) return null;
  
  try {
    const cleanUsername = username.replace('@', '').trim();
    const fetch = (await import('node-fetch')).default;
    
    // Método 1: Tenta buscar via página pública do Instagram
    // Esta abordagem faz scraping simples da página pública
    const profileUrl = `https://www.instagram.com/${cleanUsername}/?__a=1&__d=dis`;
    
    console.log(`Tentando buscar foto do perfil do Instagram: @${cleanUsername}`);
    
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      
      // Se retornar JSON (método __a=1)
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const profilePicUrl = data?.graphql?.user?.profile_pic_url_hd || 
                            data?.graphql?.user?.profile_pic_url ||
                            data?.user?.profile_pic_url_hd ||
                            data?.user?.profile_pic_url;
        
        if (profilePicUrl) {
          console.log(`✅ Foto do Instagram encontrada: @${cleanUsername}`);
          return profilePicUrl;
        }
      } else {
        // Se retornar HTML, faz scraping básico
        const html = await response.text();
        
        // Procura por padrões de URL da foto de perfil no HTML
        const patterns = [
          /"profile_pic_url_hd":"([^"]+)"/,
          /"profile_pic_url":"([^"]+)"/,
          /property="og:image"\s+content="([^"]+)"/,
          /"profilePage_[^"]*":"([^"]+)"/
        ];
        
        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            const photoUrl = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
            console.log(`✅ Foto do Instagram encontrada via scraping: @${cleanUsername}`);
            return photoUrl;
          }
        }
      }
    }
    
    // Método 2: Fallback - Tenta usar serviço de proxy de imagens do Instagram
    // Esta URL geralmente funciona para perfis públicos
    const fallbackUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
    
    try {
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'X-Ig-App-Id': '936619743392459'
        },
        timeout: 10000
      });
      
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        const profilePicUrl = data?.data?.user?.profile_pic_url_hd || 
                            data?.data?.user?.profile_pic_url;
        
        if (profilePicUrl) {
          console.log(`✅ Foto do Instagram encontrada via API: @${cleanUsername}`);
          return profilePicUrl;
        }
      }
    } catch (fallbackError) {
      console.log('Fallback method failed:', fallbackError.message);
    }
    
    console.log(`❌ Não foi possível buscar foto do Instagram: @${cleanUsername}`);
  } catch (error) {
    console.log(`❌ Erro ao buscar foto do Instagram: ${error.message}`);
  }
  
  return null;
}

// Create new user (onboarding)
router.post('/', async (req, res) => {
  try {
    // Se o usuário forneceu Instagram mas não photo_url, tenta buscar
    if (req.body.instagram && !req.body.photo_url) {
      const photoUrl = await getInstagramPhotoUrl(req.body.instagram);
      if (photoUrl) {
        req.body.photo_url = photoUrl;
      }
    }

    const user = new User(req.body);
    await user.save();

    // Create NEW_MEMBER event for mural
    const event = new Event({
      church_id: user.church_id,
      user_id: user._id,
      type: 'NEW_MEMBER'
    });
    await event.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user by ID with interests
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('cell_id', 'name')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user interests
    const interests = await UserInterest.find({ user_id: user._id })
      .populate('interest_tag_id')
      .lean();
    
    user.interests = interests.map(i => i.interest_tag_id);

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle church admin status
router.patch('/:id/toggle-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.is_church_admin = !user.is_church_admin;
    await user.save();

    res.json({ 
      success: true, 
      is_church_admin: user.is_church_admin,
      user 
    });
  } catch (error) {
    console.error('Toggle admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add interest to user
router.post('/:id/interests', async (req, res) => {
  try {
    const { interest_tag_id } = req.body;
    
    const userInterest = new UserInterest({
      user_id: req.params.id,
      interest_tag_id
    });
    
    await userInterest.save();
    res.status(201).json(userInterest);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Interest already added' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Remove interest from user
router.delete('/:id/interests/:interest_tag_id', async (req, res) => {
  try {
    await UserInterest.deleteOne({
      user_id: req.params.id,
      interest_tag_id: req.params.interest_tag_id
    });
    res.json({ message: 'Interest removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users from a church (with privacy filter)
router.get('/church/:church_id/members', async (req, res) => {
  try {
    const users = await User.find({
      church_id: req.params.church_id,
      show_profile: true
    })
    .select('-email -phone')
    .lean();

    // Get interests for each user
    for (let user of users) {
      const interests = await UserInterest.find({ user_id: user._id })
        .populate('interest_tag_id')
        .lean();
      user.interests = interests.map(i => i.interest_tag_id);
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users from a church (admin route - no privacy filter)
router.get('/church/:church_id', async (req, res) => {
  try {
    const users = await User.find({ church_id: req.params.church_id })
      .sort({ created_at: -1 })
      .lean();
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get suggested users (based on common interests)
router.get('/:id/suggestions', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's interests
    const userInterests = await UserInterest.find({ user_id: req.params.id })
      .select('interest_tag_id')
      .lean();
    const interestIds = userInterests.map(i => i.interest_tag_id.toString());

    // Find users with common interests
    const usersWithCommonInterests = await UserInterest.find({
      interest_tag_id: { $in: interestIds },
      user_id: { $ne: req.params.id }
    })
    .populate({
      path: 'user_id',
      match: { 
        church_id: currentUser.church_id,
        show_profile: true 
      }
    })
    .lean();

    // Calculate scores
    const scoreMap = {};
    for (let ui of usersWithCommonInterests) {
      if (ui.user_id) {
        const userId = ui.user_id._id.toString();
        scoreMap[userId] = scoreMap[userId] || { user: ui.user_id, score: 0, interests: [] };
        scoreMap[userId].score += 1;
      }
    }

    // Add bonus for same cell
    for (let userId in scoreMap) {
      const user = scoreMap[userId].user;
      if (user.cell_id && currentUser.cell_id && 
          user.cell_id.toString() === currentUser.cell_id.toString()) {
        scoreMap[userId].score += 1;
      }
    }

    // Convert to array and sort by score
    let suggestions = Object.values(scoreMap)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => s.user);

    // Get interests for each suggested user
    for (let user of suggestions) {
      const interests = await UserInterest.find({ user_id: user._id })
        .populate('interest_tag_id')
        .lean();
      user.interests = interests.map(i => i.interest_tag_id);
    }

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Give welcome to a user
router.post('/:id/welcome', async (req, res) => {
  try {
    const { from_user_id, event_id } = req.body;
    let targetEvent = null;

    if (event_id) {
      targetEvent = await Event.findById(event_id);

      if (!targetEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (targetEvent.type !== 'NEW_MEMBER') {
        return res.status(400).json({ error: 'Welcomes permitidos apenas para novos membros' });
      }

      if (targetEvent.user_id.toString() !== req.params.id) {
        return res.status(400).json({ error: 'Evento não pertence a este usuário' });
      }
    }
    
    const WelcomeAction = require('../models/WelcomeAction');
    const welcomeAction = new WelcomeAction({
      from_user_id,
      to_user_id: req.params.id,
      event_id
    });
    
    await welcomeAction.save();
    
    // Increment welcome count on user
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { welcome_count: 1 }
    });

    // Increment welcome count on event if event_id is provided
    if (targetEvent) {
      await Event.findByIdAndUpdate(targetEvent._id, {
        $inc: { welcome_count: 1 }
      });
    }

    res.status(201).json({ message: 'Welcome sent' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already welcomed this user for this event' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete user account (GDPR/LGPD compliance)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const WelcomeAction = require('../models/WelcomeAction');

    // Delete all user-related data
    await Promise.all([
      // Remove user interests
      UserInterest.deleteMany({ user_id: req.params.id }),
      
      // Remove user from all groups
      GroupMember.deleteMany({ user_id: req.params.id }),
      
      // Remove welcome actions (sent and received)
      WelcomeAction.deleteMany({
        $or: [
          { from_user_id: req.params.id },
          { to_user_id: req.params.id }
        ]
      }),
      
      // Remove user's events (NEW_MEMBER events)
      Event.deleteMany({ user_id: req.params.id }),
    ]);

    // Finally, delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Conta deletada com sucesso. Todos os seus dados foram removidos.' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
});

module.exports = router;

