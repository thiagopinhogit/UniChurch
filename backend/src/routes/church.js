const express = require('express');
const router = express.Router();
const Church = require('../models/Church');
const User = require('../models/User');

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Find church by admin email
    const church = await Church.findOne({ admin_email: email.toLowerCase() });
    
    if (!church) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Check password
    const isPasswordValid = await church.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Criar ou buscar User correspondente ao admin
    let adminUser = await User.findOne({ 
      church_id: church._id, 
      email: church.admin_email 
    });

    if (!adminUser) {
      // Criar User para o admin
      adminUser = new User({
        church_id: church._id,
        name: church.admin_name,
        email: church.admin_email,
        is_church_admin: true,
        show_profile: true
      });
      await adminUser.save();
      console.log('✅ User criado para admin da igreja:', adminUser._id);
    }

    // Return church data without password + user_id
    const churchData = church.toObject();
    delete churchData.admin_password;
    churchData.admin_user_id = adminUser._id; // ID do User do admin

    res.json({
      message: 'Login realizado com sucesso',
      church: churchData,
      isAdmin: true
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Get all churches (for search functionality)
router.get('/all', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    // Busca todas as igrejas
    const churches = await Church.find({}).limit(100);

    // Se tiver coordenadas, adiciona distância calculada
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      const churchesWithDistance = churches.map(church => {
        if (church.location && church.location.coordinates) {
          const distance = calculateDistance(lat, lng, church.location.coordinates[1], church.location.coordinates[0]);
          return {
            ...church.toObject(),
            distance: Math.round(distance * 10) / 10 // Arredonda para 1 casa decimal
          };
        }
        return church.toObject();
      });

      // Ordena por distância (as sem localização ficam no final)
      churchesWithDistance.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

      return res.json(churchesWithDistance);
    }

    // Sem coordenadas, retorna todas em ordem alfabética
    res.json(churches.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby churches
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius);

    // Busca igrejas próximas usando geoespacial
    const churches = await Church.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat] // [longitude, latitude]
          },
          $maxDistance: radiusInKm * 1000 // Converter km para metros
        }
      }
    }).limit(20);

    // Adiciona distância calculada
    const churchesWithDistance = churches.map(church => {
      const distance = calculateDistance(lat, lng, church.location.coordinates[1], church.location.coordinates[0]);
      return {
        ...church.toObject(),
        distance: Math.round(distance * 10) / 10 // Arredonda para 1 casa decimal
      };
    });

    res.json(churchesWithDistance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get church by QR code
router.get('/qr/:qr_code_id', async (req, res) => {
  try {
    const church = await Church.findOne({ qr_code_id: req.params.qr_code_id });
    if (!church) {
      return res.status(404).json({ error: 'Church not found' });
    }
    res.json(church);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get church by ID
router.get('/:id', async (req, res) => {
  try {
    const church = await Church.findById(req.params.id);
    if (!church) {
      return res.status(404).json({ error: 'Church not found' });
    }
    res.json(church);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create church (admin only - simplified for MVP)
router.post('/', async (req, res) => {
  try {
    const { admin_email, admin_password } = req.body;

    // Validate admin credentials
    if (!admin_email || !admin_password) {
      return res.status(400).json({ error: 'Email e senha do administrador são obrigatórios' });
    }

    // Check if email already exists
    const existingChurch = await Church.findOne({ admin_email: admin_email.toLowerCase() });
    if (existingChurch) {
      return res.status(400).json({ error: 'Já existe uma igreja cadastrada com este email' });
    }

    const church = new Church(req.body);
    await church.save();
    
    // Criar User para o admin automaticamente
    const adminUser = new User({
      church_id: church._id,
      name: church.admin_name,
      email: church.admin_email,
      is_church_admin: true,
      show_profile: true
    });
    await adminUser.save();
    
    console.log('✅ Igreja e User admin criados:', {
      church_id: church._id,
      admin_user_id: adminUser._id
    });
    
    // Return without password + add admin_user_id
    const churchData = church.toObject();
    delete churchData.admin_password;
    churchData.admin_user_id = adminUser._id;
    
    res.status(201).json(churchData);
  } catch (error) {
    console.error('Create church error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      if (error.keyPattern?.qr_code_id) {
        return res.status(400).json({ error: 'Já existe uma igreja com este código QR' });
      }
      if (error.keyPattern?.admin_email) {
        return res.status(400).json({ error: 'Já existe uma igreja cadastrada com este email' });
      }
    }
    res.status(400).json({ error: error.message });
  }
});

// Update church settings
router.patch('/:id/settings', async (req, res) => {
  try {
    const { allow_members_create_groups } = req.body;
    
    const church = await Church.findById(req.params.id);
    if (!church) {
      return res.status(404).json({ error: 'Church not found' });
    }

    if (allow_members_create_groups !== undefined) {
      church.allow_members_create_groups = allow_members_create_groups;
    }

    await church.save();
    
    const churchData = church.toObject();
    delete churchData.admin_password;
    
    res.json(churchData);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update church (full update)
router.put('/:id', async (req, res) => {
  try {
    const church = await Church.findById(req.params.id);
    if (!church) {
      return res.status(404).json({ error: 'Church not found' });
    }

    // Fields that can be updated
    const allowedUpdates = ['name', 'city', 'address', 'cep', 'admin_name', 'admin_email', 'allow_members_create_groups', 'location', 'logo_url'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        church[field] = req.body[field];
      }
    });

    await church.save();
    
    const churchData = church.toObject();
    delete churchData.admin_password;
    
    res.json(churchData);
  } catch (error) {
    console.error('Update church error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Função auxiliar para calcular distância entre dois pontos (fórmula de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;

