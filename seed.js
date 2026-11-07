const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const TimelineEvent = require('./models/TimelineEvent');
const MapLocation = require('./models/MapLocation');
const Biography = require('./models/Biography');
const Video = require('./models/Video');
const Document = require('./models/Document');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // =============================================
    // 1. Create admin user if not exists
    // =============================================
    let adminUser = await User.findOne({ username: 'ismaelgit20' });
    if (!adminUser) {
      adminUser = new User({
        username: 'ismaelgit20',
        password: 'ismaelgit20123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Usuario admin creado: ismaelgit20');
    } else {
      console.log('ℹ️  Usuario admin ya existe: ismaelgit20');
    }

    // =============================================
    // 2. Seed Timeline Events (5 key historical events)
    // =============================================
    const timelineCount = await TimelineEvent.countDocuments();
    if (timelineCount === 0) {
      const timelineEvents = [
        {
          year: 1945,
          title: 'Nacimiento en La Libertad, Chontales',
          description: 'José Daniel Ortega Saavedra nace el 11 de noviembre de 1945 en La Libertad, departamento de Chontales, Nicaragua. Hijo de Daniel Ortega Cerda y Lidia Saavedra.',
          category: 'personal',
          imageUrl: '/assets/daniel-ortega.jpg',
          detailedContent: 'Daniel Ortega Saavedra nació en el seno de una familia de clase media en el municipio de La Libertad, Chontales. Su padre, Daniel Ortega Cerda, y su madre, Lidia Saavedra, fueron figuras importantes en su formación. Desde joven, la familia se trasladó a Managua, donde Daniel comenzaría su formación política y académica que marcaría el rumbo de su vida.',
          sources: ['Archivo Nacional de Nicaragua', 'Registro Civil de La Libertad'],
          createdBy: adminUser._id
        },
        {
          year: 1963,
          title: 'Inicio del Activismo Político',
          description: 'Daniel Ortega se une al Frente Sandinista de Liberación Nacional (FSLN), fundado en 1961 por Carlos Fonseca, Tomás Borge y Silvio Mayorga.',
          category: 'politico',
          imageUrl: '/assets/ortega-lula-2010.jpg',
          detailedContent: 'A los 18 años, Daniel Ortega se integra formalmente al FSLN, comenzando una vida de lucha clandestina contra la dictadura de la familia Somoza. Su compromiso político lo llevó a participar en actividades revolucionarias que definirían la historia de Nicaragua. Durante este período, fue encarcelado y pasó siete años en prisión.',
          sources: ['Historia del FSLN', 'Testimonios históricos'],
          createdBy: adminUser._id
        },
        {
          year: 1979,
          title: 'Triunfo de la Revolución Sandinista',
          description: 'El 19 de julio de 1979, el FSLN derroca la dictadura somocista. Daniel Ortega se convierte en coordinador de la Junta de Gobierno de Reconstrucción Nacional.',
          category: 'politico',
          imageUrl: '/assets/ortega-2014.jpg',
          detailedContent: 'La Revolución Popular Sandinista triunfó el 19 de julio de 1979, poniendo fin a más de 40 años de la dictadura de la familia Somoza. Daniel Ortega, como miembro de la Dirección Nacional del FSLN, asumió el cargo de coordinador de la Junta de Gobierno de Reconstrucción Nacional. Posteriormente, en 1984, fue elegido Presidente de Nicaragua en las primeras elecciones democráticas tras la revolución, gobernando hasta 1990.',
          sources: ['Archivo de la Revolución Sandinista', 'Documentos de la Junta de Gobierno'],
          createdBy: adminUser._id
        },
        {
          year: 2007,
          title: 'Retorno a la Presidencia',
          description: 'Daniel Ortega gana las elecciones presidenciales de 2006 y asume la presidencia el 10 de enero de 2007, regresando al poder después de 16 años.',
          category: 'politico',
          imageUrl: '/assets/ortega-2024.jpg',
          detailedContent: 'Tras tres intentos electorales fallidos (1990, 1996 y 2001), Daniel Ortega ganó las elecciones presidenciales de noviembre de 2006 con el 38% de los votos. Su retorno al poder marcó el inicio de una nueva etapa política en Nicaragua, con programas sociales enfocados en la reducción de la pobreza, la educación gratuita y la salud pública.',
          sources: ['Consejo Supremo Electoral de Nicaragua', 'Medios de comunicación nacionales'],
          createdBy: adminUser._id
        },
        {
          year: 2021,
          title: 'Continuidad en el Gobierno',
          description: 'Daniel Ortega gana las elecciones presidenciales de 2021, continuando su mandato presidencial con el apoyo del pueblo nicaragüense.',
          category: 'politico',
          imageUrl: '/assets/daniel-ortega.jpg',
          detailedContent: 'En las elecciones generales de noviembre de 2021, Daniel Ortega fue reelegido como Presidente de Nicaragua junto a la Vicepresidenta Rosario Murillo. Su gobierno ha continuado impulsando programas de desarrollo social, infraestructura, educación y salud en todo el territorio nacional.',
          sources: ['Consejo Supremo Electoral de Nicaragua'],
          createdBy: adminUser._id
        }
      ];

      await TimelineEvent.insertMany(timelineEvents);
      console.log('✅ 5 eventos de línea de tiempo creados');
    } else {
      console.log(`ℹ️  Ya existen ${timelineCount} eventos de línea de tiempo`);
    }

    // =============================================
    // 3. Seed Map Locations (5 locations in Nicaragua)
    // =============================================
    const mapCount = await MapLocation.countDocuments();
    if (mapCount === 0) {
      const mapLocations = [
        {
          name: 'Managua - Casa de Gobierno',
          description: 'Capital de Nicaragua y sede del gobierno nacional. Centro de la actividad política del país.',
          latitude: 12.1364,
          longitude: -86.2514,
          category: 'politico',
          year: 2007,
          details: 'Managua es la capital y ciudad más grande de Nicaragua. Aquí se encuentra la Casa de Gobierno desde donde Daniel Ortega ha dirigido los destinos del país durante sus mandatos presidenciales. La ciudad también fue escenario de eventos históricos durante la Revolución Sandinista de 1979.',
          createdBy: adminUser._id
        },
        {
          name: 'La Libertad, Chontales - Lugar de Nacimiento',
          description: 'Municipio donde nació Daniel Ortega Saavedra el 11 de noviembre de 1945.',
          latitude: 12.2167,
          longitude: -85.1667,
          category: 'personal',
          year: 1945,
          details: 'La Libertad es un municipio del departamento de Chontales, ubicado en la zona central de Nicaragua. Este pequeño pueblo ganadero es el lugar de nacimiento de Daniel Ortega Saavedra, marcando el inicio de una vida que transformaría la historia de Nicaragua.',
          createdBy: adminUser._id
        },
        {
          name: 'León - Ciudad Universitaria',
          description: 'Ciudad histórica sede de la UNAN-León, donde se gestaron movimientos estudiantiles importantes.',
          latitude: 12.4379,
          longitude: -86.8783,
          category: 'historico',
          year: 1963,
          details: 'León, la segunda ciudad más importante de Nicaragua, ha sido históricamente un centro de actividad intelectual y política. La Universidad Nacional Autónoma de Nicaragua (UNAN-León) fue cuna de movimientos estudiantiles que contribuyeron a la lucha revolucionaria. La ciudad jugó un papel crucial en la formación política de muchos líderes sandinistas.',
          createdBy: adminUser._id
        },
        {
          name: 'Matagalpa - Zona Cafetalera',
          description: 'Departamento montañoso del norte de Nicaragua, importante zona agrícola y escenario de lucha guerrillera.',
          latitude: 12.9256,
          longitude: -85.9178,
          category: 'historico',
          year: 1978,
          details: 'Matagalpa, conocida como la Perla del Septentrión, fue un territorio estratégico durante la insurrección contra la dictadura somocista. Sus montañas y valles sirvieron como bases guerrilleras del FSLN. Hoy es una de las principales zonas productoras de café del país.',
          createdBy: adminUser._id
        },
        {
          name: 'Estelí - Bastión Revolucionario',
          description: 'Ciudad del norte conocida como el "Diamante de las Segovias", clave en la insurrección popular.',
          latitude: 13.0909,
          longitude: -86.3537,
          category: 'historico',
          year: 1979,
          details: 'Estelí fue escenario de tres insurrecciones populares durante la lucha contra la dictadura somocista y se ganó el título de ciudad heroica. La valentía de sus habitantes fue fundamental para el triunfo de la Revolución Sandinista en 1979. Hoy sigue siendo un bastión de apoyo al sandinismo.',
          createdBy: adminUser._id
        }
      ];

      await MapLocation.insertMany(mapLocations);
      console.log('✅ 5 ubicaciones del mapa creadas');
    } else {
      console.log(`ℹ️  Ya existen ${mapCount} ubicaciones del mapa`);
    }

    // =============================================
    // 4. Seed Biography Sections (3 sections)
    // =============================================
    const bioCount = await Biography.countDocuments();
    if (bioCount === 0) {
      const biographySections = [
        {
          section: 'infancia',
          title: 'Infancia y Orígenes',
          content: 'José Daniel Ortega Saavedra nació el 11 de noviembre de 1945 en el municipio de La Libertad, departamento de Chontales, Nicaragua. Hijo de Daniel Ortega Cerda y Lidia Saavedra, creció en una familia de clase media que luego se trasladó a Managua.\n\nDesde temprana edad, Daniel mostró interés por la justicia social y la situación política de su país, que en ese entonces vivía bajo la dictadura de la familia Somoza. La realidad socioeconómica de Nicaragua, marcada por la desigualdad y la represión, influyó profundamente en la formación de su conciencia política.\n\nSu educación primaria y secundaria transcurrió en Managua, donde comenzó a tener contacto con ideas progresistas y movimientos estudiantiles que cuestionaban el orden establecido. Estos años de formación sentaron las bases de su futuro compromiso con la transformación social de Nicaragua.',
          imageUrl: '',
          order: 1,
          createdBy: adminUser._id
        },
        {
          section: 'juventud_revolucionaria',
          title: 'Juventud Revolucionaria y Lucha contra la Dictadura',
          content: 'En 1963, a los 18 años de edad, Daniel Ortega se incorporó al Frente Sandinista de Liberación Nacional (FSLN), organización fundada en 1961 por Carlos Fonseca Amador, Tomás Borge y Silvio Mayorga para luchar contra la dictadura de la familia Somoza.\n\nDurante la década de 1960, Ortega participó activamente en operaciones clandestinas del FSLN, lo que le costó ser capturado y encarcelado en 1967. Pasó siete años en la cárcel Modelo de Tipitapa, donde fue sometido a condiciones duras pero mantuvo firme su compromiso revolucionario.\n\nTras su liberación en 1974, producto de un operativo del FSLN, Daniel Ortega asumió un papel de liderazgo dentro de la organización. Se convirtió en miembro de la Dirección Nacional del FSLN y fue fundamental en la planificación y ejecución de la ofensiva final que llevaría al triunfo de la Revolución Sandinista el 19 de julio de 1979.\n\nEsta etapa de su vida forjó su carácter como líder político y su compromiso inquebrantable con la causa del pueblo nicaragüense.',
          imageUrl: '',
          order: 2,
          createdBy: adminUser._id
        },
        {
          section: 'presidencia',
          title: 'Presidencia y Liderazgo Nacional',
          content: 'La carrera presidencial de Daniel Ortega ha marcado dos grandes períodos en la historia de Nicaragua.\n\nPrimer período (1985-1990):\nTras el triunfo revolucionario de 1979, Ortega coordinó la Junta de Gobierno de Reconstrucción Nacional. En 1984, fue elegido Presidente de Nicaragua en elecciones democráticas, asumiendo el cargo el 10 de enero de 1985. Durante este período, enfrentó la guerra contrarrevolucionaria financiada por Estados Unidos, implementó reformas agrarias, campañas de alfabetización y programas de salud pública.\n\nSegundo período (2007-presente):\nDespués de tres intentos electorales (1990, 1996, 2001), Daniel Ortega ganó las elecciones de 2006 y asumió nuevamente la presidencia el 10 de enero de 2007. Desde entonces, su gobierno ha implementado programas sociales significativos:\n\n- Programa Hambre Cero para la seguridad alimentaria\n- Plan Techo para vivienda digna\n- Programa Usura Cero para microcréditos\n- Expansión de la red eléctrica nacional\n- Construcción de carreteras y hospitales\n- Programa de educación gratuita y mejora del sistema de salud\n\nBajo su liderazgo, Nicaragua ha experimentado avances en reducción de la pobreza, acceso a servicios básicos e infraestructura nacional. Ha sido reelegido en 2011, 2016 y 2021, manteniendo su compromiso con el desarrollo social y económico del país.',
          imageUrl: '',
          order: 3,
          createdBy: adminUser._id
        }
      ];

      await Biography.insertMany(biographySections);
      console.log('✅ 3 secciones de biografía creadas');
    } else {
      console.log(`ℹ️  Ya existen ${bioCount} secciones de biografía`);
    }

    // =============================================
    // 5. Seed Videos (3 sample videos)
    // =============================================
    const videoCount = await Video.countDocuments();
    if (videoCount === 0) {
      const videos = [
        {
          title: 'Discurso en la Asamblea General de la ONU 2007',
          description: 'Primer discurso de Daniel Ortega ante la Asamblea General de las Naciones Unidas tras su retorno a la presidencia en 2007. Abordó temas de soberanía, desarrollo y justicia social para los pueblos latinoamericanos.',
          videoUrl: 'https://www.youtube.com/watch?v=example_onu_2007',
          thumbnailUrl: '',
          category: 'discurso',
          duration: '45:00',
          date: '2007-09-25',
          source: 'Naciones Unidas / Canal oficial',
          createdBy: adminUser._id
        },
        {
          title: 'Discurso 40 Aniversario de la Revolución Sandinista',
          description: 'Discurso conmemorativo del 40 aniversario del triunfo de la Revolución Popular Sandinista, celebrado en la Plaza de la Fe en Managua el 19 de julio de 2019.',
          videoUrl: 'https://www.youtube.com/watch?v=example_40aniversario',
          thumbnailUrl: '',
          category: 'discurso',
          duration: '1:20:00',
          date: '2019-07-19',
          source: 'Canal 4 Nicaragua',
          createdBy: adminUser._id
        },
        {
          title: 'Entrevista Exclusiva en TeleSUR 2018',
          description: 'Entrevista exclusiva con Daniel Ortega transmitida por TeleSUR, donde abordó la situación política de Nicaragua, los programas sociales y las relaciones internacionales.',
          videoUrl: 'https://www.youtube.com/watch?v=example_telesur_2018',
          thumbnailUrl: '',
          category: 'entrevista',
          duration: '55:00',
          date: '2018-07-23',
          source: 'TeleSUR',
          createdBy: adminUser._id
        }
      ];

      await Video.insertMany(videos);
      console.log('✅ 3 videos de ejemplo creados');
    } else {
      console.log(`ℹ️  Ya existen ${videoCount} videos`);
    }

    // =============================================
    // 6. Seed Documents (3 sample documents)
    // =============================================
    const docCount = await Document.countDocuments();
    if (docCount === 0) {
      const documents = [
        {
          title: 'Programa de Gobierno Nacional 2007-2012',
          description: 'Documento oficial del plan de gobierno presentado por Daniel Ortega para su primer período de retorno a la presidencia. Incluye los ejes estratégicos de desarrollo social, económico e institucional.',
          fileUrl: '/uploads/programa_gobierno_2007.pdf',
          category: 'informe',
          author: 'Gobierno de Reconciliación y Unidad Nacional',
          date: '2007-01-10',
          pages: 120,
          downloadCount: 0,
          createdBy: adminUser._id
        },
        {
          title: 'La Revolución Sandinista: Contexto y Significado Histórico',
          description: 'Artículo académico que analiza el contexto histórico, las causas y el significado de la Revolución Sandinista de 1979 y el papel de Daniel Ortega en el proceso revolucionario.',
          fileUrl: '/uploads/articulo_revolucion_sandinista.pdf',
          category: 'articulo',
          author: 'Instituto de Historia de Nicaragua y Centroamérica',
          date: '2009-07-19',
          pages: 45,
          downloadCount: 0,
          createdBy: adminUser._id
        },
        {
          title: 'Informe de Logros Sociales 2007-2020',
          description: 'Informe compilatorio de los principales logros en materia social alcanzados durante los gobiernos del FSLN bajo el liderazgo de Daniel Ortega, incluyendo estadísticas de educación, salud, vivienda e infraestructura.',
          fileUrl: '/uploads/informe_logros_sociales.pdf',
          category: 'informe',
          author: 'Gobierno de Reconciliación y Unidad Nacional',
          date: '2020-12-01',
          pages: 200,
          downloadCount: 0,
          createdBy: adminUser._id
        }
      ];

      await Document.insertMany(documents);
      console.log('✅ 3 documentos de ejemplo creados');
    } else {
      console.log(`ℹ️  Ya existen ${docCount} documentos`);
    }

    // =============================================
    // Summary
    // =============================================
    console.log('\n========================================');
    console.log('🌱 Seed completado exitosamente');
    console.log('========================================');

    const totalTimeline = await TimelineEvent.countDocuments();
    const totalMap = await MapLocation.countDocuments();
    const totalBio = await Biography.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalDocs = await Document.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log(`👤 Usuarios: ${totalUsers}`);
    console.log(`📅 Eventos de línea de tiempo: ${totalTimeline}`);
    console.log(`🗺️  Ubicaciones del mapa: ${totalMap}`);
    console.log(`📖 Secciones de biografía: ${totalBio}`);
    console.log(`🎥 Videos: ${totalVideos}`);
    console.log(`📄 Documentos: ${totalDocs}`);
    console.log('========================================\n');

    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
